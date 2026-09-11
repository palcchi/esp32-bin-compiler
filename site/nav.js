(()=>{
  if(window.__vallianSundayShell)return;
  window.__vallianSundayShell=true;

  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const studioPaths=new Set(['/projects','/editor','/lyrics','/image','/video']);
  let lastY=scrollY,tick=false;

  const normalize=value=>{
    let p=String(value||'/').split('?')[0].split('#')[0];
    p=p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
    return p||'/';
  };
  const current=()=>normalize(location.pathname);

  function ensureStyle(){
    document.querySelectorAll('link[data-glass-ui],link[data-motion-ui],link[data-motion-detail-ui],link[href*="glass.css"],link[href*="motion.css"],link[href*="motion-detail.css"],link[href*="gameboy.css"],link[href*="theme-yellow.css"]').forEach(el=>el.remove());
    if(!document.querySelector('link[data-sunday-ui]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='/sunday.css?v=1';l.dataset.sundayUi='1';document.head.append(l);
    }
    let theme=document.querySelector('meta[name="theme-color"]');
    if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.append(theme)}
    theme.content='#e7f1f7';
  }

  const tools=[
    ['/editor','Editor','✦','Scene mixer'],
    ['/projects','Projects','▦','Saved work'],
    ['/lyrics','Lyrics','Aa','Text motion'],
    ['/image','Image','▧','1-bit convert'],
    ['/video','Video','▶','Frame convert']
  ];

  function desktopNav(){
    let nav=document.querySelector('.main-menu');
    if(!nav){const shell=document.querySelector('.shell');if(!shell)return;nav=document.createElement('nav');nav.className='main-menu';shell.querySelector('.site-header,.page-nav')?.after(nav)}
    const path=current();nav.className='main-menu motion-nav';nav.innerHTML='';nav.setAttribute('aria-label','Navigasi utama');
    const add=(label,href)=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(path===href)a.className='active';nav.append(a)};
    add('Home','/');
    const cluster=document.createElement('div');cluster.className='nav-cluster';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='nav-trigger'+(studioPaths.has(path)?' active':'');trigger.innerHTML='Studio <span aria-hidden="true">⌄</span>';trigger.setAttribute('aria-expanded','false');
    const panel=document.createElement('div');panel.className='studio-nav-panel';const grid=document.createElement('div');grid.className='studio-nav-grid';
    tools.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span class="studio-nav-copy"><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    panel.append(grid);cluster.append(trigger,panel);nav.append(cluster);add('Compiler','/code');add('Builds','/builds');
    const ota=document.createElement('a');ota.className='nav-ota';ota.href='http://192.168.4.1';ota.textContent='OTA';nav.append(ota);
    const setOpen=v=>{cluster.classList.toggle('open',v);trigger.setAttribute('aria-expanded',String(v))};trigger.onclick=e=>{e.stopPropagation();setOpen(!cluster.classList.contains('open'))};
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){let timer;cluster.onmouseenter=()=>{clearTimeout(timer);setOpen(true)};cluster.onmouseleave=()=>{timer=setTimeout(()=>setOpen(false),120)}}
  }

  function mobileNav(){
    document.querySelectorAll('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop').forEach(x=>x.remove());
    const path=current(),bar=document.createElement('nav');bar.className='mobile-tabbar motion-mobile-nav';bar.setAttribute('aria-label','Navigasi utama mobile');
    const add=(label,href,icon)=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<i>${icon}</i><span>${label}</span>`;bar.append(a)};
    add('Home','/','⌂');const studio=document.createElement('button');studio.type='button';studio.className=studioPaths.has(path)?'active':'';studio.innerHTML='<i>＋</i><span>Studio</span>';studio.setAttribute('aria-expanded','false');bar.append(studio);add('Code','/code','⌘');add('Builds','/builds','↻');
    const ota=document.createElement('a');ota.href='http://192.168.4.1';ota.innerHTML='<i>↗</i><span>OTA</span>';bar.append(ota);document.body.append(bar);
    const backdrop=document.createElement('div');backdrop.className='mobile-studio-backdrop';const sheet=document.createElement('div');sheet.className='mobile-studio-sheet';sheet.innerHTML='<div class="mobile-sheet-head"><strong>Studio</strong><span>CORE TOOLS</span></div><div class="mobile-studio-grid"></div>';const grid=sheet.querySelector('.mobile-studio-grid');
    tools.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});document.body.append(backdrop,sheet);
    const set=v=>{backdrop.classList.toggle('open',v);sheet.classList.toggle('open',v);studio.setAttribute('aria-expanded',String(v));document.body.classList.toggle('studio-open',v)};studio.onclick=()=>set(!sheet.classList.contains('open'));backdrop.onclick=()=>set(false);
  }

  let io;
  function observer(){if(io)return io;io=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-in',entry.isIntersecting)),{threshold:.08,rootMargin:'-2% 0px -4% 0px'});return io}

  function maskHeading(el){
    if(!el||el.dataset.sundaySplit)return;el.dataset.sundaySplit='1';const raw=el.innerHTML.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').trim();if(!raw)return;el.setAttribute('aria-label',raw.replace(/\s+/g,' '));el.innerHTML='';el.classList.add('sunday-heading');raw.split(/\n+/).forEach((line,i)=>{const mask=document.createElement('span');mask.className='sunday-mask';const inner=document.createElement('span');inner.className='sunday-line';inner.style.setProperty('--line',i);inner.textContent=line;mask.append(inner);el.append(mask)});observer().observe(el);
  }

  function mark(root=document){
    const all=s=>root.querySelectorAll?.(s)||[];
    all('.home-hero h1,.page-intro h1,.page-head h1,.section-title h2,.section-heading h2,.editor-title h2,.preview-head h2').forEach(maskHeading);
    all('.home-hero,.feature,.card,.studio,.build-card,.empty,.lyric-editor,.code-card,.scene-panel,.preview-card,.latest-build,.projects-grid>*,.build-list>*').forEach((el,i)=>{if(el.dataset.sunday)return;el.dataset.sunday=i%2?'right':'left';el.style.setProperty('--d',Math.min(i%6,5)*45+'ms');observer().observe(el)});
    all('.home-hero p,.page-intro p,.page-head p,.section-title p,.section-heading p,.feature h3,.feature p,.feature-link,.card h2,.card h3,.card p,.studio h2,.studio h3,.studio p,.build-card h3,.build-card p,footer,.eyebrow,.hero-tag,.muted,.description,.hint,.note').forEach((el,i)=>{if(el.classList.contains('sunday-copy'))return;el.classList.add('sunday-copy');el.style.setProperty('--d',70+Math.min(i%7,6)*40+'ms');observer().observe(el)});
    all('.section-title,.section-heading,.editor-title,.preview-head').forEach(el=>{if(el.querySelector(':scope > .sunday-rule'))return;const r=document.createElement('span');r.className='sunday-rule';el.append(r);observer().observe(r)});
  }

  function ticker(){if(current()!=='/'||document.querySelector('.sunday-ticker'))return;const hero=document.querySelector('.home-hero');if(!hero)return;const t=document.createElement('div');t.className='sunday-ticker';t.innerHTML='<div class="sunday-ticker-track"><span>ESP32</span><i></i><span>OLED 128×64</span><i></i><span>BUILD BIN</span><i></i><span>OTA READY</span><i></i><span>TEXT MOTION</span><i></i><span>IMAGE TO 1-BIT</span><i></i><span>ESP32</span><i></i><span>OLED 128×64</span><i></i><span>BUILD BIN</span><i></i><span>OTA READY</span><i></i><span>TEXT MOTION</span><i></i><span>IMAGE TO 1-BIT</span><i></i></div>';hero.after(t)}
  function connection(){const b=document.querySelector('#connectionBadge');if(!b)return;const on=navigator.onLine;b.textContent=on?'ONLINE':'OFFLINE';b.classList.toggle('online',on);b.classList.toggle('offline',!on)}
  function navigation(){document.addEventListener('click',e=>{const open=document.querySelector('.nav-cluster.open');if(open&&!e.target.closest('.nav-cluster'))open.classList.remove('open');const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.href===location.href||reduce.matches)return;e.preventDefault();document.body.classList.add('route-leaving');setTimeout(()=>location.href=u.href,90)});addEventListener('pageshow',()=>{document.body.classList.remove('route-leaving');document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),760)})}
  function scrollState(){const y=Math.max(0,scrollY),d=y-lastY;if(Math.abs(d)>4){document.body.classList.toggle('scroll-down',d>0&&y>110&&!document.body.classList.contains('studio-open'));lastY=y}const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,y/max));document.body.style.setProperty('--scroll-p',p.toFixed(4))}
  function init(){ensureStyle();desktopNav();mobileNav();ticker();mark();connection();navigation();scrollState();document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),760)}
  addEventListener('online',connection);addEventListener('offline',connection);addEventListener('scroll',()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;scrollState()})},{passive:true});addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelector('.nav-cluster.open')?.classList.remove('open');document.querySelector('.mobile-studio-sheet.open')?.classList.remove('open');document.querySelector('.mobile-studio-backdrop.open')?.classList.remove('open');document.body.classList.remove('studio-open')});
  new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes)if(node.nodeType===1&&!node.matches?.('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop,.sunday-ticker'))mark(node)}).observe(document.body,{childList:true,subtree:true});
  init();
})();
