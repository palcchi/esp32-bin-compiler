(()=>{
  const latestName=document.querySelector('#latestBuildName');
  const latestMeta=document.querySelector('#latestBuildMeta');
  const latestStatus=document.querySelector('#latestBuildStatus');
  if(latestName&&latestMeta&&latestStatus){
    fetch(`/builds.json?t=${Date.now()}`,{cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(items=>{
        const ready=items.find(x=>x.status==='ready')||items[0];
        if(!ready)return;
        latestName.textContent=ready.name||'Firmware build';
        const kb=ready.size?`${Math.round(ready.size/1024)} KB`:'Ready';
        latestMeta.textContent=`${ready.source||'ESP32'} · ${kb}`;
        latestStatus.textContent=ready.status==='ready'?'READY':'BUILD';
      })
      .catch(()=>{
        latestName.textContent='Build history';
        latestMeta.textContent='Open recent firmware';
        latestStatus.textContent='OPEN';
      });
  }

  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.tool-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }
})();
