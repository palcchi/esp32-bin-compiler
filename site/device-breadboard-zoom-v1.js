(()=>{
'use strict';
if(window.__deviceBreadboardZoomV1)return;window.__deviceBreadboardZoomV1=true;
const host=()=>document.querySelector('#breadboardCanvasV7');
let scale=1;
function apply(){const h=host(),svg=h?.querySelector('svg[data-v9="1"]');if(!h||!svg)return;const vb=svg.viewBox?.baseVal;if(!vb?.width||!vb?.height)return;const w=Math.max(h.clientWidth-2,vb.width*scale),ratio=w/vb.width;svg.style.width=w+'px';svg.style.height=(vb.height*ratio)+'px';const out=document.querySelector('#breadboardZoomValue');if(out)out.value=Math.round(scale*100)+'%'}
function controls(){const bar=document.querySelector('.breadboard-toolbar-v7');if(!bar||bar.querySelector('.breadboard-zoom-v1'))return;const box=document.createElement('div');box.className='breadboard-zoom-v1';box.innerHTML='<button type="button" id="breadboardZoomOut" aria-label="Zoom out">−</button><output id="breadboardZoomValue">100%</output><button type="button" id="breadboardZoomIn" aria-label="Zoom in">+</button><button type="button" id="breadboardZoomFit" aria-label="Reset zoom">⌂</button>';bar.append(box);document.querySelector('#breadboardZoomOut').onclick=()=>{scale=Math.max(.7,+(scale-.1).toFixed(2));apply()};document.querySelector('#breadboardZoomIn').onclick=()=>{scale=Math.min(1.7,+(scale+.1).toFixed(2));apply()};document.querySelector('#breadboardZoomFit').onclick=()=>{scale=1;apply();const h=host();h?.scrollTo({left:0,top:0,behavior:'smooth'})}}
function init(){controls();apply();const h=host();if(h)new MutationObserver(()=>requestAnimationFrame(apply)).observe(h,{childList:true,subtree:false});addEventListener('resize',()=>requestAnimationFrame(apply),{passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,420));else setTimeout(init,420);
})();
