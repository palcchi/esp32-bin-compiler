(()=>{
'use strict';
if(window.__vallianOtaRuntimeV2)return;window.__vallianOtaRuntimeV2=true;
const KEY='vallian-ota-config-v1';
const PROFILES_KEY='vallian-ota-profiles-v1';
const ACTIVE_KEY='vallian-ota-active-profile-v1';
const DEFAULT={enabled:true,ssid:'VALLIAN-ESP32',password:'12345678'};
const DEFAULT_PROFILE={id:'default',name:'Default',ssid:DEFAULT.ssid,password:DEFAULT.password,builtIn:true};
function clean(v={}){let ssid=String(v.ssid||DEFAULT.ssid).trim().slice(0,32);let password=String(v.password??DEFAULT.password).slice(0,63);if(!ssid)ssid=DEFAULT.ssid;if(password&&password.length<8)password=DEFAULT.password;return{enabled:v.enabled!==false,ssid,password}}
function get(){try{return clean({...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')})}catch{return{...DEFAULT}}}
function set(v){const next=clean({...get(),...v});localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('vallian-ota-config',{detail:next}));return next}
function reset(){localStorage.removeItem(KEY);localStorage.setItem(ACTIVE_KEY,'default');window.dispatchEvent(new CustomEvent('vallian-ota-config',{detail:{...DEFAULT}}));return{...DEFAULT}}
function profileClean(v={}){const cfg=clean(v);return{id:String(v.id||'').trim(),name:String(v.name||cfg.ssid||'OTA Profile').trim().slice(0,32)||cfg.ssid,ssid:cfg.ssid,password:cfg.password,builtIn:!!v.builtIn}}
function readProfiles(){let list=[];try{const raw=JSON.parse(localStorage.getItem(PROFILES_KEY)||'[]');if(Array.isArray(raw))list=raw.map(profileClean).filter(x=>x.id&&x.id!=='default')}catch{}if(!list.length){const legacy=get();if(legacy.ssid!==DEFAULT.ssid||legacy.password!==DEFAULT.password)list=[profileClean({id:'legacy-saved',name:'Saved profile',ssid:legacy.ssid,password:legacy.password})]}
  const seen=new Set();return[DEFAULT_PROFILE,...list.filter(p=>{if(seen.has(p.id))return false;seen.add(p.id);return true})]}
function writeProfiles(list){const custom=list.filter(p=>p.id!=='default').map(profileClean);localStorage.setItem(PROFILES_KEY,JSON.stringify(custom));window.dispatchEvent(new CustomEvent('vallian-ota-profiles',{detail:listProfiles()}));return custom}
function listProfiles(){return readProfiles()}
function getProfile(id){return listProfiles().find(p=>p.id===id)||null}
function addProfile(v={}){const cfg=clean(v);const name=String(v.name||cfg.ssid||'OTA Profile').trim().slice(0,32)||cfg.ssid;if(!String(v.ssid||'').trim())throw new Error('SSID tidak boleh kosong.');if(String(v.password??'')&&String(v.password).length<8)throw new Error('Password minimal 8 karakter.');const id='ota-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);const profile=profileClean({id,name,ssid:cfg.ssid,password:cfg.password});const all=listProfiles();all.push(profile);writeProfiles(all);return profile}
function updateProfile(id,v={}){if(id==='default')throw new Error('Default profile tidak bisa diubah.');const all=listProfiles(),i=all.findIndex(p=>p.id===id);if(i<0)throw new Error('Profile tidak ditemukan.');const next=profileClean({...all[i],...v,id});if(!String(next.ssid||'').trim())throw new Error('SSID tidak boleh kosong.');all[i]=next;writeProfiles(all);if(localStorage.getItem(ACTIVE_KEY)===id)set({ssid:next.ssid,password:next.password});return next}
function removeProfile(id){if(id==='default')return false;const all=listProfiles(),next=all.filter(p=>p.id!==id);if(next.length===all.length)return false;writeProfiles(next);if(localStorage.getItem(ACTIVE_KEY)===id)setActiveProfile('default');return true}
function authenticateProfile(id,ssid,password){const p=getProfile(id);if(!p)return null;return String(ssid||'').trim()===p.ssid&&String(password??'')===p.password?p:null}
function setActiveProfile(id){const p=getProfile(id)||DEFAULT_PROFILE;localStorage.setItem(ACTIVE_KEY,p.id);set({ssid:p.ssid,password:p.password});window.dispatchEvent(new CustomEvent('vallian-ota-active-profile',{detail:p}));return p}
function activeProfile(){const id=localStorage.getItem(ACTIVE_KEY)||'default';return getProfile(id)||DEFAULT_PROFILE}
window.VallianOTA={key:KEY,profilesKey:PROFILES_KEY,activeKey:ACTIVE_KEY,defaults:{...DEFAULT},get,set,reset,listProfiles,getProfile,addProfile,updateProfile,removeProfile,authenticateProfile,setActiveProfile,activeProfile};
const nativeFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{try{const url=typeof input==='string'?input:input?.url||'';if(init?.method?.toUpperCase()==='POST'&&(url.includes('/api/build-code')||url.includes('/api/build-lyrics'))&&typeof init.body==='string'){const body=JSON.parse(init.body),cfg=get();if(url.includes('/api/build-code')){if(location.pathname.replace(/\.html$/,'')!=='/code')body.preserveOta=cfg.enabled;body.ota={ssid:cfg.ssid,password:cfg.password}}else body.ota={ssid:cfg.ssid,password:cfg.password};init={...init,body:JSON.stringify(body)}}}catch(e){console.warn('[OTA settings injection]',e)}return nativeFetch(input,init)};
})();
