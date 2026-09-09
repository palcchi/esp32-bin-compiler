import json
from pathlib import Path

req = json.loads(Path('custom_build/request.json').read_text())
code = req.get('code', '')
Path('.build/custom').mkdir(parents=True, exist_ok=True)
Path('.build/custom/custom.ino').write_text(code)
Path('.build/name.txt').write_text(str(req.get('name', 'Custom ESP32 Firmware'))[:60])
Path('.build/libs.txt').write_text('\n'.join(req.get('libraries', [])[:12]))
Path('.build/ota.txt').write_text('true' if req.get('preserveOta', False) else 'false')
