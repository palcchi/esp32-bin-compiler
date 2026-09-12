const REPO='palcchi/esp32-bin-compiler';
const PATH='custom_build/request.json';
function send(res,status,data){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
function otaConfig(body){const raw=body?.ota||{};let ssid=String(raw.ssid||'VALLIAN-ESP32').trim().slice(0,32);let password=String(raw.password??'12345678').slice(0,63);if(!ssid)ssid='VALLIAN-ESP32';if(password&&password.length<8)password='12345678';return{ssid,password};}
export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  const token=process.env.GITHUB_BUILD_TOKEN;
  if(!token)return send(res,503,{error:'Build service belum aktif','code':'TOKEN_MISSING'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const code=String(body?.code||'');
    if(!code.trim())return send(res,400,{error:'Code kosong'});
    if(code.length>180000)return send(res,400,{error:'Code terlalu besar untuk build web'});
    const name=String(body?.name||'Custom ESP32 Firmware').slice(0,60);
    const preserveOta=body?.preserveOta!==false;
    const ota=otaConfig(body);
    const libraries=(Array.isArray(body?.libraries)?body.libraries:[]).map(x=>String(x).trim()).filter(Boolean).slice(0,12);
    const payload=JSON.stringify({name,code,preserveOta,ota,libraries,createdAt:new Date().toISOString()},null,2)+'\n';
    const headers={'Authorization':`Bearer ${token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'vallian-oled-studio'};
    const cur=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=main`,{headers});
    let sha=null;if(cur.ok)sha=(await cur.json()).sha;else if(cur.status!==404)throw new Error(`GitHub read failed (${cur.status})`);
    const update=await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:`code: web build ${new Date().toISOString()}`,content:Buffer.from(payload).toString('base64'),...(sha?{sha}:{}),branch:'main'})});
    const data=await update.json();if(!update.ok)throw new Error(data?.message||`GitHub update failed (${update.status})`);
    return send(res,202,{ok:true,commit:data.commit.sha,short:data.commit.sha.slice(0,7),message:'Custom build queued',ota:preserveOta?{ssid:ota.ssid}:null});
  }catch(err){console.error(err);return send(res,500,{error:'Gagal memulai custom build',detail:String(err.message||err)});}
}
