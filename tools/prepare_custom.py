import json
import re
from pathlib import Path

req = json.loads(Path('custom_build/request.json').read_text())
code = req.get('code', '')
preserve_ota = bool(req.get('preserveOta', False))
ota_cfg = req.get('ota') or {}
ota_ssid = str(ota_cfg.get('ssid') or 'VALLIAN-ESP32').strip()[:32] or 'VALLIAN-ESP32'
ota_password = str(ota_cfg.get('password') if ota_cfg.get('password') is not None else '12345678')[:63]
if ota_password and len(ota_password) < 8:
    ota_password = '12345678'

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

    ssid_lit = json.dumps(ota_ssid)
    pass_lit = json.dumps(ota_password)
    ota = f'''

#include <WiFi.h>
#include <WebServer.h>
#include <Update.h>

WebServer __vallianOtaServer(80);
TaskHandle_t __vallianOtaTaskHandle = nullptr;
const char* __vallianOtaSsid = {ssid_lit};
const char* __vallianOtaPassword = {pass_lit};

const char __vallianOtaPage[] PROGMEM = R"VALLIANOTA(
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f5f7"><title>Vallian ESP32 OTA</title><style>
*{{box-sizing:border-box}}html,body{{margin:0;min-height:100%;background:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",system-ui,sans-serif}}body{{padding:18px 14px 28px}}.shell{{width:min(100%,560px);margin:0 auto}}.browser{{height:36px;display:flex;align-items:center;gap:6px;padding:0 12px;border:1px solid rgba(60,60,67,.11);border-bottom:0;border-radius:24px 24px 0 0;background:rgba(255,255,255,.82)}}.browser i{{width:7px;height:7px;border-radius:50%;background:#d7d7dc}}.browser span{{margin-left:auto;margin-right:auto;color:#6f6f75;font-size:10px;font-weight:700}}.device{{overflow:hidden;border:1px solid rgba(60,60,67,.11);border-radius:24px;background:#eef0f4;box-shadow:0 18px 50px rgba(20,20,24,.08)}}.browser+.body{{border-radius:0}}.body{{padding:24px 20px;background:#f2f3f6}}.kicker{{font-size:9px;font-weight:900;letter-spacing:.14em;color:#8a8a90}}h1{{margin:7px 0 5px;font-size:30px;line-height:1;letter-spacing:-.045em}}.sub{{margin:0;color:#77777d;font-size:12px;line-height:1.45}}.upload{{margin-top:20px;padding:17px;border:1px solid rgba(60,60,67,.1);border-radius:18px;background:rgba(255,255,255,.9)}}.upload strong{{display:block;font-size:14px}}.upload>span{{display:block;margin-top:4px;color:#85858a;font-size:11px;line-height:1.4}}.file{{position:relative;margin-top:13px;height:54px;border:1px dashed rgba(60,60,67,.22);border-radius:12px;background:#fff;display:grid;place-items:center;overflow:hidden;color:#777;font-size:11px;font-weight:700}}.file input{{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}}button{{width:100%;height:50px;margin-top:9px;border:0;border-radius:12px;background:#f5cf3b;color:#1d1d1f;font:900 12px -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;cursor:pointer}}button:active{{transform:scale(.985)}}.status{{display:flex;align-items:center;gap:7px;margin-top:14px;color:#85858a;font-size:10px}}.dot{{width:7px;height:7px;border-radius:50%;background:#34c759}}#picked{{white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;padding:0 12px}}@media(max-width:420px){{body{{padding:10px}}.body{{padding:20px 15px}}h1{{font-size:27px}}.upload{{padding:14px}}}}
</style></head><body><main class="shell"><section class="device"><div class="browser"><i></i><i></i><i></i><span>192.168.4.1</span></div><div class="body"><span class="kicker">VALLIAN LAB · ESP32</span><h1>Firmware Update</h1><p class="sub">__SSID__ · Local OTA</p><form method="POST" action="/update" enctype="multipart/form-data"><div class="upload"><strong>Choose application BIN</strong><span>Upload a new firmware build to this ESP32.</span><label class="file"><span id="picked">Select .bin file</span><input id="bin" type="file" name="update" accept=".bin,application/octet-stream" required onchange="document.getElementById('picked').textContent=this.files[0]?this.files[0].name:'Select .bin file'"></label><button type="submit">Install Firmware</button></div></form><div class="status"><i class="dot"></i><span>Local updater ready · 192.168.4.1</span></div></div></section></main></body></html>
)VALLIANOTA";

const char __vallianOtaDone[] PROGMEM = R"VALLIANOTADONE(
<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f5f7"><style>*{{box-sizing:border-box}}body{{margin:0;background:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;padding:18px}}.c{{max-width:520px;margin:15vh auto 0;padding:24px;border:1px solid rgba(60,60,67,.11);border-radius:24px;background:#fff;box-shadow:0 18px 50px rgba(20,20,24,.08)}}i{{display:block;width:12px;height:12px;border-radius:50%;background:#34c759;margin-bottom:16px}}h2{{margin:0 0 7px;font-size:28px;letter-spacing:-.04em}}p{{margin:0;color:#777;font-size:13px;line-height:1.5}}</style><div class="c"><i></i><h2>Update complete</h2><p>Firmware installed. ESP32 is restarting now.</p></div>
)VALLIANOTADONE";

void __vallianOtaTask(void* parameter) {{
  for (;;) {{
    __vallianOtaServer.handleClient();
    vTaskDelay(pdMS_TO_TICKS(2));
  }}
}}

void __vallianOtaSetup(){{
  WiFi.persistent(false);
  WiFi.mode(WIFI_AP);
  WiFi.setSleep(false);
  delay(100);
  bool apStarted = strlen(__vallianOtaPassword) ? WiFi.softAP(__vallianOtaSsid, __vallianOtaPassword, 1, false, 4) : WiFi.softAP(__vallianOtaSsid);
  if (!apStarted) {{
    WiFi.mode(WIFI_OFF); delay(100); WiFi.mode(WIFI_AP); delay(100);
    if (strlen(__vallianOtaPassword)) WiFi.softAP(__vallianOtaSsid, __vallianOtaPassword, 1, false, 4); else WiFi.softAP(__vallianOtaSsid);
  }}
  __vallianOtaServer.on("/", HTTP_GET, [](){{
    String page((const __FlashStringHelper*)__vallianOtaPage);
    page.replace("__SSID__", __vallianOtaSsid);
    __vallianOtaServer.send(200, "text/html", page);
  }});
  __vallianOtaServer.on("/update", HTTP_POST, [](){{
    bool ok = !Update.hasError();
    if (ok) __vallianOtaServer.send_P(200, "text/html", __vallianOtaDone);
    else __vallianOtaServer.send(500, "text/html", "<meta name='viewport' content='width=device-width,initial-scale=1'><body style='font-family:-apple-system;background:#f5f5f7;padding:24px'><h2>Update failed</h2><p>Try the application BIN again.</p></body>");
    delay(450); if(ok) ESP.restart();
  }}, [](){{
    HTTPUpload& upload = __vallianOtaServer.upload();
    if(upload.status == UPLOAD_FILE_START) Update.begin(UPDATE_SIZE_UNKNOWN);
    else if(upload.status == UPLOAD_FILE_WRITE) Update.write(upload.buf, upload.currentSize);
    else if(upload.status == UPLOAD_FILE_END) Update.end(true);
  }});
  __vallianOtaServer.begin();
  xTaskCreatePinnedToCore(__vallianOtaTask,"vallian-ota",4096,nullptr,1,&__vallianOtaTaskHandle,0);
}}

void setup(){{
  __vallianOtaSetup();
  userSetup();
}}

void loop(){{
  userLoop();
}}
'''
    code += ota

