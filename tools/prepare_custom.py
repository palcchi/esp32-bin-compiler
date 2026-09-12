import json
import re
from pathlib import Path

req = json.loads(Path('custom_build/request.json').read_text())
code = req.get('code', '')
preserve_ota = bool(req.get('preserveOta', False))

if preserve_ota:
    setup_pat = re.compile(r'\bvoid\s+setup\s*\(\s*\)')
    loop_pat = re.compile(r'\bvoid\s+loop\s*\(\s*\)')
    has_setup = bool(setup_pat.search(code))
    has_loop = bool(loop_pat.search(code))
    if has_setup:
        code = setup_pat.sub('void userSetup()', code, count=1)
    else:
        code += '\nvoid userSetup(){}\n'
    if has_loop:
        code = loop_pat.sub('void userLoop()', code, count=1)
    else:
        code += '\nvoid userLoop(){}\n'

    ota = r'''

#include <WiFi.h>
#include <WebServer.h>
#include <Update.h>

WebServer __vallianOtaServer(80);
TaskHandle_t __vallianOtaTaskHandle = nullptr;

void __vallianOtaTask(void* parameter) {
  for (;;) {
    __vallianOtaServer.handleClient();
    vTaskDelay(pdMS_TO_TICKS(2));
  }
}

void __vallianOtaSetup(){
  WiFi.persistent(false);
  WiFi.mode(WIFI_AP);
  WiFi.setSleep(false);
  delay(100);

  // Always expose a local recovery/update AP. No router is required.
  bool apStarted = WiFi.softAP("VALLIAN-ESP32", "12345678", 1, false, 4);
  if (!apStarted) {
    WiFi.mode(WIFI_OFF);
    delay(100);
    WiFi.mode(WIFI_AP);
    delay(100);
    WiFi.softAP("VALLIAN-ESP32", "12345678", 1, false, 4);
  }

  __vallianOtaServer.on("/", HTTP_GET, [](){
    __vallianOtaServer.send(200, "text/html", "<meta name='viewport' content='width=device-width'><h2>VALLIAN ESP32 OTA</h2><p>AP: VALLIAN-ESP32</p><form method='POST' action='/update' enctype='multipart/form-data'><input type='file' name='update' accept='.bin'><button>Upload firmware</button></form>");
  });
  __vallianOtaServer.on("/update", HTTP_POST, [](){
    bool ok = !Update.hasError();
    __vallianOtaServer.send(200, "text/plain", ok ? "OK - rebooting" : "Update failed");
    delay(250);
    if(ok) ESP.restart();
  }, [](){
    HTTPUpload& upload = __vallianOtaServer.upload();
    if(upload.status == UPLOAD_FILE_START){
      Update.begin(UPDATE_SIZE_UNKNOWN);
    } else if(upload.status == UPLOAD_FILE_WRITE){
      Update.write(upload.buf, upload.currentSize);
    } else if(upload.status == UPLOAD_FILE_END){
      Update.end(true);
    }
  });
  __vallianOtaServer.begin();

  // Run OTA independently so delays/blocking code in the user's loop cannot
  // make the update page unresponsive.
  xTaskCreatePinnedToCore(
    __vallianOtaTask,
    "vallian-ota",
    4096,
    nullptr,
    1,
    &__vallianOtaTaskHandle,
    0
  );
}

void setup(){
  // Bring recovery Wi-Fi up before user code. Even a slow user setup will not
  // remove the OTA path unless that code explicitly reconfigures Wi-Fi.
  __vallianOtaSetup();
  userSetup();
}

void loop(){
  userLoop();
}
'''
    code += ota

Path('.build/custom').mkdir(parents=True, exist_ok=True)
Path('.build/custom/custom.ino').write_text(code)
Path('.build/name.txt').write_text(str(req.get('name', 'Custom ESP32 Firmware'))[:60])
Path('.build/libs.txt').write_text('\n'.join(req.get('libraries', [])[:12]))
Path('.build/ota.txt').write_text('true' if preserve_ota else 'false')
