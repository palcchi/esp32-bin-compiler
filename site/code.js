const $=s=>document.querySelector(s);
const btn=$('#buildCode'),box=$('#statusBox'),title=$('#statusTitle'),text=$('#statusText'),download=$('#downloadBin');
const gate=$('#otaProfileGate'),loginProfile=$('#loginOtaProfile'),loginSsid=$('#loginOtaSsid'),loginPassword=$('#loginOtaPassword'),loginError=$('#profileLoginError');
const newPanel=$('#newOtaProfile'),newName=$('#newOtaProfileName'),newSsid=$('#newOtaSsid'),newPassword=$('#newOtaPassword');
const activeName=$('#activeOtaProfileName'),activeSsid=$('#activeOtaProfileSsid');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let api=null;
function escapeText(v){return String(v??'')}
function profileLabel(p){return p.name===p.ssid?p.name:`${p.name} · ${p.ssid}`}
function updateActiveCard(){const p=api?.activeProfile?.();if(!p)return;activeName.textContent=p.name||p.ssid;activeSsid.textContent=p.ssid}
function fillLogin(id){const p=api?.getProfile?.(id);if(!p)return;loginSsid.value=p.ssid;loginPassword.value='';loginError.textContent=''}
function renderProfiles(preferred){if(!api)return;const profiles=api.listProfiles();loginProfile.innerHTML='';profiles.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=profileLabel(p);loginProfile.append(o)});const id=profiles.some(p=>p.id===preferred)?preferred:(api.activeProfile?.().id||profiles[0]?.id);if(id)loginProfile.value=id;fillLogin(loginProfile.value)}
function openGate(){if(!api)return;renderProfiles(api.activeProfile?.().id);newPanel.classList.remove('open');loginError.textContent='';gate.classList.remove('hidden');setTimeout(()=>loginPassword.focus(),90)}
function closeGate(profile){gate.classList.add('hidden');updateActiveCard();document.body.classList.remove('profile-login-open');if(profile)window.dispatchEvent(new CustomEvent('vallian-ota-profile-login',{detail:profile}))}
function enterSelected(){try{const id=loginProfile.value,p=api.authenticateProfile(id,loginSsid.value,loginPassword.value);if(!p)throw new Error('SSID atau password profile tidak cocok.');api.setActiveProfile(p.id);closeGate(p)}catch(e){loginError.textContent=e.message||String(e);loginPassword.select()}}
function createProfile(){try{const ssid=newSsid.value.trim(),password=newPassword.value,name=newName.value.trim()||ssid;if(!ssid)throw new Error('SSID profile baru tidak boleh kosong.');if(password&&password.length<8)throw new Error('Password minimal 8 karakter.');const p=api.addProfile({name,ssid,password});api.setActiveProfile(p.id);newName.value='';newSsid.value='';newPassword.value='';renderProfiles(p.id);closeGate(p)}catch(e){loginError.textContent=e.message||String(e)}}
function initProfiles(attempt=0){api=window.VallianOTA||null;if(!api&&attempt<40){setTimeout(()=>initProfiles(attempt+1),50);return}if(!api){loginError.textContent='OTA profile runtime gagal dimuat.';return}renderProfiles(api.activeProfile?.().id);updateActiveCard();document.body.classList.add('profile-login-open')}
loginProfile?.addEventListener('change',()=>fillLogin(loginProfile.value));
$('#enterOtaProfile')?.addEventListener('click',enterSelected);
loginPassword?.addEventListener('keydown',e=>{if(e.key==='Enter')enterSelected()});
loginSsid?.addEventListener('keydown',e=>{if(e.key==='Enter')loginPassword.focus()});
$('#toggleNewOtaProfile')?.addEventListener('click',()=>{newPanel.classList.toggle('open');loginError.textContent='';if(newPanel.classList.contains('open'))setTimeout(()=>newName.focus(),60)});
$('#cancelNewOtaProfile')?.addEventListener('click',()=>{newPanel.classList.remove('open');loginError.textContent=''});
$('#createOtaProfile')?.addEventListener('click',createProfile);
[newName,newSsid,newPassword].forEach(el=>el?.addEventListener('keydown',e=>{if(e.key==='Enter')createProfile()}));
$('#switchOtaProfile')?.addEventListener('click',()=>{document.body.classList.add('profile-login-open');openGate()});
async function poll(commit){for(let i=0;i<75;i++){await wait(i?4000:2500);const r=await fetch('/builds.json?t='+Date.now(),{cache:'no-store'}).catch(()=>null);if(!r?.ok)continue;const builds=await r.json();const b=builds.find(x=>x.commit===commit);if(b?.status==='ready'&&b.file)return b;if(b?.status==='failed')throw new Error('Compiler gagal. Cek Builds.');text.textContent=`Compiler bekerja... ${Math.min(99,8+i*2)}%`}throw new Error('Build belum selesai setelah sekitar 5 menit. Cek Builds.')}
btn.onclick=async()=>{const code=$('#code').value.trim();if(!code)return;btn.disabled=true;download.classList.add('hidden');box.classList.remove('hidden');title.textContent='Mengirim code...';text.textContent='Menyiapkan request compiler.';try{if(!api)throw new Error('OTA profile belum siap.');const preserve=$('#preserveOta').checked,profile=api.activeProfile();api.setActiveProfile(profile.id);const payload={name:$('#buildName').value.trim()||'Custom ESP32 Firmware',code,libraries:$('#libraries').value.split(',').map(x=>x.trim()).filter(Boolean),preserveOta:preserve};const r=await fetch('/api/build-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Gagal memulai build');title.textContent=`${payload.name} sedang dibuild`;text.textContent=preserve?`Compiling dengan OTA · ${escapeText(profile.ssid)}...`:'Compiling sketch apa adanya...';const b=await poll(data.commit);title.textContent='BIN siap';text.textContent=`${Math.round(b.size/1024)} KB · ${b.name}`;download.href='/'+b.file;download.download='';download.classList.remove('hidden')}catch(e){title.textContent='Build gagal';text.textContent=e.message||String(e)}finally{btn.disabled=false}};
initProfiles();
