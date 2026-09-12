(()=>{
'use strict';
if(window.__vallianOtaRuntime)return;window.__vallianOtaRuntime=true;
const KEY='vallian-ota-config-v1';
const DEFAULT={enabled:true,ssid:'VALLIAN-ESP32',password:'12345678'};
function clean(v={}){let ssid=String(v.ssid||DEFAULT.ssid).trim().slice(0,32);let password=String(v.password??DEFAULT.password).slice(0,63);if(!ssid)ssid=DEFAULT.ssid;if(password&&password.length<8)password=DEFAULT.password;return{enabled:v.enabled!==false,ssid,password}}
function get(){try{return clean({...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')})}catch{return{...DEFAULT}}}
function set(v){const next=clean({...get(),...v});localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('vallian-ota-config',{detail:next}));return next}
function reset(){localStorage.removeItem(KEY);window.dispatchEvent(new CustomEvent('vallian-ota-config',{detail:{...DEFAULT}}));return{...DEFAULT}}
window.VallianOTA={key:KEY,defaults:{...DEFAULT},get,set,reset};
const nativeFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{try{const url=typeof input==='string'?input:input?.url||'';if(init?.method?.toUpperCase()==='POST'&&(url.includes('/api/build-code')||url.includes('/api/build-lyrics'))&&typeof init.body==='string'){const body=JSON.parse(init.body),cfg=get();if(url.includes('/api/build-code')){if(location.pathname.replace(/\.html$/,'')!=='/code')body.preserveOta=cfg.enabled;body.ota={ssid:cfg.ssid,password:cfg.password}}else body.ota={ssid:cfg.ssid,password:cfg.password};init={...init,body:JSON.stringify(body)}}}catch(e){console.warn('[OTA settings injection]',e)}return nativeFetch(input,init)};
})();
