(()=>{
'use strict';
if(window.__deviceWiringV13Precision)return;window.__deviceWiringV13Precision=true;
const STORE='vallian-device-composer-v1';
const host=()=>document.querySelector('#breadboardCanvasV7');
function state(){try{return JSON.parse(localStorage.getItem(STORE)||'null')||{components:[]}}catch{return{components:[]}}}
function power(type){if(['servo','motor','stepper','i2s'].includes(type))return'5V EXT';if(['neo','pir','ultrasonic','relay'].includes(type))return'5V';if(['button','keypad','led','rgb','buzzer','piezo'].includes(type))return null;return'3V3'}
function needsGround(type){return type!=='keypad'}
function logicalPins(c){const out=[],p=power(c.type);if(p)out.push({role:'power',key:'power',source:p});if(needsGround(c.type))out.push({role:'ground',key:'ground',source:'GND'});Object.entries(c.pins||{}).forEach(([k,n])=>out.push({role:'signal',key:k,source:`GPIO ${n}`,pin:Number(n)}));return out}
const CUSTOM=new Set(['oled','neo','relay','tft','motor','stepper','i2s','irtx']);
function rolePin(type,lp,pins,used){
 if(CUSTOM.has(type)){
  const names={power:['VCC','3V3','VIN','VDD'],ground:['GND','VSS'],sda:['SDA','DATA'],scl:['SCL','CLK'],data:['DATA','DIN'],sig:['SIG','IN','PWM','OUT'],trig:['TRIG'],echo:['ECHO'],cs:['CS'],dc:['DC'],rst:['RST'],sck:['SCK'],mosi:['MOSI'],r:['R'],g:['G'],b:['B']};
  const wanted=(names[lp.key]||names[lp.role]||[String(lp.key).toUpperCase()]).map(x=>x.toUpperCase());
  return pins.find(p=>!used.has(p.name)&&wanted.includes(String(p.name).toUpperCase()))||pins.find(p=>!used.has(p.name))||null;
 }
 return window.VallianWokwi?.findPin?.(type,lp.role,lp.key,pins,used)||pins.find(p=>!used.has(p.name))||null;
}
function origin(pos){const ap=pos.anchorPin;return ap?{x:pos.x-ap.x*pos.scaleX,y:pos.y-ap.y*pos.scaleY}:{x:pos.x,y:pos.y}}
function pinAbs(pos,p){const o=origin(pos);return{x:o.x+(Number(p?.x)||0)*pos.scaleX,y:o.y+(Number(p?.y)||0)*pos.scaleY}}
function espPin(scene,lp){const key=lp.role==='signal'?String(lp.pin):lp.source==='3V3'?'3V3':(lp.source==='5V'||lp.source==='5V EXT')?'VIN':'GND.1';const p=window.VallianWokwi?.findPin?.('esp32',lp.role,key,scene.espVec.pins,new Set())||scene.espVec.pins?.[0];return p?pinAbs(scene.espPos,p):null}
function espBox(scene){const o=origin(scene.espPos);return{x:o.x,y:o.y,w:scene.espVec.width*scene.espPos.scaleX,h:scene.espVec.height*scene.espPos.scaleY}}
function routeFromEsp(src,dst,lane,scene){
 const b=espBox(scene),left=src.x<b.x+b.w/2,gap=8,idx=lane||0;
 if(!left){const outX=b.x+b.w+22+idx*gap;return`M${src.x} ${src.y}H${outX}V${dst.y}H${dst.x}`}
 const outX=b.x-18-idx*gap;
 const targetIsAbove=dst.y<b.y+b.h*.48;
 const bypassY=targetIsAbove?b.y-24-idx*5:b.y+b.h+24+idx*5;
 const entryX=b.x+b.w+26+idx*gap;
 return`M${src.x} ${src.y}H${outX}V${bypassY}H${entryX}V${dst.y}H${dst.x}`;
}
function routeRailToPart(dst,lp,pos,lane,scene){
 const g=scene.board,region=pos.region||'board';
 const railY=lp.role==='ground'?(region==='bottom'?g.railBottomMinus:g.railTopMinus):(lp.source==='5V'?g.railBottomPlus:g.railTopPlus);
 const tapX=Math.max(g.x+35,Math.min(g.x+g.w-35,dst.x));
 if(region==='right'){const x=g.x+g.w+22+lane*8;return`M${tapX} ${railY}H${x}V${dst.y}H${dst.x}`}
 if(region==='top'){const y=g.y-20-lane*7;return`M${tapX} ${railY}V${y}H${dst.x}V${dst.y}`}
 if(region==='bottom'){const y=g.y+g.h+20+lane*7;return`M${tapX} ${railY}V${y}H${dst.x}V${dst.y}`}
 return`M${tapX} ${railY}V${dst.y}H${dst.x}`;
}
function setPath(group,d){group.querySelectorAll('path').forEach(p=>p.setAttribute('d',d))}
function routeShared(scene,svg){
 const g=scene.board;
 const rails=[
  ['__rail3v3',{role:'power',source:'3V3'},{x:g.x+24,y:g.railTopPlus}],
  ['__rail5v',{role:'power',source:'5V'},{x:g.x+24,y:g.railBottomPlus}],
  ['__railgnd',{role:'ground',source:'GND'},{x:g.x+24,y:g.railTopMinus}]
 ];
 rails.forEach(([uid,lp,dst],i)=>{const group=svg.querySelector(`.v13-wire[data-v13-uid="${uid}"]`);if(!group)return;const src=espPin(scene,lp);if(src)setPath(group,routeFromEsp(src,dst,i,scene))});
 const bridge=svg.querySelector('.v13-wire[data-v13-uid="__railgndbridge"]');if(bridge)setPath(bridge,`M${g.x+33} ${g.railTopMinus}V${g.railBottomMinus}`);
}
function routeDevices(scene,svg){
 let leftLane=0,rightLane=0;
 (state().components||[]).forEach(c=>{
  const groups=[...svg.querySelectorAll(`.v13-wire[data-v13-uid="${CSS.escape(c.uid)}"]`)];
  const v=scene.vectors.get(c.uid),pos=scene.places.get(c.uid);if(!v||!pos)return;
  const used=new Set(),pins=logicalPins(c);
  pins.forEach((lp,i)=>{
   const group=groups[i];if(!group)return;
   const pp=rolePin(c.type,lp,v.pins||[],used);if(!pp)return;used.add(pp.name);
   const dst=pinAbs(pos,pp);
   let d;
   if(lp.role==='signal'){
    const src=espPin(scene,lp);if(!src)return;
    const box=espBox(scene),isLeft=src.x<box.x+box.w/2,lane=isLeft?leftLane++:rightLane++;
    d=routeFromEsp(src,dst,lane,scene);
   }else if(lp.source==='5V EXT'){
    const x=scene.board.x-92,y=scene.board.y+scene.board.h+29,lane=i;
    d=`M${x+72} ${y}H${scene.board.x-20-lane*7}V${dst.y}H${dst.x}`;
   }else d=routeRailToPart(dst,lp,pos,i,scene);
   setPath(group,d);
  });
 });
}
function polish(){
 const h=host(),svg=h?.querySelector('svg[data-v13="1"]'),scene=h?.__v13Scene;if(!svg||!scene)return;
 svg.querySelectorAll('.v13-support').forEach(n=>n.remove());
 routeShared(scene,svg);routeDevices(scene,svg);
 svg.dataset.v13Precision='1';
}
let raf=0;function queue(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(polish))}
function init(){const h=host();if(!h)return;h.addEventListener('vallian:wiring-v13-rendered',queue);new MutationObserver(()=>{if(h.querySelector('svg[data-v13="1"]'))queue()}).observe(h,{childList:true});queue()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,650));else setTimeout(init,650);
})();