Path('.build/custom').mkdir(parents=True, exist_ok=True)
Path('.build/custom/custom.ino').write_text(code)
Path('.build/name.txt').write_text(str(req.get('name', 'Custom ESP32 Firmware'))[:60])
# Resolve common Arduino libraries directly from #include statements.
# The Libraries field stays optional; pasted Arduino IDE sketches should build
# without requiring users to repeat library names in a separate form field.
libraries = [str(x).strip() for x in req.get('libraries', [])[:12] if str(x).strip()]
include_names = set(re.findall(r'#include\s*[<"]([^>"]+)[>"]', code))

auto_libraries = {
    'DHT.h': ['DHT sensor library', 'Adafruit Unified Sensor'],
    'DHT_U.h': ['DHT sensor library', 'Adafruit Unified Sensor'],
    'Adafruit_Sensor.h': ['Adafruit Unified Sensor'],
    'Adafruit_GFX.h': ['Adafruit GFX Library'],
    'Adafruit_SSD1306.h': ['Adafruit SSD1306'],
}

for header in include_names:
    for library in auto_libraries.get(header, []):
        if library not in libraries:
            libraries.append(library)

Path('.build/libs.txt').write_text('\n'.join(libraries[:12]))
Path('.build/ota.txt').write_text('true' if preserve_ota else 'false')
