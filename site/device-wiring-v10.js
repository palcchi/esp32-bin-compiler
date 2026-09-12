(()=>{
'use strict';
if(window.__deviceWiringV12)return;window.__deviceWiringV12=true;
async function boot(){
 try{
  const res=await fetch('/device-wiring-v9.js?v=1',{cache:'no-store'});
  if(!res.ok)throw new Error('V9 source '+res.status);
  let src=await res.text();
  const swap=(from,to,label)=>{if(!src.includes(from))console.warn('[Wiring V12] patch miss:',label);else src=src.replace(from,to)};
  swap("if(window.__deviceWiringV9)return;window.__deviceWiringV9=true;","if(window.__deviceWiringV9Fixed)return;window.__deviceWiringV9Fixed=true;",'guard');
  swap("const op=selectedUid&&selectedUid!==w.uid?.12:1;","const op=(selectedUid&&selectedUid!==w.uid)?0.12:1;",'opacity typo');
  swap("const zoneH=590,boardX=242,espX=28,espW=140,espH=250,zoneScenes=[];","const zoneH=500,boardX=250,espX=52,espW=132,espH=238,zoneScenes=[];",'scene proportions');
  swap("let globalW=940;","let globalW=820;",'scene width');
  swap("let roughCols=42;","let roughCols=30;",'compact board cols');
  swap("roughCols=Math.max(42,Math.min(76,roughCols));","roughCols=Math.max(30,Math.min(62,roughCols));",'board col bounds');
  swap("pinStart=boardX+(col+1)*hole","pinStart=boardX+19+col*hole",'physical hole x');
  swap("let cursor={top:2,bottom:2},turn=0;auto.forEach(c=>{const row=turn++%2?'bottom':'top';place(c,row,cursor[row]);cursor[row]+=spanFor(c,hole)+2});","auto.forEach((c,i)=>{const row=i%2?'bottom':'top',span=spanFor(c,hole),usable=Math.max(12,roughCols-6),phase=(i+1)/(auto.length+1),desired=Math.max(2,Math.round(3+phase*usable-span/2));place(c,row,desired)});",'balanced auto placement');
  swap("const maxEnd=Math.max(38,...occ.top.concat(occ.bottom).map(r=>r.b+2)),boardW=maxEnd*hole+32,boardY=z*zoneH+110,boardH=410,topPinY=boardY+120,bottomPinY=boardY+290,espY=boardY+76;","const maxEnd=Math.max(30,...occ.top.concat(occ.bottom).map(r=>r.b+2)),boardW=maxEnd*hole+32,boardY=z*zoneH+76,boardH=350,topPinY=boardY+112,bottomPinY=boardY+238,espY=boardY+55;",'compact physical board');
  swap("col=Math.max(1,Math.round((firstPin-z.boardX)/lastScene.hole)-1)","col=Math.max(0,Math.round((firstPin-(z.boardX+19))/lastScene.hole))",'drag snap grid');
  swap("const laneY=p.row==='top'?z.boardY+65+n*6:z.boardY+z.boardH-65-n*6,src=espAnchor(String(w.pin),z.espX,z.espY,z.espW,z.espH),gutter=src.side==='right'?188+n*3:12-n*3;","const laneY=p.row==='top'?z.boardY+68+n*8:z.boardY+z.boardH-68-n*8,src=espAnchor(String(w.pin),z.espX,z.espY,z.espW,z.espH),gutter=src.side==='right'?196+n*8:18+Math.min(n,3)*8;",'parallel signal lanes');
  swap("const aroundY=src.y<z.espY+z.espH/2?z.espY-22:z.espY+z.espH+22;path=`M${src.x} ${src.y}H${gutter}V${aroundY}H${205+n*3}V${laneY}H${ep.x}V${ep.y}`","const aroundY=src.y<z.espY+z.espH/2?z.espY-26:z.espY+z.espH+26,entryX=214+n*8;path=`M${src.x} ${src.y}H${gutter}V${aroundY}H${entryX}V${laneY}H${ep.x}V${ep.y}`",'left signal detour');
  swap("w.kind==='ground'?(top?z.boardY+56:z.boardY+z.boardH-56):(w.source==='3V3'?(top?z.boardY+24:z.boardY+z.boardH-24):(top?z.boardY+40:z.boardY+z.boardH-40))","w.kind==='ground'?(top?z.boardY+50:z.boardY+z.boardH-50):(w.source==='3V3'?z.boardY+30:z.boardY+z.boardH-30)",'power rail targets');
  swap("if(needs.v33){const a=espAnchor('3V3',z.espX,z.espY,z.espW,z.espH);svg+=wire(`M${a.x} ${a.y}H205V${z.boardY+24}H${z.boardX+14}`,'#d96562','power')}","if(needs.v33){const a=espAnchor('3V3',z.espX,z.espY,z.espW,z.espH),px=a.side==='left'?24:202,ay=z.espY-26;svg+=wire(`M${a.x} ${a.y}H${px}V${ay}H224V${z.boardY+30}H${z.boardX+14}`,'#d96562','power')}",'3V3 detour');
  swap("if(needs.v5&&!needs.ext5){const a=espAnchor('5V',z.espX,z.espY,z.espW,z.espH);svg+=wire(`M${a.x} ${a.y}H212V${z.boardY+40}H${z.boardX+14}`,'#dc9440','power')}","if(needs.v5&&!needs.ext5){const a=espAnchor('5V',z.espX,z.espY,z.espW,z.espH),px=a.side==='left'?24:210,ay=z.espY+z.espH+26;svg+=wire(`M${a.x} ${a.y}H${px}V${ay}H230V${z.boardY+z.boardH-30}H${z.boardX+14}`,'#dc9440','power')}",'5V detour');
  swap("if(needs.ext5)svg+=`<rect x=\"178\" y=\"${z.boardY+28}\" width=\"45\" height=\"24\" rx=\"8\" fill=\"#fff\" stroke=\"#dc9440\"/><text x=\"200\" y=\"${z.boardY+43}\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"850\" fill=\"#9c682f\">EXT 5V</text>`+wire(`M223 ${z.boardY+40}H${z.boardX+14}`,'#dc9440','power');","if(needs.ext5)svg+=`<rect x=\"184\" y=\"${z.boardY+z.boardH-47}\" width=\"48\" height=\"24\" rx=\"8\" fill=\"#fff\" stroke=\"#dc9440\"/><text x=\"208\" y=\"${z.boardY+z.boardH-32}\" text-anchor=\"middle\" font-size=\"6\" font-weight=\"850\" fill=\"#9c682f\">EXT 5V</text>`+wire(`M232 ${z.boardY+z.boardH-36}H238V${z.boardY+z.boardH-30}H${z.boardX+14}`,'#dc9440','power');",'external 5V route');
  swap("const around=a.side==='left'?`M${a.x} ${a.y}H12V${z.boardY+56}H${z.boardX+14}`:`M${a.x} ${a.y}H219V${z.boardY+56}H${z.boardX+14}`;svg+=wire(around,'#4d5878','power')","const around=a.side==='left'?`M${a.x} ${a.y}H24V${z.boardY+50}H${z.boardX+14}`:`M${a.x} ${a.y}H216V${z.boardY+50}H${z.boardX+14}`;svg+=wire(around,'#4d5878','power');svg+=wire(`M${z.boardX+24} ${z.boardY+50}V${z.boardY+z.boardH-50}`,'#4d5878','power')",'ground rails bridge');
  swap("if(e.target.closest('.component-item,[data-preset],[data-remove],#resetDevice,.wiring-hub-tab[data-wiring-mode=\"breadboard\"],#wiringCoachStart,#wiringCoachNext,#wiringCoachPrev'))schedule(110)","if(e.target.closest('.component-item,[data-preset],[data-remove],#resetDevice,.wiring-hub-tab[data-wiring-mode=\"breadboard\"]'))schedule(110)",'guide rerender loop');
  Function(src)();
 }catch(err){console.error('[Device Wiring V12]',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
