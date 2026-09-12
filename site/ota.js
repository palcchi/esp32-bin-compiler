(()=>{
'use strict';
const $=s=>document.querySelector(s);const api=window.VallianOTA;
function fill(){const c=api.get();$('#otaSsid').value=c.ssid;$('#otaPassword').value=c.password;$('#otaEnabled').checked=c.enabled;preview()}
function preview(){$('#otaPreviewNetwork').textContent=($('#otaSsid').value.trim()||'VALLIAN-ESP32')+' · Local OTA'}
$('#otaSsid').addEventListener('input',preview);$('#toggleOtaPassword').onclick=()=>{const i=$('#otaPassword'),show=i.type==='password';i.type=show?'text':'password';$('#toggleOtaPassword').textContent=show?'Hide':'Show'};
$('#saveOta').onclick=()=>{const ssid=$('#otaSsid').value.trim(),password=$('#otaPassword').value;if(!ssid){$('#otaSaved').textContent='SSID tidak boleh kosong.';return}if(password&&password.length<8){$('#otaSaved').textContent='Password minimal 8 karakter.';return}const c=api.set({ssid,password,enabled:$('#otaEnabled').checked});fill();$('#otaSaved').textContent=`Saved · ${c.ssid}`;setTimeout(()=>$('#otaSaved').textContent='',1800)};
$('#resetOta').onclick=()=>{api.reset();fill();$('#otaSaved').textContent='Default restored.';setTimeout(()=>$('#otaSaved').textContent='',1500)};
fill();
})();
