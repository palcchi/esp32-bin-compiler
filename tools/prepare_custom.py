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
<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f5f7"><style>
*{{box-sizing:border-box}}body{{margin:0;background:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif;padding:24px 16px}}.shell{{max-width:560px;margin:auto}}.brand{{display:flex;align-items:center;gap:10px;margin-bottom:18px}}.mark{{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(60,60,67,.12);border-radius:14px;background:rgba(255,255,255,.82);font-size:22px;font-weight:850}}small{{color:#8a8a90;font-size:10px;font-weight:800;letter-spacing:.12em}}h1{{margin:5px 0 6px;font-size:34px;letter-spacing:-.05em}}p{{margin:0;color:#7d7d82;font-size:14px;line-height:1.5}}.card{{margin-top:18px;padding:18px;border:1px solid rgba(60,60,67,.11);border-radius:24px;background:rgba(255,255,255,.86);box-shadow:0 20px 55px rgba(20,20,24,.08)}}.net{{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px;border-radius:16px;background:#f7f7fa}}.net b{{font-size:14px}}.pill{{padding:7px 9px;border-radius:999px;background:#1d1d1f;color:#fff;font-size:10px;font-weight:850}}label{{display:block;margin-top:16px;font-size:12px;font-weight:800}}input[type=file]{{width:100%;margin-top:8px;padding:14px;border:1px dashed rgba(60,60,67,.24);border-radius:14px;background:#fff}}button{{width:100%;height:50px;margin-top:10px;border:0;border-radius:14px;background:#f5cf3b;color:#1d1d1f;font-size:14px;font-weight:900}}.hint{{margin-top:10px;font-size:11px;color:#8a8a90}}.dot{{display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#2f9e55}}</style></head><body><main class="shell"><div class="brand"><div class="mark">V</div><div><small>VALLIAN LAB · ESP32</small><h1>Firmware Update</h1></div></div><p>Upload an application BIN directly to this ESP32 over its local Wi-Fi.</p><section class="card"><div class="net"><div><small>CONNECTED NETWORK</small><br><b>__SSID__</b></div><span class="pill"><span class="dot"></span>LOCAL OTA</span></div><form method="POST" action="/update" enctype="multipart/form-data"><label>Application BIN<input type="file" name="update" accept=".bin" required></label><button type="submit">Install Firmware</button></form><div class="hint">Device address: 192.168.4.1 · Keep this page open until the upload finishes.</div></section></main></body></html>
)VALLIANOTA";

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
    __vallianOtaServer.send(200, "text/html", ok ? "<meta name='viewport' content='width=device-width'><body style='font-family:-apple-system;background:#f5f5f7;padding:28px'><h2>Update complete</h2><p>ESP32 is restarting.</p></body>" : "<meta name='viewport' content='width=device-width'><body style='font-family:-apple-system;background:#f5f5f7;padding:28px'><h2>Update failed</h2><p>Try the application BIN again.</p></body>");
    delay(350); if(ok) ESP.restart();
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
Path('.build/libs.txt').write_text('\n'.join(req.get('libraries', [])[:12]))
Path('.build/ota.txt').write_text('true' if preserve_ota else 'false')
