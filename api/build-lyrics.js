const REPO='palcchi/esp32-bin-compiler';
const PATH='firmware/lyrics.json';
const ALLOWED=['none','slide','slidewords','words','popwords'];
function send(res,status,data){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
function estimateFrames(scene){const text=String(scene?.text??'').trim(),words=text?text.split(/\s+/).length:0,a=ALLOWED.includes(scene?.animation)?scene.animation:'none';if(!words||a==='none')return 1;if(a==='slide')return 5;if(a==='words')return Math.min(words+1,25);return Math.min(words*2+1,35)}
export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
  const token=process.env.GITHUB_BUILD_TOKEN;
  if(!token) return send(res,503,{error:'Build service belum diaktifkan','code':'TOKEN_MISSING'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const name=String(body?.name||'OLED Lyrics Build').trim().slice(0,60)||'OLED Lyrics Build';
    const style=['brat','clean','tiny'].includes(body?.style)?body.style:'brat';
    const size=Math.max(1,Math.min(3,Number(body?.size)||2));
    const incoming=Array.isArray(body?.scenes)?body.scenes:[];
    if(!incoming.length) return send(res,400,{error:'Scene kosong'});
    if(incoming.length>120) return send(res,400,{error:'Maksimal 120 scene per build'});
    const scenes=incoming.map((s,i)=>({text:String(s?.text??'').slice(0,220),duration:Math.max(50,Math.min(120000,Math.round(Number(s?.duration)||1500))),invert:!!s?.invert,animation:ALLOWED.includes(s?.animation)?s.animation:'none',order:i}));
    const estimated=scenes.reduce((n,s)=>n+estimateFrames(s),0);
    if(estimated>240) return send(res,400,{error:`Animasi ini diperkirakan menghasilkan ${estimated} frame. Maksimal 240 frame agar firmware OTA tetap aman. Kurangi scene atau gunakan Static pada sebagian scene.`});
    const payload=JSON.stringify({name,style,size,createdAt:new Date().toISOString(),estimatedFrames:estimated,scenes},null,2)+'\n';
    const headers={'Authorization':`Bearer ${token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'vallian-oled-studio'};
    const current=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=main`,{headers});
    if(!current.ok) throw new Error(`GitHub read failed (${current.status})`);
    const currentData=await current.json();
    const update=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:`lyrics: ${name}`,content:Buffer.from(payload).toString('base64'),sha:currentData.sha,branch:'main'})});
    const data=await update.json();
    if(!update.ok) throw new Error(data?.message||`GitHub update failed (${update.status})`);
    return send(res,202,{ok:true,commit:data.commit.sha,short:data.commit.sha.slice(0,7),name,estimatedFrames:estimated,message:'Build queued'});
  }catch(err){console.error(err);return send(res,500,{error:'Gagal memulai build',detail:String(err.message||err)});}
}
