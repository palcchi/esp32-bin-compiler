(()=>{
'use strict';
if(window.__vallianWokwiAdapter)return;window.__vallianWokwiAdapter=true;
const MAP={
 oled:'wokwi-ssd1306',tft:'wokwi-ili9341',led:'wokwi-led',rgb:'wokwi-rgb-led',neo:'wokwi-neopixel',
 button:'wokwi-pushbutton',encoder:'wokwi-ky-040',joystick:'wokwi-analog-joystick',keypad:'wokwi-membrane-keypad',
 dht11:'wokwi-dht22',dht22:'wokwi-dht22',ldr:'wokwi-photoresistor-sensor',pir:'wokwi-pir-motion-sensor',
 ultrasonic:'wokwi-hc-sr04',mpu:'wokwi-mpu6050',servo:'wokwi-servo',relay:'wokwi-relay-module',
 buzzer:'wokwi-buzzer',piezo:'wokwi-buzzer',irrx:'wokwi-ir-receiver',irtx:'wokwi-ir-led'
};
const FALLBACK={oled:['GND','VCC','SCL','SDA'],button:['1.l','2.l'],servo:['GND','V+','PWM'],dht11:['VCC','SDA','GND'],dht22:['VCC','SDA','GND'],pir:['VCC','OUT','GND'],ultrasonic:['VCC','TRIG','ECHO','GND'],neo:['VSS','DIN','VDD'],buzzer:['1','2'],piezo:['1','2'],relay:['VCC','GND','IN']};
function tag(type){return MAP[type]||null}
function create(type,attrs={}){const t=tag(type);if(!t)return null;const el=document.createElement(t);Object.entries(attrs||{}).forEach(([k,v])=>{try{if(k in el)el[k]=v;else el.setAttribute(k,String(v))}catch{}});return el}
function pins(el,type){const p=el?.pinInfo;if(Array.isArray(p)&&p.length)return p.map(x=>({name:x.name,x:Number(x.x)||0,y:Number(x.y)||0,signals:x.signals||[],description:x.description||''}));return(FALLBACK[type]||[]).map((name,i)=>({name,x:i*10,y:0,signals:[],description:''}))}
function board(){const el=document.createElement('wokwi-esp32-devkit-v1');return el}
function diagram(state){const parts=[{type:'wokwi-esp32-devkit-v1',id:'esp',top:0,left:0,attrs:{}}];(state?.components||[]).forEach((c,i)=>{const t=tag(c.type);if(t)parts.push({type:t,id:c.uid||`part${i+1}`,top:0,left:0,attrs:{}})});return{version:1,author:'Vallian Lab',editor:'vallian',parts,connections:[],dependencies:{}}}
window.VallianWokwi={MAP,tag,create,pins,board,diagram,ready:()=>!!customElements.get('wokwi-esp32-devkit-v1')};
})();