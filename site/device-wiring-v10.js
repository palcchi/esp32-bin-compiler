(()=>{
'use strict';
if(window.__deviceWiringV11)return;window.__deviceWiringV11=true;
async function boot(){
 try{
  const res=await fetch('/device-wiring-v9.js?v=1',{cache:'no-store'});
  if(!res.ok)throw new Error('V9 source '+res.status);
  let src=await res.text();
  const swap=(from,to,label)=>{if(!src.includes(from))console.warn('[Wiring V11] patch miss:',label);else src=src.replace(from,to)};
  swap("if(window.__deviceWiringV9)return;window.__deviceWiringV9=true;","if(window.__deviceWiringV9Fixed)return;window.__deviceWiringV9Fixed=true;",'guard');
  swap("const op=selectedUid&&selectedUid!==w.uid?.12:1;","const op=(selectedUid&&selectedUid!==w.uid)?0.12:1;",'opacity typo');
  swap("const zoneH=590,boardX=242,espX=28,espW=140,espH=250,zoneScenes=[];","const zoneH=590,boardX=276,espX=34,espW=132,espH=238,zoneScenes=[];",'board spacing');
  swap("pinStart=boardX+(col+1)*hole","pinStart=boardX+19+col*hole",'physical hole x');
  swap("topPinY=boardY+120,bottomPinY=boardY+290","topPinY=boardY+115,bottomPinY=boardY+297",'physical hole y');
  swap("col=Math.max(1,Math.round((firstPin-z.boardX)/lastScene.hole)-1)","col=Math.max(0,Math.round((firstPin-(z.boardX+19))/lastScene.hole))",'drag snap grid');
  swap("const laneY=p.row==='top'?z.boardY+65+n*6:z.boardY+z.boardH-65-n*6,src=espAnchor(String(w.pin),z.espX,z.espY,z.espW,z.espH),gutter=src.side==='right'?188+n*3:12-n*3;","const laneY=p.row==='top'?z.boardY+72+n*9:z.boardY+z.boardH-72-n*9,src=espAnchor(String(w.pin),z.espX,z.espY,z.espW,z.espH),gutter=src.side==='right'?198+n*5:12-n*5;",'signal lane spacing');
  swap("const aroundY=src.y<z.espY+z.espH/2?z.espY-22:z.espY+z.espH+22;path=`M${src.x} ${src.y}H${gutter}V${aroundY}H${205+n*3}V${laneY}H${ep.x}V${ep.y}`","const aroundY=src.y<z.espY+z.espH/2?z.espY-30:z.espY+z.espH+30;path=`M${src.x} ${src.y}H${gutter}V${aroundY}H${228+n*5}V${laneY}H${ep.x}V${ep.y}`",'left signal detour');
  swap("w.kind==='ground'?(top?z.boardY+56:z.boardY+z.boardH-56):(w.source==='3V3'?(top?z.boardY+24:z.boardY+z.boardH-24):(top?z.boardY+40:z.boardY+z.boardH-40))","w.kind==='ground'?(top?z.boardY+50:z.boardY+z.boardH-50):(w.source==='3V3'?z.boardY+30:z.boardY+z.boardH-30)",'power rail targets');
  swap("if(needs.v33){const a=espAnchor('3V3',z.espX,z.espY,z.espW,z.espH);svg+=wire(`M${a.x} ${a.y}H205V${z.boardY+24}H${z.boardX+14}`,'#d96562','power')}","if(needs.v33){const a=espAnchor('3V3',z.espX,z.espY,z.espW,z.espH),px=a.side==='left'?12:210,ay=z.espY-30;svg+=wire(`M${a.x} ${a.y}H${px}V${ay}H230V${z.boardY+30}H${z.boardX+14}`,'#d96562','power')}",'3V3 detour');
  swap("if(needs.v5&&!needs.ext5){const a=espAnchor('5V',z.espX,z.espY,z.espW,z.espH);svg+=wire(`M${a.x} ${a.y}H212V${z.boardY+40}H${z.boardX+14}`,'#dc9440','power')}","if(needs.v5&&!needs.ext5){const a=espAnchor('5V',z.espX,z.espY,z.espW,z.espH),px=a.side==='left'?12:218,ay=z.espY+z.espH+30;svg+=wire(`M${a.x} ${a.y}H${px}V${ay}H236V${z.boardY+z.boardH-30}H${z.boardX+14}`,'#dc9440','power')}",'5V detour');
  swap("if(needs.ext5)svg+=`<rect x=\"178\" y=\"${z.boardY+28}\" width=\"45\" height=\"24\" rx=\"8\" fill=\"#fff\" stroke=\"#dc9440\"/><text x=\"200\" y=\"${z.boardY+43}\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"850\" fill=\"#9c682f\">EXT 5V</text>`+wire(`M223 ${z.boardY+40}H${z.boardX+14}`,'#dc9440','power');","if(needs.ext5)svg+=`<rect x=\"184\" y=\"${z.boardY+z.boardH-51}\" width=\"48\" height=\"26\" rx=\"8\" fill=\"#fff\" stroke=\"#dc9440\"/><text x=\"208\" y=\"${z.boardY+z.boardH-35}\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"850\" fill=\"#9c682f\">EXT 5V</text>`+wire(`M232 ${z.boardY+z.boardH-38}H244V${z.boardY+z.boardH-30}H${z.boardX+14}`,'#dc9440','power');",'external 5V route');
  swap("const around=a.side==='left'?`M${a.x} ${a.y}H12V${z.boardY+56}H${z.boardX+14}`:`M${a.x} ${a.y}H219V${z.boardY+56}H${z.boardX+14}`;svg+=wire(around,'#4d5878','power')","const around=a.side==='left'?`M${a.x} ${a.y}H12V${z.boardY+50}H${z.boardX+14}`:`M${a.x} ${a.y}H220V${z.boardY+50}H${z.boardX+14}`;svg+=wire(around,'#4d5878','power');svg+=wire(`M${z.boardX+24} ${z.boardY+50}V${z.boardY+z.boardH-50}`,'#4d5878','power')",'ground rails bridge');
  swap("if(e.target.closest('.component-item,[data-preset],[data-remove],#resetDevice,.wiring-hub-tab[data-wiring-mode=\"breadboard\"],#wiringCoachStart,#wiringCoachNext,#wiringCoachPrev'))schedule(110)","if(e.target.closest('.component-item,[data-preset],[data-remove],#resetDevice,.wiring-hub-tab[data-wiring-mode=\"breadboard\"]'))schedule(110)",'guide rerender loop');
  Function(src)();
 }catch(err){console.error('[Device Wiring V11]',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
