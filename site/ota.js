(()=>{
'use strict';
const $=s=>document.querySelector(s),api=window.VallianOTA;
const DEFAULT={ssid:'VALLIAN-ESP32',password:'12345678'};
let saved=api.get();
function preview(){const ssid=$('#otaSsid').value.trim()||DEFAULT.ssid;$('#otaPreviewNetwork').textContent=ssid+' · Local OTA'}
function setProfileLabel(value){$('#otaActiveProfile').textContent=value==='default'?'Default':'Saved profile'}
function loadProfile(value){if(value==='default'){const enabled=api.get().enabled;$('#otaSsid').value=DEFAULT.ssid;$('#otaPassword').value=DEFAULT.password;$('#otaEnabled').checked=enabled;setProfileLabel('default')}else{saved=api.get();$('#otaSsid').value=saved.ssid;$('#otaPassword').value=saved.password;$('#otaEnabled').checked=saved.enabled;setProfileLabel('saved')}preview()}
function markCustom(){if($('#otaProfileChoice').value==='default'){$('#otaProfileChoice').value='saved';setProfileLabel('saved')}preview()}
$('#otaProfileChoice').addEventListener('change',e=>loadProfile(e.target.value));
$('#otaSsid').addEventListener('input',markCustom);$('#otaPassword').addEventListener('input',markCustom);
$('#toggleOtaPassword').onclick=()=>{const i=$('#otaPassword'),show=i.type==='password';i.type=show?'text':'password';$('#toggleOtaPassword').textContent=show?'Hide':'Show'};
$('#saveOta').onclick=()=>{const ssid=$('#otaSsid').value.trim(),password=$('#otaPassword').value;if(!ssid){$('#otaSaved').textContent='SSID tidak boleh kosong.';return}if(password&&password.length<8){$('#otaSaved').textContent='Password minimal 8 karakter.';return}saved=api.set({ssid,password,enabled:$('#otaEnabled').checked});$('#otaProfileChoice').value='saved';loadProfile('saved');$('#otaSaved').textContent=`Saved · ${saved.ssid}`;setTimeout(()=>$('#otaSaved').textContent='',1800)};
$('#resetOta').onclick=()=>{saved=api.reset();$('#otaProfileChoice').value='saved';loadProfile('saved');$('#otaSaved').textContent='Saved profile kembali ke default.';setTimeout(()=>$('#otaSaved').textContent='',1500)};
loadProfile('saved');
})();
