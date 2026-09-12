(()=>{
'use strict';
if(window.__deviceSnapSoundV1)return;window.__deviceSnapSoundV1=true;
let ctx=null,unlocked=false,down=null;
function ensure(){try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();unlocked=ctx.state==='running'||unlocked;return ctx}catch{return null}}
function snap(){const c=ensure();if(!c||!unlocked)return;try{const t=c.currentTime,g=c.createGain(),o1=c.createOscillator(),o2=c.createOscillator();o1.type='triangle';o2.type='sine';o1.frequency.setValueAtTime(760,t);o1.frequency.exponentialRampToValueAtTime(1180,t+.045);o2.frequency.setValueAtTime(220,t);o2.frequency.exponentialRampToValueAtTime(140,t+.055);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.085);o1.connect(g);o2.connect(g);g.connect(c.destination);o1.start(t);o2.start(t);o1.stop(t+.09);o2.stop(t+.09)}catch{}}
function unlock(){const c=ensure();if(!c)return;Promise.resolve(c.resume?.()).finally(()=>{unlocked=true;try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start()}catch{}})}
window.VallianSnapSound={unlock,snap};
['pointerdown','touchstart','keydown','click'].forEach(type=>window.addEventListener(type,unlock,{once:true,passive:true,capture:true}));
document.addEventListener('pointerdown',e=>{const p=e.target.closest?.('#breadboardCanvasV7 .part-v9');if(!p)return;down={x:e.clientX,y:e.clientY,uid:p.getAttribute('data-v9-uid')}} ,true);
window.addEventListener('pointerup',e=>{if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);const inside=e.target.closest?.('#breadboardCanvasV7')||document.querySelector('#breadboardCanvasV7');const moved=d>4;down=null;if(moved&&inside)setTimeout(snap,95)},true);
})();
