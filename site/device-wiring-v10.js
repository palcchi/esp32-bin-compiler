(()=>{
'use strict';
if(window.__deviceWiringV10)return;window.__deviceWiringV10=true;
async function boot(){
 try{
  const res=await fetch('/device-wiring-v9.js?v=1',{cache:'no-store'});
  if(!res.ok)throw new Error('V9 source '+res.status);
  let src=await res.text();
  src=src.replace("if(window.__deviceWiringV9)return;window.__deviceWiringV9=true;","if(window.__deviceWiringV9Fixed)return;window.__deviceWiringV9Fixed=true;");
  src=src.replace("const op=selectedUid&&selectedUid!==w.uid?.12:1;","const op=(selectedUid&&selectedUid!==w.uid)?0.12:1;");
  Function(src)();
 }catch(err){console.error('[Device Wiring V10]',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
