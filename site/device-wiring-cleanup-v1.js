(()=>{
'use strict';
if(window.__deviceWiringCleanupV2)return;window.__deviceWiringCleanupV2=true;
const host=()=>document.querySelector('#breadboardCanvasV7');
let raf=0;
function addRailLabels(svg){svg.querySelectorAll('.board-zone-v9').forEach(g=>{
 if(g.dataset.railClean==='1')return;g.dataset.railClean='1';
 const lines=[...g.querySelectorAll(':scope > line')].filter(x=>!x.classList.contains('breadboard-center-v9'));
 if(lines.length<6)return;
 const rect=g.querySelector('rect');if(!rect)return;const x=Number(rect.getAttribute('x')),y=Number(rect.getAttribute('y')),h=Number(rect.getAttribute('height'));
 const set=(line,yy,stroke,show=true)=>{line.setAttribute('y1',yy);line.setAttribute('y2',yy);line.setAttribute('stroke',stroke);line.style.display=show?'':'none'};
 set(lines[0],y+30,'#d96562',true);set(lines[1],y+40,'#dc9440',false);set(lines[2],y+50,'#4d5878',true);
 set(lines[3],y+h-50,'#4d5878',true);set(lines[4],y+h-40,'#dc9440',false);set(lines[5],y+h-30,'#d96562',true);
 [['+',y+30,'#b94f4c'],['−',y+50,'#3e4968'],['−',y+h-50,'#3e4968'],['+',y+h-30,'#b94f4c']].forEach(([txt,yy,fill])=>{
  const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.classList.add('rail-mark-v2');t.setAttribute('x',x+7);t.setAttribute('y',yy+3);t.setAttribute('fill',fill);t.setAttribute('font-size','8');t.setAttribute('font-weight','900');t.setAttribute('text-anchor','middle');t.textContent=txt;g.appendChild(t)
 })
 })}
function layerHardware(svg){
 [...svg.querySelectorAll('.part-v9')].forEach(part=>part.parentNode?.appendChild(part));
 [...svg.querySelectorAll('.v11-support-part')].forEach(part=>part.parentNode?.appendChild(part));
 [...svg.querySelectorAll('.esp-v9')].forEach(esp=>esp.parentNode?.appendChild(esp));
}
function polish(){const svg=host()?.querySelector('svg[data-v9="1"]');if(!svg)return;addRailLabels(svg);svg.querySelectorAll('.wire-group-v9 path').forEach(p=>p.removeAttribute('transform'));layerHardware(svg);svg.classList.add('wiring-clean-v2')}
function queue(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(polish))}
function init(){const h=host();if(!h)return;queue();new MutationObserver(queue).observe(h,{childList:true,subtree:false});document.addEventListener('pointerup',e=>{if(e.target.closest('#breadboardCanvasV7'))setTimeout(queue,80)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,260));else setTimeout(init,260);
})();
