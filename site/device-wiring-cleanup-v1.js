(()=>{
'use strict';
if(window.__deviceWiringCleanupV1)return;window.__deviceWiringCleanupV1=true;
const host=()=>document.querySelector('#breadboardCanvasV7');
let raf=0;
function addRailLabels(svg){svg.querySelectorAll('.board-zone-v9').forEach((g,zoneIndex)=>{
 if(g.dataset.railClean==='1')return;g.dataset.railClean='1';
 const lines=[...g.querySelectorAll(':scope > line')].filter(x=>!x.classList.contains('breadboard-center-v9'));
 if(lines.length>=6){
  const rect=g.querySelector('rect');if(!rect)return;const x=Number(rect.getAttribute('x')),y=Number(rect.getAttribute('y')),w=Number(rect.getAttribute('width')),h=Number(rect.getAttribute('height'));
  const set=(line,yy,stroke,show=true)=>{line.setAttribute('y1',yy);line.setAttribute('y2',yy);line.setAttribute('stroke',stroke);line.style.display=show?'':'none'};
  set(lines[0],y+30,'#d96562',true);set(lines[1],y+40,'#dc9440',false);set(lines[2],y+50,'#4d5878',true);
  set(lines[3],y+h-50,'#4d5878',true);set(lines[4],y+h-40,'#dc9440',false);set(lines[5],y+h-30,'#d96562',true);
  [['+',y+30,'#b94f4c'],['−',y+50,'#3e4968'],['−',y+h-50,'#3e4968'],['+',y+h-30,'#b94f4c']].forEach(([txt,yy,fill])=>{
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',x+7);t.setAttribute('y',yy+3);t.setAttribute('fill',fill);t.setAttribute('font-size','8');t.setAttribute('font-weight','900');t.setAttribute('text-anchor','middle');t.textContent=txt;g.appendChild(t)
  });
 }
 });
}
function keepBoardOnTop(svg){
 const zones=[...svg.querySelectorAll('.esp-v9')];zones.forEach(esp=>{const p=esp.parentNode;if(p)p.appendChild(esp)});
}
function separateNearOverlaps(svg){
 const groups=[...svg.querySelectorAll('.wire-group-v9')];
 const rows=[];
 groups.forEach((g,i)=>{
  const p=g.querySelector('.wire-v9');if(!p)return;
  p.removeAttribute('transform');g.dataset.cleanOffset='0';
  let b;try{b=p.getBBox()}catch{return}
  const horizontal=b.width>=b.height;
  let cluster=rows.find(r=>r.horizontal===horizontal&&Math.abs((horizontal?b.y:b.x)-(horizontal?r.b.y:r.b.x))<3&&overlap(horizontal?b.x:b.y,horizontal?b.x+b.width:b.y+b.height,horizontal?r.b.x:r.b.y,horizontal?r.b.x+r.b.width:r.b.y+r.b.height)>.55);
  if(!cluster){cluster={horizontal,b,count:0};rows.push(cluster)}
  const n=cluster.count++;
  if(n){const offset=(Math.ceil(n/2)*2.6)*(n%2?1:-1);const tr=horizontal?`translate(0 ${offset})`:`translate(${offset} 0)`;g.querySelectorAll('path').forEach(x=>x.setAttribute('transform',tr));g.dataset.cleanOffset=String(offset)}
 });
}
function overlap(a1,a2,b1,b2){const n=Math.max(0,Math.min(a2,b2)-Math.max(a1,b1));return n/Math.max(1,Math.min(a2-a1,b2-b1))}
function polish(){const svg=host()?.querySelector('svg[data-v9="1"]');if(!svg)return;addRailLabels(svg);separateNearOverlaps(svg);keepBoardOnTop(svg);svg.classList.add('wiring-clean-v1')}
function queue(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(polish))}
function init(){const h=host();if(!h)return;queue();new MutationObserver(queue).observe(h,{childList:true,subtree:false});document.addEventListener('pointerup',e=>{if(e.target.closest('#breadboardCanvasV7'))setTimeout(queue,80)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,260));else setTimeout(init,260);
})();
