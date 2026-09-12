(()=>{
'use strict';
if(window.__deviceSnapSoundV1)return;window.__deviceSnapSoundV1=true;
let ctx=null,unlocked=false,down=null;
function ensure(){try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();return ctx}catch{return null}}
function play(c){try{const t=c.currentTime,g=c.createGain(),o1=c.createOscillator(),o2=c.createOscillator();o1.type='triangle';o2.type='sine';o1.frequency.setValueAtTime(720,t);o1.frequency.exponentialRampToValueAtTime(1240,t+.045);o2.frequency.setValueAtTime(240,t);o2.frequency.exponentialRampToValueAtTime(150,t+.065);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.075,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o1.connect(g);o2.connect(g);g.connect(c.destination);o1.start(t);o2.start(t);o1.stop(t+.095);o2.stop(t+.095)}catch{}}
function snap(){const c=ensure();if(!c)return;if(c.state==='running'){unlocked=true;play(c);return}Promise.resolve(c.resume?.()).then(()=>{unlocked=true;play(c)}).catch(()=>{})}
function unlock(){const c=ensure();if(!c)return;Promise.resolve(c.resume?.()).then(()=>{unlocked=true;try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start()}catch{}}).catch(()=>{})}
window.VallianSnapSound={unlock,snap};
['pointerdown','touchstart','keydown','click'].forEach(type=>window.addEventListener(type,unlock,{once:true,passive:true,capture:true}));
document.addEventListener('pointerdown',e=>{const p=e.target.closest?.('#breadboardCanvasV7 .part-v9');if(!p)return;unlock();down={x:e.clientX,y:e.clientY,uid:p.getAttribute('data-v9-uid')}} ,true);
window.addEventListener('pointerup',e=>{if(!down)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y),moved=d>4;down=null;if(moved)setTimeout(snap,95)},true);
})();
