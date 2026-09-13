(()=>{
'use strict';
if(window.__vallianWokwiAdapterV2)return;window.__vallianWokwiAdapterV2=true;
const CDN='https://cdn.jsdelivr.net/npm/@wokwi/elements@1.9.2/+esm';
const MAP={
 esp32:'wokwi-esp32-devkit-v1',
 button:'wokwi-pushbutton-6mm',
 led:'wokwi-led',rgb:'wokwi-rgb-led',
 dht11:'wokwi-dht22',dht22:'wokwi-dht22',ldr:'wokwi-photoresistor-sensor',pir:'wokwi-pir-motion-sensor',
 ultrasonic:'wokwi-hc-sr04',mpu:'wokwi-mpu6050',servo:'wokwi-servo',
 buzzer:'wokwi-buzzer',piezo:'wokwi-buzzer',encoder:'wokwi-ky-040',joystick:'wokwi-analog-joystick',
 keypad:'wokwi-membrane-keypad',irrx:'wokwi-ir-receiver',resistor:'wokwi-resistor'
};
const ALIASES={
 button:{signal:['1.l','1.r'],ground:['2.l','2.r']},
 led:{signal:['A'],ground:['C']},
 servo:{signal:['PWM','SIG'],power:['V+','VCC'],ground:['GND']},
 dht11:{signal:['SDA','DATA'],power:['VCC'],ground:['GND']},dht22:{signal:['SDA','DATA'],power:['VCC'],ground:['GND']},
 pir:{signal:['OUT'],power:['VCC'],ground:['GND']},
 ultrasonic:{trig:['TRIG'],echo:['ECHO'],power:['VCC'],ground:['GND']},
 mpu:{sda:['SDA'],scl:['SCL'],power:['VCC','5V'],ground:['GND']},
 ldr:{signal:['AO','A0','DO'],power:['VCC'],ground:['GND']},
 buzzer:{signal:['1','+'],ground:['2','-']},piezo:{signal:['1','+'],ground:['2','-']},
 encoder:{a:['CLK'],b:['DT'],sw:['SW'],power:['+','VCC'],ground:['GND']},
 joystick:{x:['HORZ','VRX','X'],y:['VERT','VRY','Y'],sw:['SEL','SW'],power:['VCC','5V'],ground:['GND']},
 irrx:{signal:['OUT','DAT'],power:['VCC'],ground:['GND']},resistor:{a:['1'],b:['2']}
};
let loader=null,box=null;
const cache=new Map();
function load(){if(loader)return loader;loader=import(CDN).catch(err=>{console.warn('[Wokwi] CDN unavailable, using Vallian fallback vectors.',err);return null});return loader}
function tag(type){return MAP[type]||null}
function ensureBox(){if(box&&box.isConnected)return box;box=document.createElement('div');box.id='vallian-wokwi-probe';box.style.cssText='position:fixed;left:-10000px;top:-10000px;visibility:hidden;pointer-events:none;z-index:-1';document.body.appendChild(box);return box}
function parsePx(v){const s=String(v||'').trim();const n=parseFloat(s)||0;if(s.endsWith('mm'))return n*96/25.4;if(s.endsWith('cm'))return n*96/2.54;if(s.endsWith('in'))return n*96;if(s.endsWith('pt'))return n*96/72;return n}
function prefixIds(svg,prefix){const ids=new Map();svg.querySelectorAll('[id]').forEach(n=>{const old=n.id,nu=prefix+old;ids.set(old,nu);n.id=nu});const attrs=['fill','stroke','filter','clip-path','mask','href','xlink:href','style'];svg.querySelectorAll('*').forEach(n=>attrs.forEach(a=>{const v=n.getAttribute(a);if(!v)return;let out=v;ids.forEach((nu,old)=>{out=out.replaceAll(`url(#${old})`,`url(#${nu})`).replaceAll(`#${old}`,`#${nu}`)});if(out!==v)n.setAttribute(a,out)}));return svg}
async function vector(type,attrs={}){
 const t=tag(type);if(!t)return null;
 const key=t+'|'+JSON.stringify(attrs||{});if(cache.has(key))return cache.get(key);
 await load();if(!customElements.get(t))return null;
 const el=document.createElement(t);Object.entries(attrs||{}).forEach(([k,v])=>{try{if(k in el)el[k]=v;else el.setAttribute(k,String(v))}catch{}});ensureBox().appendChild(el);
 try{if(el.updateComplete)await el.updateComplete;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const root=el.shadowRoot;if(!root)return null;const src=root.querySelector('svg');if(!src)return null;const clone=prefixIds(src.cloneNode(true),`vw-${type}-${Math.random().toString(36).slice(2,8)}-`);const r=el.getBoundingClientRect(),w=r.width||parsePx(src.getAttribute('width'))||100,h=r.height||parsePx(src.getAttribute('height'))||80;clone.setAttribute('width',String(w));clone.setAttribute('height',String(h));clone.setAttribute('preserveAspectRatio','xMidYMid meet');const pins=Array.isArray(el.pinInfo)?el.pinInfo.map(p=>({name:String(p.name||''),x:Number(p.x)||0,y:Number(p.y)||0,signals:p.signals||[],description:p.description||''})):[];const data={tag:t,width:w,height:h,markup:new XMLSerializer().serializeToString(clone),pins};cache.set(key,data);return data}finally{el.remove()}
}
function espName(pin){const p=String(pin).replace(/^GPIO\s*/i,'');if(p==='3V3'||p==='VIN'||p.startsWith('GND'))return p;const special={'1':'TX0','3':'RX0','16':'RX2','17':'TX2'};return special[p]||`D${p}`}
function findPin(type,role,key,pins,used=new Set()){
 const list=(pins||[]).filter(p=>!used.has(p.name));const up=s=>String(s||'').toUpperCase();
 if(type==='esp32'){const target=espName(key||role);let p=list.find(x=>up(x.name)===up(target));if(!p&&String(target).startsWith('GND'))p=list.find(x=>up(x.name).startsWith('GND'));return p||null}
 const a=ALIASES[type]||{},cands=[...(a[key]||[]),...(a[role]||[])].map(up);let p=list.find(x=>cands.includes(up(x.name)));if(p)return p;
 if(role==='power')p=list.find(x=>(x.signals||[]).some(s=>s?.type==='power'&&up(s.signal)==='VCC'));if(role==='ground')p=list.find(x=>(x.signals||[]).some(s=>s?.type==='power'&&up(s.signal)==='GND'));if(p)return p;
 if(key){p=list.find(x=>up(x.name).includes(up(key))||up(key).includes(up(x.name)));if(p)return p}
 return list.find(x=>!(x.signals||[]).some(s=>s?.type==='power'))||list[0]||null
}
function diagram(state){const parts=[{type:'wokwi-esp32-devkit-v1',id:'esp',top:0,left:0,attrs:{}}];(state?.components||[]).forEach((c,i)=>{const t=tag(c.type);if(t)parts.push({type:t,id:c.uid||`part${i+1}`,top:0,left:0,attrs:{}})});return{version:1,author:'Vallian Lab',editor:'vallian',parts,connections:[],dependencies:{}}}
window.VallianWokwi={MAP,ALIASES,tag,load,vector,findPin,espName,diagram,ready:()=>!!customElements.get('wokwi-esp32-devkit-v1')};
})();