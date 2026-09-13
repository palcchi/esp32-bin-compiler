(()=>{
'use strict';
if(window.__deviceAssetsV2)return;window.__deviceAssetsV2=true;
const STORE='vallian-device-composer-v1';
const fallback={oled:'image',tft:'image',led:'pixel',rgb:'pixel',neo:'pixel',button:'circle',encoder:'circle',joystick:'select',keypad:'grid',dht11:'chip',dht22:'chip',ldr:'circle',pir:'circle',ultrasonic:'wifi',mpu:'chip',servo:'history',relay:'rect',motor:'chip',stepper:'chip',buzzer:'wifi',piezo:'wifi',i2s:'wifi',irrx:'wifi',irtx:'wifi'};
const wokwiAttrs={led:{color:'red'},rgb:{},button:{color:'yellow'}};
let token=0;
function state(){try{return JSON.parse(localStorage.getItem(STORE)||'null')||{components:[]}}catch{return{components:[]}}}
function uidType(uid){return state().components?.find(c=>c.uid===uid)?.type||''}
function setFallback(el,type){el.classList.add('hardware-thumb');el.dataset.assetType=type;el.innerHTML=`<span class="hardware-thumb-fallback asset-icon" data-icon="${fallback[type]||'chip'}"></span>`;window.VallianAssets?.hydrate(el)}
async function setVector(el,type,run){if(!type||el.dataset.assetType===type&&el.dataset.assetReady==='1')return;el.classList.add('hardware-thumb');el.dataset.assetType=type;setFallback(el,type);if(!window.VallianWokwi?.vector)return;try{const v=await window.VallianWokwi.vector(type,wokwiAttrs[type]||{});if(run!==token||!el.isConnected||!v?.markup)return;el.innerHTML=`<span class="hardware-thumb-vector">${v.markup}</span>`;el.dataset.assetReady='1'}catch{setFallback(el,type)}}
function scan(){const run=++token;document.querySelectorAll('.component-item[data-type]').forEach(card=>{const el=card.querySelector('.component-icon');if(el)setVector(el,card.dataset.type,run)});document.querySelectorAll('.selected-component[data-uid]').forEach(card=>{const el=card.querySelector('.component-icon'),type=uidType(card.dataset.uid);if(el&&type)setVector(el,type,run)})}
let timer=0;function queue(){clearTimeout(timer);timer=setTimeout(scan,45)}
function init(){queue();const roots=[document.querySelector('#componentLibrary'),document.querySelector('#selectedComponents')].filter(Boolean);roots.forEach(r=>new MutationObserver(queue).observe(r,{childList:true,subtree:true}));document.addEventListener('click',e=>{if(e.target.closest('.component-item,[data-remove],#applyPresetV4,#loadPresetV4,#resetDevice'))setTimeout(queue,80)},true);window.addEventListener('storage',e=>{if(e.key===STORE)queue()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,650));else setTimeout(init,650);
})();
