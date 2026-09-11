(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORE='vallian-device-composer-v1';
const META={
 oled:['OLED SSD1306','Display'],tft:['TFT ST7735','Display'],led:['LED','Light'],rgb:['RGB LED','Light'],neo:['WS2812B / NeoPixel','Light'],button:['Push Button','Input'],encoder:['Rotary Encoder','Input'],joystick:['Joystick','Input'],keypad:['4×4 Keypad','Input'],dht11:['DHT11','Sensor'],dht22:['DHT22','Sensor'],ldr:['LDR','Sensor'],pir:['PIR Motion','Sensor'],ultrasonic:['HC-SR04','Sensor'],mpu:['MPU6050','Sensor'],servo:['SG90 Servo','Actuator'],relay:['Relay Module','Actuator'],motor:['DC Motor + L298N','Actuator'],stepper:['Stepper + ULN2003','Actuator'],buzzer:['Active Buzzer','Audio'],piezo:['Passive Buzzer','Audio'],irrx:['IR Receiver','Wireless'],irtx:['IR Transmitter','Wireless'],i2s:['I2S Speaker','Audio']
};
const catClass=cat=>'cat-'+String(cat||'').toLowerCase();
const readState=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'null')||{components:[],rules:[],iot:false}}catch{return {components:[],rules:[],iot:false}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let runToken=0,stepIndex=0;

function decorateDevices(){
 const state=readState(),byUid=new Map((state.components||[]).map(c=>[c.uid,c]));
 $$('.component-item[data-type]').forEach(el=>{const cat=META[el.dataset.type]?.[1];if(cat)el.classList.add(catClass(cat))});
 $$('.selected-component[data-uid]').forEach(el=>{const c=byUid.get(el.dataset.uid),cat=META[c?.type]?.[1];if(cat)el.classList.add(catClass(cat))});
 $$('.sim-node[data-sim]').forEach(el=>{const c=byUid.get(el.dataset.sim),cat=META[c?.type]?.[1];if(cat)el.classList.add(catClass(cat))});
}

function triggerLabel(rule,state){
 if(rule.trigger==='system:startup')return ['System startup','Runs once when the device boots'];
 if(rule.trigger==='system:interval')return ['Timer',`Every ${rule.threshold||2} seconds`];
 const [uid,event]=String(rule.trigger||'').split(':'),c=(state.components||[]).find(x=>x.uid===uid),name=META[c?.type]?.[0]||'Input';
 const map={pressed:'Button pressed',motion:'Motion detected',tempAbove:`Temperature > ${rule.threshold||30}°C`,lightBelow:`Light < ${rule.threshold||1200}`,distanceBelow:`Distance < ${rule.threshold||20} cm`,xAbove:`X > ${rule.threshold||2500}`,turned:'Encoder turned',key:'Key pressed',shake:`Shake > ${rule.threshold||15}`,ir:'IR signal received'};
 return [name,map[event]||event||'Trigger'];
}
function actionLabel(rule,state){
 const [uid,action]=String(rule.action||'').split(':'),c=(state.components||[]).find(x=>x.uid===uid),name=META[c?.type]?.[0]||'Output';
 const v=rule.value?` · ${rule.value}`:'';
 const map={on:'Turn ON',off:'Turn OFF',toggle:'Toggle',color:'Set color',text:'Show text',clear:'Clear display',angle:'Move servo',beep:'Beep',tone:'Play tone',forward:'Motor forward',stop:'Motor stop',steps:'Move stepper',send:'Send IR'};
 return [name,(map[action]||action||'Action')+v];
}
function triggerButtonText(rule,state){
 const [,detail]=triggerLabel(rule,state);
 if(detail.startsWith('Button'))return 'Press button';
 if(detail.startsWith('Motion'))return 'Detect motion';
 if(detail.startsWith('Temperature'))return 'Raise temperature';
 if(detail.startsWith('Light'))return 'Dim light';
 if(detail.startsWith('Distance'))return 'Move object closer';
 if(detail.startsWith('Encoder'))return 'Turn encoder';
 if(detail.startsWith('Key'))return 'Press key';
 if(detail.startsWith('Shake'))return 'Shake device';
 if(detail.startsWith('IR'))return 'Receive IR';
 if(detail.startsWith('Every'))return 'Tick timer';
 if(detail.includes('startup'))return 'Boot device';
 return 'Trigger rule';
}

function ensureSimulationUI(){
 const sim=$('.simulator');if(!sim||sim.dataset.enhanced)return;
 sim.dataset.enhanced='1';
 const head=sim.querySelector('.panel-head'),run=$('#runSimulation');
 if(head&&run){
   const actions=document.createElement('div');actions.className='sim-head-actions';
   const step=document.createElement('button');step.id='stepSimulation';step.className='button secondary';step.type='button';step.textContent='Step';
   const speed=document.createElement('select');speed.id='simSpeed';speed.className='sim-speed';speed.setAttribute('aria-label','Simulation speed');speed.innerHTML='<option value="950">Slow</option><option value="620" selected>Normal</option><option value="360">Fast</option>';
   run.remove();actions.append(run,step,speed);head.append(actions);
 }
 const device=sim.querySelector('.sim-device');
 if(device){
   const summary=document.createElement('div');summary.id='simSummary';summary.className='sim-summary';device.before(summary);
   const progress=document.createElement('div');progress.className='sim-progress';progress.innerHTML='<i id="simProgressBar"></i>';
   const flow=document.createElement('div');flow.id='simFlow';flow.className='sim-flow';
   flow.innerHTML='<div class="sim-flow-card trigger"><small>TRIGGER</small><strong>Nothing selected</strong><span>Choose a rule below.</span></div><div class="sim-flow-arrow">→</div><div class="sim-flow-card action"><small>ACTION</small><strong>Waiting</strong><span>The result appears here.</span></div>';
   const nodes=device.querySelector('.sim-nodes');device.insertBefore(progress,nodes);device.insertBefore(flow,nodes);
 }
 const log=$('#simLog');if(log){
   const panel=document.createElement('div');panel.className='sim-trigger-panel';panel.innerHTML='<div class="sim-trigger-panel-head"><strong>Test inputs</strong><span>Tap one to see what happens</span></div><div id="simTriggerList" class="sim-trigger-list"></div>';
   log.before(panel);
 }
 $('#runSimulation')?.addEventListener('click',enhancedRun);
 $('#stepSimulation')?.addEventListener('click',stepSimulation);
 refreshSimulation();
}

function refreshSimulation(){
 ensureSimulationUI();const state=readState(),comps=state.components||[],rules=state.rules||[];
 decorateDevices();
 const sum=$('#simSummary');if(sum)sum.innerHTML=`<div class="sim-summary-card"><small>HARDWARE</small><strong>${comps.length} components</strong></div><div class="sim-summary-card"><small>AUTOMATION</small><strong>${rules.length} rules</strong></div><div class="sim-summary-card"><small>LOCAL IOT</small><strong>${state.iot?'Enabled':'Off'}</strong></div>`;
 const list=$('#simTriggerList');if(list){
   list.innerHTML=rules.length?rules.map((r,i)=>`<button type="button" class="sim-trigger-button" data-sim-rule="${i}">${esc(triggerButtonText(r,state))}</button>`).join(''):'<span class="muted">Add a rule in Logic first.</span>';
   $$('[data-sim-rule]').forEach(b=>b.onclick=()=>playRule(Number(b.dataset.simRule),false));
 }
 const log=$('#simLog');if(log&&rules.length){log.innerHTML=rules.map((r,i)=>{const [tn,td]=triggerLabel(r,state),[an,ad]=actionLabel(r,state);return `<span data-step="${i+1}" data-log-rule="${i}"><b>${esc(tn)}: ${esc(td)}</b><small>${esc(an)}: ${esc(ad)}</small></span>`}).join('')}
 if(rules.length){showRule(Math.min(stepIndex,rules.length-1),false)}else resetVisual('NO RULES');
}

function showRule(index,active=true){
 const state=readState(),rules=state.rules||[],r=rules[index];if(!r)return;
 stepIndex=index;const [tn,td]=triggerLabel(r,state),[an,ad]=actionLabel(r,state),flow=$('#simFlow');
 if(flow){const cards=flow.querySelectorAll('.sim-flow-card');cards[0].innerHTML=`<small>TRIGGER</small><strong>${esc(tn)}</strong><span>${esc(td)}</span>`;cards[1].innerHTML=`<small>ACTION</small><strong>${esc(an)}</strong><span>${esc(ad)}</span>`;cards.forEach(c=>c.classList.toggle('active',active))}
 $$('.sim-node').forEach(n=>n.classList.remove('active'));
 const tu=String(r.trigger||'').split(':')[0],au=String(r.action||'').split(':')[0];
 if(tu&&!r.trigger.startsWith('system:'))document.querySelector(`[data-sim="${CSS.escape(tu)}"]`)?.classList.add('active');
 if(au)document.querySelector(`[data-sim="${CSS.escape(au)}"]`)?.classList.add('active');
 $$('[data-log-rule]').forEach((x,i)=>{x.classList.toggle('running',active&&i===index);if(i<index)x.classList.add('done');else if(i>=index)x.classList.remove('done')});
 const screen=$('#simScreen');if(screen){screen.classList.toggle('is-running',active);screen.innerHTML=`<span>${esc((ad||'ACTION').toUpperCase().slice(0,26))}</span>`}
 const bar=$('#simProgressBar');if(bar)bar.style.width=((index+1)/rules.length*100)+'%';
}
function resetVisual(text='DEVICE READY'){$$('.sim-node').forEach(n=>n.classList.remove('active'));$$('[data-log-rule]').forEach(x=>x.classList.remove('running','done'));const s=$('#simScreen');if(s){s.classList.remove('is-running');s.innerHTML=`<span>${esc(text)}</span>`}const b=$('#simProgressBar');if(b)b.style.width='0%'}
async function playRule(index,auto=true){
 const state=readState(),rules=state.rules||[];if(!rules[index])return;showRule(index,true);const ms=Number($('#simSpeed')?.value||620);await wait(auto?ms:Math.min(ms,420));if(!auto){$('#simScreen')?.classList.remove('is-running');$$('.sim-node').forEach(n=>n.classList.remove('active'));}
}
async function enhancedRun(e){
 e?.preventDefault?.();const state=readState(),rules=state.rules||[],token=++runToken,btn=$('#runSimulation');if(!rules.length){refreshSimulation();return}
 if(btn){btn.disabled=true;btn.textContent='Running…'}resetVisual('STARTING');
 for(let i=0;i<rules.length;i++){if(token!==runToken)break;await playRule(i,true)}
 if(token===runToken){const s=$('#simScreen');if(s){s.classList.remove('is-running');s.innerHTML='<span>SIMULATION COMPLETE</span>'}$$('.sim-node').forEach(n=>n.classList.remove('active'));$$('[data-log-rule]').forEach(x=>{x.classList.remove('running');x.classList.add('done')});const b=$('#simProgressBar');if(b)b.style.width='100%'}
 if(btn){btn.disabled=false;btn.textContent='Run all'}
}
function stepSimulation(){const rules=readState().rules||[];if(!rules.length){refreshSimulation();return}playRule(stepIndex%rules.length,false);stepIndex=(stepIndex+1)%rules.length}

function wireObservers(){
 const targets=['#componentLibrary','#selectedComponents','#categoryChips','#simNodes','#logicRules'];
 targets.forEach(sel=>{const el=$(sel);if(!el)return;new MutationObserver(()=>{decorateDevices();if(sel==='#simNodes'||sel==='#logicRules')setTimeout(refreshSimulation,0)}).observe(el,{childList:true,subtree:true})});
 window.addEventListener('storage',refreshSimulation);
 document.addEventListener('click',e=>{if(e.target.closest('[data-preset],[data-remove],#addRule,[data-r-remove]'))setTimeout(refreshSimulation,40)});
 document.addEventListener('change',e=>{if(e.target.matches('[data-r-trigger],[data-r-action],[data-r-threshold],[data-r-value],#iotEnabled'))setTimeout(refreshSimulation,40)});
}
function init(){ensureSimulationUI();decorateDevices();wireObservers();const run=$('#runSimulation');if(run)run.textContent='Run all'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
