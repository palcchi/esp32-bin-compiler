(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORE='vallian-device-composer-v1';
const SAFE_OUT=[2,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33];
const SAFE_IN=[2,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33,34,35,36,39];
const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cppString=s=>'"'+String(s??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n')+'"';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const C={
 oled:{name:'OLED SSD1306',cat:'Display',icon:'▰',summary:'128×64 I²C display',power:'3V3',pins:[['sda','SDA',21,'io','i2c-sda'],['scl','SCL',22,'io','i2c-scl']],libs:['Adafruit SSD1306','Adafruit GFX Library']},
 tft:{name:'TFT ST7735',cat:'Display',icon:'▣',summary:'Color SPI display',power:'3V3',pins:[['cs','CS',5,'out'],['dc','DC',16,'out'],['rst','RST',17,'out'],['sck','SCK',18,'out'],['mosi','MOSI',23,'out']],libs:['Adafruit ST7735 and ST7789 Library','Adafruit GFX Library']},
 led:{name:'LED',cat:'Light',icon:'●',summary:'Digital light',power:'3V3',pins:[['sig','Signal',2,'out']]},
 rgb:{name:'RGB LED',cat:'Light',icon:'◉',summary:'Three-channel color',power:'3V3',pins:[['r','R',25,'out'],['g','G',26,'out'],['b','B',27,'out']]},
 neo:{name:'WS2812B / NeoPixel',cat:'Light',icon:'✦',summary:'Addressable RGB strip',power:'5V',pins:[['data','Data',18,'out']],libs:['Adafruit NeoPixel']},
 button:{name:'Push Button',cat:'Input',icon:'○',summary:'Press / release input',power:'3V3',pins:[['sig','Signal',32,'in']]},
 encoder:{name:'Rotary Encoder',cat:'Input',icon:'◎',summary:'Turn input',power:'3V3',pins:[['a','A',32,'in'],['b','B',33,'in']]},
 joystick:{name:'Joystick',cat:'Input',icon:'✛',summary:'X / Y / press',power:'3V3',pins:[['x','X',34,'in'],['y','Y',35,'in'],['sw','SW',32,'in']]},
 keypad:{name:'4×4 Keypad',cat:'Input',icon:'⌗',summary:'Matrix keypad',power:'3V3',pins:[['r1','R1',13,'io'],['r2','R2',14,'io'],['r3','R3',16,'io'],['r4','R4',17,'io'],['c1','C1',25,'io'],['c2','C2',26,'io'],['c3','C3',27,'io'],['c4','C4',33,'io']],libs:['Keypad']},
 dht11:{name:'DHT11',cat:'Sensor',icon:'℃',summary:'Temperature + humidity',power:'3V3',pins:[['sig','Data',4,'in']],libs:['DHT sensor library']},
 dht22:{name:'DHT22',cat:'Sensor',icon:'℃',summary:'Better temp + humidity',power:'3V3',pins:[['sig','Data',4,'in']],libs:['DHT sensor library']},
 ldr:{name:'LDR',cat:'Sensor',icon:'☼',summary:'Analog light level',power:'3V3',pins:[['sig','Analog',34,'in']]},
 pir:{name:'PIR Motion',cat:'Sensor',icon:'◌',summary:'Motion detection',power:'5V',pins:[['sig','Signal',27,'in']]},
 ultrasonic:{name:'HC-SR04',cat:'Sensor',icon:'⇆',summary:'Distance sensor',power:'5V',pins:[['trig','TRIG',5,'out'],['echo','ECHO',18,'in']]},
 mpu:{name:'MPU6050',cat:'Sensor',icon:'◇',summary:'Motion / accelerometer',power:'3V3',pins:[['sda','SDA',21,'io','i2c-sda'],['scl','SCL',22,'io','i2c-scl']],libs:['Adafruit MPU6050','Adafruit Unified Sensor']},
 servo:{name:'SG90 Servo',cat:'Actuator',icon:'↻',summary:'0–180° position',power:'5V external',pins:[['sig','Signal',18,'out']],libs:['ESP32Servo']},
 relay:{name:'Relay Module',cat:'Actuator',icon:'▱',summary:'Switch external load',power:'5V module',pins:[['sig','IN',5,'out']]},
 motor:{name:'DC Motor + L298N',cat:'Actuator',icon:'↝',summary:'Direction + speed',power:'External',pins:[['in1','IN1',25,'out'],['in2','IN2',26,'out'],['ena','ENA',27,'out']]},
 stepper:{name:'Stepper + ULN2003',cat:'Actuator',icon:'✣',summary:'4-phase stepper',power:'5V external',pins:[['in1','IN1',16,'out'],['in2','IN2',17,'out'],['in3','IN3',18,'out'],['in4','IN4',19,'out']]},
 buzzer:{name:'Active Buzzer',cat:'Audio',icon:'♪',summary:'Simple beep',power:'3V3',pins:[['sig','Signal',4,'out']]},
 piezo:{name:'Passive Buzzer',cat:'Audio',icon:'♫',summary:'Tone / melody',power:'3V3',pins:[['sig','Signal',4,'out']]},
 irrx:{name:'IR Receiver',cat:'Wireless',icon:'⌁',summary:'Read remote commands',power:'3V3',pins:[['sig','Signal',32,'in']],libs:['IRremoteESP8266']},
 irtx:{name:'IR Transmitter',cat:'Wireless',icon:'⌁',summary:'Send IR commands',power:'3V3 + driver',pins:[['sig','Signal',17,'out']],libs:['IRremoteESP8266']},
 i2s:{name:'I2S Speaker',cat:'Audio',icon:'▹',summary:'Digital audio output',power:'External amp',pins:[['bclk','BCLK',26,'out'],['lrc','LRC',25,'out'],['dout','DOUT',22,'out']],experimental:true}
};
const categories=['All',...new Set(Object.values(C).map(x=>x.cat))];

let seq=1;
let state={name:'My ESP32 Device',components:[],rules:[],iot:false};
let activeCategory='All';

const makeComp=(type)=>{const d=C[type];return {uid:'c'+seq++,type,pins:Object.fromEntries(d.pins.map(p=>[p[0],p[2]]))}};
const compByUid=uid=>state.components.find(c=>c.uid===uid);
const defOf=c=>C[c.type];

const triggerOptions=()=>{
 const out=[['system:startup','System · startup','none'],['system:interval','System · every N seconds','seconds']];
 state.components.forEach(c=>{
  const d=defOf(c),u=c.uid;
  if(c.type==='button')out.push([u+':pressed',d.name+' · pressed','none']);
  if(c.type==='pir')out.push([u+':motion',d.name+' · motion','none']);
  if(c.type==='dht11'||c.type==='dht22')out.push([u+':tempAbove',d.name+' · temp above','°C']);
  if(c.type==='ldr')out.push([u+':lightBelow',d.name+' · light below','ADC']);
  if(c.type==='ultrasonic')out.push([u+':distanceBelow',d.name+' · distance below','cm']);
  if(c.type==='joystick')out.push([u+':xAbove',d.name+' · X above','ADC']);
  if(c.type==='encoder')out.push([u+':turned',d.name+' · turned','none']);
  if(c.type==='keypad')out.push([u+':key',d.name+' · key pressed','none']);
  if(c.type==='mpu')out.push([u+':shake',d.name+' · shake','m/s²']);
  if(c.type==='irrx')out.push([u+':ir',d.name+' · signal received','none']);
 });
 return out;
};
const actionOptions=()=>{
 const out=[];
 state.components.forEach(c=>{const d=defOf(c),u=c.uid;
  if(c.type==='led')out.push([u+':on',d.name+' · ON','none'],[u+':off',d.name+' · OFF','none'],[u+':toggle',d.name+' · toggle','none']);
  if(c.type==='rgb')out.push([u+':color',d.name+' · color','hex']);
  if(c.type==='neo')out.push([u+':color',d.name+' · color','hex'],[u+':off',d.name+' · OFF','none']);
  if(c.type==='oled'||c.type==='tft')out.push([u+':text',d.name+' · show text','text'],[u+':clear',d.name+' · clear','none']);
  if(c.type==='relay')out.push([u+':on',d.name+' · ON','none'],[u+':off',d.name+' · OFF','none']);
  if(c.type==='servo')out.push([u+':angle',d.name+' · angle','0–180']);
  if(c.type==='buzzer')out.push([u+':beep',d.name+' · beep','ms']);
  if(c.type==='piezo')out.push([u+':tone',d.name+' · tone','Hz']);
  if(c.type==='motor')out.push([u+':forward',d.name+' · forward','speed'],[u+':stop',d.name+' · stop','none']);
  if(c.type==='stepper')out.push([u+':steps',d.name+' · move','steps']);
  if(c.type==='irtx')out.push([u+':send',d.name+' · send NEC','hex']);
 });
 return out;
};

const presets={
 desk:{name:'Desk Assistant',desc:'OLED + button + temperature + buzzer',parts:['oled','button','dht11','buzzer'],rules:[['button','pressed','oled','text','HELLO'],['dht11','tempAbove','buzzer','beep','180']],iot:false},
 door:{name:'Smart Door',desc:'Button + servo + display + sound',parts:['oled','button','servo','buzzer'],rules:[['button','pressed','servo','angle','90'],['button','pressed','oled','text','WELCOME'],['button','pressed','buzzer','beep','140']],iot:false},
 temp:{name:'Temperature Guard',desc:'DHT + relay + OLED warning',parts:['oled','dht22','relay'],rules:[['dht22','tempAbove','relay','on','30'],['dht22','tempAbove','oled','text','HOT']],iot:false},
 alarm:{name:'Motion Alarm',desc:'PIR + LED + buzzer + OLED',parts:['oled','pir','led','buzzer'],rules:[['pir','motion','led','on',''],['pir','motion','buzzer','beep','250'],['pir','motion','oled','text','MOTION']],iot:false},
 ambient:{name:'Ambient Light',desc:'LDR + RGB light automation',parts:['ldr','rgb'],rules:[['ldr','lightBelow','rgb','color','#6b8cff']],iot:false},
 dashboard:{name:'IoT Control',desc:'LED + relay + servo with local dashboard',parts:['led','relay','servo'],rules:[],iot:true}
};

function renderCategories(){
 $('#categoryChips').innerHTML=categories.map(c=>`<button type="button" class="category-chip ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join('');
 $$('.category-chip').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCategories();renderLibrary()});
}
function renderLibrary(){
 const q=$('#componentSearch').value.trim().toLowerCase();
 const items=Object.entries(C).filter(([,d])=>(activeCategory==='All'||d.cat===activeCategory)&&(!q||(d.name+' '+d.summary+' '+d.cat).toLowerCase().includes(q)));
 $('#libraryCount').textContent=items.length;
 $('#componentLibrary').innerHTML=items.map(([id,d])=>`<button type="button" class="component-item" data-type="${id}" aria-label="Add ${escapeHtml(d.name)}"><span class="component-icon">${d.icon}</span><span class="component-copy"><b>${escapeHtml(d.name)}</b><small>${escapeHtml(d.summary)}${d.experimental?' · EXPERIMENTAL':''}</small></span><span class="component-add">＋</span></button>`).join('')||'<div class="empty-device"><span>No matching hardware.</span></div>';
 $$('.component-item').forEach(b=>b.onclick=()=>addComponent(b.dataset.type));
}
function pinOptions(pin,mode){const list=mode==='out'?SAFE_OUT:SAFE_IN;return list.map(n=>`<option value="${n}" ${Number(pin)===n?'selected':''}>GPIO ${n}</option>`).join('')}
function renderSelected(){
 const wrap=$('#selectedComponents');
 if(!state.components.length){wrap.innerHTML='<div class="empty-device"><div><strong>No components yet.</strong><span>Add hardware from the library or start from a preset.</span></div></div>';renderPins();return}
 wrap.innerHTML=state.components.map(c=>{const d=defOf(c);return `<div class="selected-component" data-uid="${c.uid}"><div class="selected-head"><div class="selected-title"><span class="component-icon">${d.icon}</span><span><b>${escapeHtml(d.name)}</b><small>${escapeHtml(d.power)} · ${escapeHtml(d.summary)}</small></span></div><button type="button" class="remove-component" data-remove="${c.uid}" aria-label="Remove ${escapeHtml(d.name)}">×</button></div><div class="pin-grid">${d.pins.map(p=>`<label class="pin-field"><span>${p[1]}</span><select data-pin-uid="${c.uid}" data-pin-key="${p[0]}">${pinOptions(c.pins[p[0]],p[3])}</select></label>`).join('')}</div></div>`}).join('');
 $$('[data-remove]').forEach(b=>b.onclick=()=>removeComponent(b.dataset.remove));
 $$('[data-pin-uid]').forEach(s=>s.onchange=()=>{const c=compByUid(s.dataset.pinUid);if(c)c.pins[s.dataset.pinKey]=Number(s.value);renderPins();renderWiring();generateCode(false);save(false)});
 renderPins();
}
function renderPins(){
 const uses=new Map(),warnings=[];
 state.components.forEach(c=>defOf(c).pins.forEach(p=>{const pin=Number(c.pins[p[0]]),shared=p[4];if(p[3]==='out'&&[34,35,36,39].includes(pin))warnings.push(`${defOf(c).name} ${p[1]} uses input-only GPIO ${pin}.`);if([2,12,15].includes(pin))warnings.push(`GPIO ${pin} is a boot/strap-sensitive pin. Use carefully.`);const key=shared||String(pin);if(!uses.has(key))uses.set(key,[]);uses.get(key).push({c,p,pin,shared})}));
 uses.forEach((list,key)=>{if(list.length>1&&!String(key).startsWith('i2c-'))warnings.push(`GPIO ${list[0].pin} is shared by ${list.map(x=>defOf(x.c).name+' '+x.p[1]).join(', ')}.`)});
 $('#pinHealth').textContent=warnings.length?`${warnings.length} ISSUE${warnings.length>1?'S':''}`:'READY';
 $('#pinHealth').style.color=warnings.length?'#8a6100':'';
 const box=$('#pinWarnings');box.classList.toggle('hidden',!warnings.length);box.innerHTML=warnings.map(w=>`<div>⚠ ${escapeHtml(w)}</div>`).join('');
 $('#wiringStatus').textContent=warnings.length?'CHECK PINS':'READY';
}
function renderPresets(){
 $('#presetGrid').innerHTML=Object.entries(presets).map(([id,p])=>`<button type="button" class="preset-card" data-preset="${id}"><b>${escapeHtml(p.name)}</b><span>${escapeHtml(p.desc)}</span><i>LOAD PRESET</i></button>`).join('');
 $$('[data-preset]').forEach(b=>b.onclick=()=>loadPreset(b.dataset.preset));
}
function addComponent(type){if(!C[type])return;state.components.push(makeComp(type));renderAll();save(false)}
function removeComponent(uid){state.components=state.components.filter(c=>c.uid!==uid);state.rules=state.rules.filter(r=>!r.trigger.startsWith(uid+':')&&!r.action.startsWith(uid+':'));renderAll();save(false)}
function loadPreset(id){const p=presets[id];if(!p)return;state.components=[];state.rules=[];state.iot=!!p.iot;p.parts.forEach(t=>state.components.push(makeComp(t)));p.rules.forEach((r,i)=>{const tc=state.components.find(c=>c.type===r[0]),ac=state.components.find(c=>c.type===r[2]);if(tc&&ac)state.rules.push({id:'r'+Date.now()+i,trigger:tc.uid+':'+r[1],threshold:r[1]==='tempAbove'||r[1]==='lightBelow'||r[1]==='distanceBelow'?r[4]:'',action:ac.uid+':'+r[3],value:r[1]==='tempAbove'||r[1]==='lightBelow'||r[1]==='distanceBelow'?'':r[4]})});renderAll();save(false)}

function optionHtml(list,value){return list.map(x=>`<option value="${x[0]}" ${x[0]===value?'selected':''}>${escapeHtml(x[1])}</option>`).join('')}
function renderLogic(){
 const t=triggerOptions(),a=actionOptions(),wrap=$('#logicRules');
 if(!state.rules.length){wrap.innerHTML='<div class="empty-device"><div><strong>No rules yet.</strong><span>Add a trigger and connect it to an action.</span></div></div>';return}
 wrap.innerHTML=state.rules.map(r=>{if(!t.some(x=>x[0]===r.trigger))r.trigger=t[0]?.[0]||'';if(!a.some(x=>x[0]===r.action))r.action=a[0]?.[0]||'';const tm=t.find(x=>x[0]===r.trigger)?.[2]||'none',am=a.find(x=>x[0]===r.action)?.[2]||'none';return `<div class="logic-rule" data-rule="${r.id}"><label class="logic-field"><span>TRIGGER</span><select data-r-trigger="${r.id}">${optionHtml(t,r.trigger)}</select></label><label class="logic-field condition-field"><span>IF VALUE</span><input data-r-threshold="${r.id}" value="${escapeHtml(r.threshold||'')}" placeholder="${tm==='none'?'—':escapeHtml(tm)}" ${tm==='none'?'disabled':''}></label><div class="logic-arrow">→</div><label class="logic-field"><span>ACTION</span><select data-r-action="${r.id}">${optionHtml(a,r.action)}</select></label><label class="logic-field action-value-field"><span>ACTION VALUE</span><input data-r-value="${r.id}" value="${escapeHtml(r.value||'')}" placeholder="${am==='none'?'—':escapeHtml(am)}" ${am==='none'?'disabled':''}></label><button class="remove-rule" type="button" data-r-remove="${r.id}" aria-label="Remove rule">×</button></div>`}).join('');
 $$('[data-r-trigger]').forEach(el=>el.onchange=()=>{const r=state.rules.find(x=>x.id===el.dataset.rTrigger);r.trigger=el.value;renderLogic();generateCode(false);save(false)});
 $$('[data-r-action]').forEach(el=>el.onchange=()=>{const r=state.rules.find(x=>x.id===el.dataset.rAction);r.action=el.value;renderLogic();generateCode(false);save(false)});
 $$('[data-r-threshold]').forEach(el=>el.oninput=()=>{const r=state.rules.find(x=>x.id===el.dataset.rThreshold);r.threshold=el.value;generateCode(false);save(false)});
 $$('[data-r-value]').forEach(el=>el.oninput=()=>{const r=state.rules.find(x=>x.id===el.dataset.rValue);r.value=el.value;generateCode(false);save(false)});
 $$('[data-r-remove]').forEach(el=>el.onclick=()=>{state.rules=state.rules.filter(x=>x.id!==el.dataset.rRemove);renderLogic();generateCode(false);save(false)});
}
function addRule(){const t=triggerOptions(),a=actionOptions();if(!a.length){showView('compose');return}state.rules.push({id:'r'+Date.now(),trigger:t[0][0],threshold:'2',action:a[0][0],value:''});renderLogic();generateCode(false);save(false)}

function renderWiring(){
 const rows=[];state.components.forEach(c=>{const d=defOf(c);rows.push({comp:d.name,label:'VCC',pin:d.power});rows.push({comp:d.name,label:'GND',pin:'GND'});d.pins.forEach(p=>rows.push({comp:d.name,label:p[1],pin:'GPIO '+c.pins[p[0]]}))});
 $('#wiringList').innerHTML=rows.length?rows.map(r=>`<div class="wire-row"><span><strong>${escapeHtml(r.comp)}</strong><small>${escapeHtml(r.label)}</small></span><i class="wire-line"></i><span><strong>${escapeHtml(r.pin)}</strong></span></div>`).join(''):'<div class="empty-device"><span>Add components to generate wiring.</span></div>';
 const unique=[];state.components.forEach(c=>defOf(c).pins.forEach(p=>{const pin=c.pins[p[0]];if(!unique.some(x=>x.pin===pin))unique.push({pin,label:p[1]})}));
 $('#boardPins').innerHTML=unique.slice(0,14).map((x,i)=>{const side=i%2?'right':'left',top=42+(Math.floor(i/2)*38);return `<span class="board-pin-label ${side}" style="top:${top}px">GPIO ${x.pin}</span>`}).join('');
}
function renderSim(){
 $('#simNodes').innerHTML=state.components.length?state.components.map(c=>`<div class="sim-node" data-sim="${c.uid}"><b>${escapeHtml(defOf(c).name)}</b><span>${escapeHtml(defOf(c).cat)}</span></div>`).join(''):'<div class="sim-node"><b>No hardware</b><span>Add components first</span></div>';
 $('#iotEnabled').checked=state.iot;
}
async function runSimulation(){
 const log=$('#simLog');log.innerHTML='';$$('.sim-node').forEach(n=>n.classList.remove('active'));$('#simScreen').innerHTML='<span>SIMULATING</span>';
 if(!state.rules.length){log.innerHTML='<span>No automation rules to simulate.</span>';$('#simScreen').innerHTML='<span>NO RULES</span>';return}
 for(const [i,r] of state.rules.entries()){
  const tc=r.trigger.startsWith('system:')?null:compByUid(r.trigger.split(':')[0]),ac=compByUid(r.action.split(':')[0]);
  const tlabel=triggerOptions().find(x=>x[0]===r.trigger)?.[1]||r.trigger,alabel=actionOptions().find(x=>x[0]===r.action)?.[1]||r.action;
  const item=document.createElement('span');item.className='running';item.textContent=`${i+1}. ${tlabel} → ${alabel}`;log.append(item);
  if(tc)document.querySelector(`[data-sim="${tc.uid}"]`)?.classList.add('active');if(ac)document.querySelector(`[data-sim="${ac.uid}"]`)?.classList.add('active');
  $('#simScreen').innerHTML=`<span>${escapeHtml((alabel.split(' · ')[1]||'ACTION').toUpperCase())}</span>`;await wait(650);$$('.sim-node').forEach(n=>n.classList.remove('active'));
 }
 $('#simScreen').innerHTML='<span>DEVICE READY</span>';
}

function libs(){return [...new Set(state.components.flatMap(c=>defOf(c).libs||[]))]}
function pinConst(c,key){return `PIN_${c.uid.toUpperCase()}_${key.toUpperCase()}`}
function hexRgb(v){let s=String(v||'#ffffff').replace('#','');if(!/^[0-9a-f]{6}$/i.test(s))s='ffffff';return [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]}
function generateCode(force=true){
 const lines=[];const has=t=>state.components.some(c=>c.type===t);const components=state.components;
 lines.push('// Generated by Vallian Device Composer','// ESP32 DOIT DevKit V1','');
 const inc=new Set();components.forEach(c=>{const t=c.type;if(t==='oled'){inc.add('Wire.h');inc.add('Adafruit_GFX.h');inc.add('Adafruit_SSD1306.h')}if(t==='tft'){inc.add('SPI.h');inc.add('Adafruit_GFX.h');inc.add('Adafruit_ST7735.h')}if(t==='neo')inc.add('Adafruit_NeoPixel.h');if(t==='dht11'||t==='dht22')inc.add('DHT.h');if(t==='mpu'){inc.add('Wire.h');inc.add('Adafruit_MPU6050.h');inc.add('Adafruit_Sensor.h')}if(t==='servo')inc.add('ESP32Servo.h');if(t==='keypad')inc.add('Keypad.h');if(t==='irrx'){inc.add('IRremoteESP8266.h');inc.add('IRrecv.h');inc.add('IRutils.h')}if(t==='irtx'){inc.add('IRremoteESP8266.h');inc.add('IRsend.h')}if(state.iot){inc.add('WiFi.h');inc.add('WebServer.h')}});inc.forEach(x=>lines.push(`#include <${x}>`));if(inc.size)lines.push('');
 components.forEach(c=>defOf(c).pins.forEach(p=>lines.push(`const int ${pinConst(c,p[0])} = ${c.pins[p[0]]};`)));if(components.length)lines.push('');
 components.forEach(c=>{const t=c.type,u=c.uid;if(t==='oled')lines.push(`Adafruit_SSD1306 oled_${u}(128, 64, &Wire, -1);`);if(t==='tft')lines.push(`Adafruit_ST7735 tft_${u}(${pinConst(c,'cs')}, ${pinConst(c,'dc')}, ${pinConst(c,'rst')});`);if(t==='neo')lines.push(`Adafruit_NeoPixel neo_${u}(8, ${pinConst(c,'data')}, NEO_GRB + NEO_KHZ800);`);if(t==='dht11'||t==='dht22')lines.push(`DHT dht_${u}(${pinConst(c,'sig')}, ${t==='dht11'?'DHT11':'DHT22'});`);if(t==='mpu')lines.push(`Adafruit_MPU6050 mpu_${u};`);if(t==='servo')lines.push(`Servo servo_${u};`);if(t==='keypad'){lines.push(`char keys_${u}[4][4]={{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};`,`byte rows_${u}[4]={${['r1','r2','r3','r4'].map(k=>pinConst(c,k)).join(',')}};`,`byte cols_${u}[4]={${['c1','c2','c3','c4'].map(k=>pinConst(c,k)).join(',')}};`,`Keypad keypad_${u}=Keypad(makeKeymap(keys_${u}), rows_${u}, cols_${u}, 4, 4);`)}if(t==='irrx')lines.push(`IRrecv irrecv_${u}(${pinConst(c,'sig')});`,`decode_results irres_${u};`);if(t==='irtx')lines.push(`IRsend irsend_${u}(${pinConst(c,'sig')});`)});if(components.length)lines.push('');
 if(has('ultrasonic'))lines.push('float readDistanceCm(int trig,int echo){ digitalWrite(trig,LOW); delayMicroseconds(2); digitalWrite(trig,HIGH); delayMicroseconds(10); digitalWrite(trig,LOW); long us=pulseIn(echo,HIGH,30000); return us?us*0.0343f/2.0f:999.0f; }','');
 components.filter(c=>c.type==='encoder').forEach(c=>lines.push(`int encLast_${c.uid}=HIGH;`,`bool encoderMoved_${c.uid}(){ int n=digitalRead(${pinConst(c,'a')}); bool moved=n!=encLast_${c.uid}; encLast_${c.uid}=n; return moved; }`,''));
 components.filter(c=>c.type==='mpu').forEach(c=>lines.push(`bool mpuShake_${c.uid}(float limit){ sensors_event_t a,g,t; mpu_${c.uid}.getEvent(&a,&g,&t); float m=sqrt(a.acceleration.x*a.acceleration.x+a.acceleration.y*a.acceleration.y+a.acceleration.z*a.acceleration.z); return m>limit; }`,''));
 components.filter(c=>c.type==='stepper').forEach(c=>lines.push(`void stepperMove_${c.uid}(int steps){ const int seq[4][4]={{1,0,0,1},{1,0,1,0},{0,1,1,0},{0,1,0,1}}; int p[4]={${['in1','in2','in3','in4'].map(k=>pinConst(c,k)).join(',')}}; for(int s=0;s<abs(steps);s++){ int k=steps>=0?s%4:(3-s%4); for(int i=0;i<4;i++)digitalWrite(p[i],seq[k][i]); delay(3);} }`,''));
 state.rules.forEach((r,i)=>{lines.push(`unsigned long lastRule_${i}=0;`);if(r.trigger==='system:startup')lines.push(`bool startupRule_${i}=false;`)});if(state.rules.length)lines.push('');
 if(state.iot){lines.push('WebServer deviceServer(80);','const char* DEVICE_AP = "VALLIAN-DEVICE";','const char* DEVICE_PASS = "12345678";','');}
 lines.push('void setup(){','  Serial.begin(115200);');
 components.forEach(c=>{const t=c.type,u=c.uid;if(t==='oled')lines.push(`  Wire.begin(${pinConst(c,'sda')}, ${pinConst(c,'scl')});`,`  oled_${u}.begin(SSD1306_SWITCHCAPVCC, 0x3C);`,`  oled_${u}.clearDisplay(); oled_${u}.setTextColor(SSD1306_WHITE); oled_${u}.display();`);if(t==='tft')lines.push(`  SPI.begin(${pinConst(c,'sck')}, -1, ${pinConst(c,'mosi')}, ${pinConst(c,'cs')});`,`  tft_${u}.initR(INITR_BLACKTAB); tft_${u}.fillScreen(ST77XX_BLACK);`);if(t==='led')lines.push(`  pinMode(${pinConst(c,'sig')},OUTPUT); digitalWrite(${pinConst(c,'sig')},LOW);`);if(t==='rgb')['r','g','b'].forEach(k=>lines.push(`  pinMode(${pinConst(c,k)},OUTPUT); analogWrite(${pinConst(c,k)},0);`));if(t==='neo')lines.push(`  neo_${u}.begin(); neo_${u}.clear(); neo_${u}.show();`);if(t==='button')lines.push(`  pinMode(${pinConst(c,'sig')},INPUT_PULLUP);`);if(t==='encoder')lines.push(`  pinMode(${pinConst(c,'a')},INPUT_PULLUP); pinMode(${pinConst(c,'b')},INPUT_PULLUP);`);if(t==='joystick')lines.push(`  pinMode(${pinConst(c,'sw')},INPUT_PULLUP);`);if(t==='dht11'||t==='dht22')lines.push(`  dht_${u}.begin();`);if(t==='ldr'||t==='pir')lines.push(`  pinMode(${pinConst(c,'sig')},INPUT);`);if(t==='ultrasonic')lines.push(`  pinMode(${pinConst(c,'trig')},OUTPUT); pinMode(${pinConst(c,'echo')},INPUT);`);if(t==='mpu')lines.push(`  Wire.begin(${pinConst(c,'sda')}, ${pinConst(c,'scl')}); mpu_${u}.begin();`);if(t==='servo')lines.push(`  servo_${u}.setPeriodHertz(50); servo_${u}.attach(${pinConst(c,'sig')},500,2400);`);if(t==='relay')lines.push(`  pinMode(${pinConst(c,'sig')},OUTPUT); digitalWrite(${pinConst(c,'sig')},LOW);`);if(t==='motor')lines.push(`  pinMode(${pinConst(c,'in1')},OUTPUT); pinMode(${pinConst(c,'in2')},OUTPUT); pinMode(${pinConst(c,'ena')},OUTPUT);`);if(t==='stepper')['in1','in2','in3','in4'].forEach(k=>lines.push(`  pinMode(${pinConst(c,k)},OUTPUT);`));if(t==='buzzer'||t==='piezo')lines.push(`  pinMode(${pinConst(c,'sig')},OUTPUT);`);if(t==='irrx')lines.push(`  irrecv_${u}.enableIRIn();`);if(t==='irtx')lines.push(`  irsend_${u}.begin();`);if(t==='i2s')lines.push(`  // I2S speaker pins reserved: BCLK ${c.pins.bclk}, LRC ${c.pins.lrc}, DOUT ${c.pins.dout}. Add your amplifier/codec routine here.`)});
 if(state.iot){lines.push('  WiFi.softAP(DEVICE_AP, DEVICE_PASS);','  deviceServer.on("/", [](){','    String h="<meta name=viewport content=width=device-width><style>body{font-family:system-ui;background:#f5f5f7;padding:24px}a{display:block;padding:16px;margin:8px 0;background:#111;color:white;border-radius:14px;text-decoration:none}</style><h2>Vallian Device</h2>";');const led=components.find(c=>c.type==='led'),relay=components.find(c=>c.type==='relay'),servo=components.find(c=>c.type==='servo');if(led)lines.push('    h+="<a href=/led/on>LED ON</a><a href=/led/off>LED OFF</a>";');if(relay)lines.push('    h+="<a href=/relay/on>RELAY ON</a><a href=/relay/off>RELAY OFF</a>";');if(servo)lines.push('    h+="<a href=/servo/open>SERVO 90</a><a href=/servo/close>SERVO 0</a>";');lines.push('    deviceServer.send(200,"text/html",h);','  });');if(led)lines.push(`  deviceServer.on("/led/on", [](){digitalWrite(${pinConst(led,'sig')},HIGH);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`,`  deviceServer.on("/led/off", [](){digitalWrite(${pinConst(led,'sig')},LOW);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`);if(relay)lines.push(`  deviceServer.on("/relay/on", [](){digitalWrite(${pinConst(relay,'sig')},HIGH);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`,`  deviceServer.on("/relay/off", [](){digitalWrite(${pinConst(relay,'sig')},LOW);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`);if(servo)lines.push(`  deviceServer.on("/servo/open", [](){servo_${servo.uid}.write(90);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`,`  deviceServer.on("/servo/close", [](){servo_${servo.uid}.write(0);deviceServer.sendHeader("Location","/");deviceServer.send(303);});`);lines.push('  deviceServer.begin();')}
 lines.push('}','');
 lines.push('void loop(){');if(state.iot)lines.push('  deviceServer.handleClient();');
 state.rules.forEach((r,i)=>{
  const [tu,te]=r.trigger.split(':'),[au,ae]=r.action.split(':');const tc=compByUid(tu),ac=compByUid(au);let cond='false';
  if(r.trigger==='system:startup')cond=`!startupRule_${i}`;else if(r.trigger==='system:interval')cond=`millis()-lastRule_${i} >= ${(Math.max(.1,Number(r.threshold)||2)*1000).toFixed(0)}UL`;else if(tc){if(te==='pressed')cond=`digitalRead(${pinConst(tc,'sig')})==LOW`;if(te==='motion')cond=`digitalRead(${pinConst(tc,'sig')})==HIGH`;if(te==='tempAbove')cond=`dht_${tc.uid}.readTemperature() > ${Number(r.threshold)||30}`;if(te==='lightBelow')cond=`analogRead(${pinConst(tc,'sig')}) < ${Number(r.threshold)||1200}`;if(te==='distanceBelow')cond=`readDistanceCm(${pinConst(tc,'trig')},${pinConst(tc,'echo')}) < ${Number(r.threshold)||20}`;if(te==='xAbove')cond=`analogRead(${pinConst(tc,'x')}) > ${Number(r.threshold)||2500}`;if(te==='turned')cond=`encoderMoved_${tc.uid}()`;if(te==='key')cond=`keypad_${tc.uid}.getKey()!=NO_KEY`;if(te==='shake')cond=`mpuShake_${tc.uid}(${Number(r.threshold)||15})`;if(te==='ir')cond=`irrecv_${tc.uid}.decode(&irres_${tc.uid})`;}
  const action=[];if(ac){const val=r.value;if(ac.type==='led'){if(ae==='on')action.push(`digitalWrite(${pinConst(ac,'sig')},HIGH);`);if(ae==='off')action.push(`digitalWrite(${pinConst(ac,'sig')},LOW);`);if(ae==='toggle')action.push(`digitalWrite(${pinConst(ac,'sig')},!digitalRead(${pinConst(ac,'sig')}));`)}if(ac.type==='rgb'&&ae==='color'){const [rr,gg,bb]=hexRgb(val);action.push(`analogWrite(${pinConst(ac,'r')},${rr}); analogWrite(${pinConst(ac,'g')},${gg}); analogWrite(${pinConst(ac,'b')},${bb});`)}if(ac.type==='neo'){if(ae==='off')action.push(`neo_${ac.uid}.clear(); neo_${ac.uid}.show();`);if(ae==='color'){const [rr,gg,bb]=hexRgb(val);action.push(`neo_${ac.uid}.fill(neo_${ac.uid}.Color(${rr},${gg},${bb})); neo_${ac.uid}.show();`)}}if(ac.type==='oled'){if(ae==='clear')action.push(`oled_${ac.uid}.clearDisplay(); oled_${ac.uid}.display();`);if(ae==='text')action.push(`oled_${ac.uid}.clearDisplay(); oled_${ac.uid}.setTextSize(1); oled_${ac.uid}.setCursor(0,24); oled_${ac.uid}.print(${cppString(val||'HELLO')}); oled_${ac.uid}.display();`)}if(ac.type==='tft'){if(ae==='clear')action.push(`tft_${ac.uid}.fillScreen(ST77XX_BLACK);`);if(ae==='text')action.push(`tft_${ac.uid}.fillScreen(ST77XX_BLACK); tft_${ac.uid}.setTextColor(ST77XX_WHITE); tft_${ac.uid}.setTextSize(2); tft_${ac.uid}.setCursor(8,20); tft_${ac.uid}.print(${cppString(val||'HELLO')});`)}if(ac.type==='relay'){action.push(`digitalWrite(${pinConst(ac,'sig')},${ae==='on'?'HIGH':'LOW'});`)}if(ac.type==='servo')action.push(`servo_${ac.uid}.write(${clamp(val||90,0,180)});`);if(ac.type==='buzzer')action.push(`digitalWrite(${pinConst(ac,'sig')},HIGH); delay(${clamp(val||160,20,1500)}); digitalWrite(${pinConst(ac,'sig')},LOW);`);if(ac.type==='piezo')action.push(`tone(${pinConst(ac,'sig')},${clamp(val||880,80,5000)},180);`);if(ac.type==='motor'){if(ae==='stop')action.push(`digitalWrite(${pinConst(ac,'in1')},LOW); digitalWrite(${pinConst(ac,'in2')},LOW); analogWrite(${pinConst(ac,'ena')},0);`);else action.push(`digitalWrite(${pinConst(ac,'in1')},HIGH); digitalWrite(${pinConst(ac,'in2')},LOW); analogWrite(${pinConst(ac,'ena')},${clamp(val||200,0,255)});`)}if(ac.type==='stepper')action.push(`stepperMove_${ac.uid}(${Math.round(Number(val)||64)});`);if(ac.type==='irtx'){let hx=String(val||'0x20DF10EF');if(!/^0x[0-9a-f]+$/i.test(hx))hx='0x20DF10EF';action.push(`irsend_${ac.uid}.sendNEC(${hx},32);`)}}
  lines.push(`  if((${cond}) && millis()-lastRule_${i}>250){`,`    lastRule_${i}=millis();`);if(r.trigger==='system:startup')lines.push(`    startupRule_${i}=true;`);action.forEach(x=>lines.push('    '+x));if(tc&&te==='ir')lines.push(`    irrecv_${tc.uid}.resume();`);lines.push('  }');
 });
 lines.push('  delay(5);','}');
 const code=lines.join('\n');if(force||!$('#generatedCode').matches(':focus'))$('#generatedCode').value=code;$('#codeLines').textContent=code.split('\n').length+' lines';const ls=libs();$('#librarySummary').textContent=ls.length?ls.join(' · '):'No extra libraries.';return code;
}

async function buildDevice(){const btn=$('#buildDevice'),status=$('#deviceBuildStatus'),dl=$('#deviceDownload');const code=$('#generatedCode').value.trim()||generateCode(true);if(!state.components.length){status.className='device-build-status bad';status.innerHTML='<strong>Add hardware first</strong><span>The composer has nothing to build yet.</span>';return}btn.disabled=true;dl.classList.add('hidden');status.className='device-build-status busy';status.innerHTML='<strong>Queuing build…</strong><span>Sending generated sketch to the existing compiler.</span>';try{const payload={name:state.name||'Device Composer',code,libraries:libs(),preserveOta:false};const r=await fetch('/api/build-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Could not start build');status.innerHTML='<strong>Compiling…</strong><span>Waiting for GitHub Actions.</span>';const b=await pollBuild(data.commit,status);status.className='device-build-status good';status.innerHTML=`<strong>BIN ready</strong><span>${Math.round(b.size/1024)} KB · ${escapeHtml(b.name)}</span>`;dl.href='/'+b.file;dl.classList.remove('hidden')}catch(e){status.className='device-build-status bad';status.innerHTML=`<strong>Build failed</strong><span>${escapeHtml(e.message||String(e))}</span>`}finally{btn.disabled=false}}
async function pollBuild(commit,status){for(let i=0;i<75;i++){await wait(i?4000:2500);const r=await fetch('/builds.json?t='+Date.now(),{cache:'no-store'}).catch(()=>null);if(!r?.ok)continue;const b=(await r.json()).find(x=>x.commit===commit);if(b?.status==='ready'&&b.file)return b;if(b?.status==='failed')throw new Error('Compiler failed. Check Builds.');status.querySelector('span').textContent=`Compiling… ${Math.min(99,8+i*2)}%`}throw new Error('Build is still running. Check Builds in a few minutes.')}

function showView(name){$$('.composer-tab').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.composer-view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));if(name==='wiring')renderWiring();if(name==='simulate')renderSim();if(name==='code')generateCode(false);scrollTo({top:Math.max(0,$('.composer-tabs').offsetTop-82),behavior:'smooth'})}
function save(feedback=true){state.name=$('#deviceProjectName').value.trim()||'My ESP32 Device';state.iot=$('#iotEnabled')?.checked??state.iot;localStorage.setItem(STORE,JSON.stringify(state));if(feedback){const b=$('#saveDevice'),old=b.textContent;b.textContent='Saved';setTimeout(()=>b.textContent=old,900)}}
function load(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x&&Array.isArray(x.components)){state=x;const nums=state.components.map(c=>Number(String(c.uid).replace(/\D/g,''))||0);seq=Math.max(1,...nums)+1}}catch{}$('#deviceProjectName').value=state.name||'My ESP32 Device'}
function exportState(){save(false);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download=(state.name||'device').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importState(file){try{const x=JSON.parse(await file.text());if(!x||!Array.isArray(x.components))throw new Error('Invalid project');state=x;const nums=state.components.map(c=>Number(String(c.uid).replace(/\D/g,''))||0);seq=Math.max(1,...nums)+1;$('#deviceProjectName').value=state.name||'Imported Device';renderAll();save(false)}catch(e){alert(e.message||'Import failed')}}
function reset(){if(!confirm('Reset Device Composer project?'))return;state={name:'My ESP32 Device',components:[],rules:[],iot:false};seq=1;$('#deviceProjectName').value=state.name;renderAll();save(false)}
function renderAll(){renderLibrary();renderSelected();renderLogic();renderWiring();renderSim();generateCode(false)}

function init(){load();renderCategories();renderPresets();renderAll();$('#componentSearch').oninput=renderLibrary;$('#addRule').onclick=addRule;$('#runSimulation').onclick=runSimulation;$('#iotEnabled').onchange=()=>{state.iot=$('#iotEnabled').checked;generateCode(false);save(false)};$('#generateCode').onclick=()=>generateCode(true);$('#copyCode').onclick=async()=>{await navigator.clipboard.writeText($('#generatedCode').value);const b=$('#copyCode'),old=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=old,900)};$('#buildDevice').onclick=buildDevice;$('#saveDevice').onclick=()=>save(true);$('#exportDevice').onclick=exportState;$('#importDevice').onchange=e=>e.target.files[0]&&importState(e.target.files[0]);$('#resetDevice').onclick=reset;$('#deviceProjectName').oninput=()=>{state.name=$('#deviceProjectName').value;save(false)};$$('.composer-tab').forEach(b=>b.onclick=()=>showView(b.dataset.view))}
init();
})();