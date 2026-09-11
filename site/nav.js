(()=>{
  if(window.__vallianAppleShellV9)return;
  window.__vallianAppleShellV9=true;
  document.documentElement.classList.add('js-nav-enhanced');

  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const studioPaths=new Set(['/projects','/editor','/lyrics','/image','/video','/code']);
  let lastY=scrollY,ticking=false,direction=1;

  const normalize=value=>{
    let p=String(value||'/').split('?')[0].split('#')[0];
    p=p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
    return p||'/';
  };
  const current=()=>normalize(location.pathname);

  function addStyle(href,dataKey){
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset[dataKey]='1';document.head.append(link);
  }

  function ensureStyle(){
    document.querySelectorAll([
      'link[data-sunday-ui]','link[data-glass-ui]','link[data-apple-motion]','link[data-native-ui]',
      'link[href*="sunday.css"]','link[href*="gameboy.css"]','link[href*="theme-yellow.css"]',
      'link[href*="motion-detail.css"]','link[href*="motion.css"]'
    ].join(',')).forEach(el=>el.remove());
    addStyle('/glass.css?v=5','glassUi');
    addStyle('/apple-motion.css?v=2','appleMotion');
    addStyle('/native-mobile.css?v=1','nativeUi');
    let theme=document.querySelector('meta[name="theme-color"]');
    if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.append(theme)}
    theme.content='#f5f5f7';
  }

  const tools=[
    ['/editor','Editor','✦','Scene mixer'],
    ['/projects','Projects','▦','Saved work'],
    ['/lyrics','Lyrics','Aa','Text animation'],
    ['/image','Image','▧','1-bit converter'],
    ['/video','Video','▶','Frame converter'],
    ['/code','Compiler','⌘','Sketch to BIN']
  ];

  function desktopNav(){
    let nav=document.querySelector('.main-menu');
    if(!nav){const shell=document.querySelector('.shell');if(!shell)return;nav=document.createElement('nav');nav.className='main-menu';shell.querySelector('.site-header,.page-nav')?.after(nav)}
    const path=current();nav.className='main-menu motion-nav';nav.innerHTML='';nav.setAttribute('aria-label','Navigasi utama');
    const pill=document.createElement('span');pill.className='nav-active-pill';nav.append(pill);
    const add=(label,href)=>{const a=document.createElement('a');a.href=href;a.className='nav-item'+(path===href?' active':'');a.textContent=label;nav.append(a);return a};
    const home=add('Home','/');
    const cluster=document.createElement('div');cluster.className='nav-cluster';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='nav-trigger'+(studioPaths.has(path)?' active':'');trigger.innerHTML='<span>Studio</span><span class="nav-caret">⌄</span>';trigger.setAttribute('aria-expanded','false');
    const panel=document.createElement('div');panel.className='studio-nav-panel';const grid=document.createElement('div');grid.className='studio-nav-grid';
    tools.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span class="studio-nav-copy"><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    panel.append(grid);cluster.append(trigger,panel);nav.append(cluster);
    const builds=add('Builds','/builds');
    const ota=document.createElement('a');ota.className='nav-ota';ota.href='http://192.168.4.1';ota.textContent='OTA';nav.append(ota);
    const setOpen=v=>{cluster.classList.toggle('open',v);trigger.setAttribute('aria-expanded',String(v))};trigger.onclick=e=>{e.stopPropagation();setOpen(!cluster.classList.contains('open'))};
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){let timer;cluster.onmouseenter=()=>{clearTimeout(timer);setOpen(true)};cluster.onmouseleave=()=>{timer=setTimeout(()=>setOpen(false),120)}}
    const active=studioPaths.has(path)?trigger:({'/':home,'/builds':builds}[path]);
    const move=(target,animate=true)=>{if(!target){pill.style.opacity='0';return}const nr=nav.getBoundingClientRect(),r=target.getBoundingClientRect();if(!animate)pill.style.transition='none';pill.style.opacity='1';pill.style.width=r.width+'px';pill.style.transform=`translateX(${r.left-nr.left}px)`;if(!animate)requestAnimationFrame(()=>pill.style.transition='')};
    requestAnimationFrame(()=>move(active,false));[...nav.children].filter(x=>x.matches('.nav-item,.nav-cluster')).forEach(x=>{const t=x.classList.contains('nav-cluster')?trigger:x;x.addEventListener('mouseenter',()=>move(t))});nav.addEventListener('mouseleave',()=>move(active));
  }

  function mobileNav(){
    document.querySelectorAll('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop').forEach(x=>x.remove());
    const path=current(),bar=document.createElement('nav');bar.className='mobile-tabbar motion-mobile-nav simple-mobile-nav';bar.setAttribute('aria-label','Navigasi utama mobile');
    const add=(label,href,icon)=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<i>${icon}</i><span>${label}</span>`;bar.append(a);return a};
    add('Home','/','⌂');
    const studio=document.createElement('button');studio.type='button';studio.className='create-tab'+(studioPaths.has(path)?' active':'');studio.innerHTML='<i>＋</i><span>Studio</span>';studio.setAttribute('aria-expanded','false');bar.append(studio);
    add('Builds','/builds','↻');
    const ota=document.createElement('a');ota.href='http://192.168.4.1';ota.innerHTML='<i>↗</i><span>OTA</span>';bar.append(ota);document.body.append(bar);
    const backdrop=document.createElement('div');backdrop.className='mobile-studio-backdrop';const sheet=document.createElement('div');sheet.className='mobile-studio-sheet';sheet.innerHTML='<div class="mobile-sheet-head"><strong>Studio</strong><span>TOOLS</span></div><div class="mobile-studio-grid"></div>';const grid=sheet.querySelector('.mobile-studio-grid');
    tools.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});document.body.append(backdrop,sheet);
    const set=v=>{backdrop.classList.toggle('open',v);sheet.classList.toggle('open',v);studio.setAttribute('aria-expanded',String(v));document.body.classList.toggle('studio-open',v)};studio.onclick=()=>set(!sheet.classList.contains('open'));backdrop.onclick=()=>set(false);
  }

  let io;
  function observer(){if(io)return io;io=new IntersectionObserver(entries=>entries.forEach(entry=>{const el=entry.target;el.style.setProperty('--motion-dir',String(direction));el.classList.toggle('is-in',entry.isIntersecting)}),{threshold:.07,rootMargin:'-2% 0px -4% 0px'});return io}
  function splitHeading(el){if(!el||el.dataset.appleSplit)return;el.dataset.appleSplit='1';const text=el.innerHTML.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').trim();if(!text)return;el.setAttribute('aria-label',text.replace(/\s+/g,' '));el.innerHTML='';el.classList.add('apple-heading');text.split(/\n+/).forEach((line,i)=>{const mask=document.createElement('span');mask.className='apple-mask';const inner=document.createElement('span');inner.className='apple-line';inner.style.setProperty('--line',i);inner.textContent=line;mask.append(inner);el.append(mask)});observer().observe(el)}
  function mark(root=document){
    const q=s=>root.querySelectorAll?.(s)||[];
    q('h1,h2').forEach(splitHeading);
    q('.home-hero,.home-hero-v2,.hero-live-card,.feature,.tool-card,.latest-card,.device-card,.card,.studio,.build-card,.empty,.lyric-editor,.code-card,.scene-panel,.preview-card,.latest-build,.projects-grid>*,.build-list>*').forEach((el,i)=>{if(el.dataset.appleMotion)return;el.dataset.appleMotion='surface';el.style.setProperty('--delay',Math.min(i%6,5)*42+'ms');observer().observe(el)});
    q('h3,h4,p,.brand small,.brand strong,.feature-link,.eyebrow,.hero-tag,.tool-label,.page-badge,.muted,.description,.hint,.note,footer span,label').forEach((el,i)=>{if(el.dataset.appleMotion)return;el.dataset.appleMotion='copy';el.style.setProperty('--delay',70+Math.min(i%7,6)*34+'ms');observer().observe(el)});
    q('.button,.tool-arrow,.settings-grid>*,.control-row>*,.code-grid>*,.studio-actions>*,.hero-actions>*,.editor-hints>*,.scene-row,.build-actions>*').forEach((el,i)=>{if(el.dataset.appleMotion)return;el.dataset.appleMotion='control';el.style.setProperty('--delay',Math.min(i%7,6)*28+'ms');observer().observe(el)});
    q('.section-title,.section-heading,.dashboard-heading,.editor-title,.preview-head,.page-intro,.page-head').forEach(el=>{if(el.querySelector(':scope > .apple-rule'))return;const rule=document.createElement('span');rule.className='apple-rule';el.append(rule);observer().observe(rule)})
  }
  function ambient(){if(innerWidth<=760||document.querySelector('.apple-orbit'))return;const x=document.createElement('div');x.className='apple-orbit';x.setAttribute('aria-hidden','true');x.innerHTML='<i></i><i></i><span></span>';document.body.append(x)}
  function connection(){const b=document.querySelector('#connectionBadge');if(!b)return;const on=navigator.onLine;b.textContent=on?'ONLINE':'OFFLINE';b.classList.toggle('online',on);b.classList.toggle('offline',!on)}
  function navigation(){document.addEventListener('click',e=>{const open=document.querySelector('.nav-cluster.open');if(open&&!e.target.closest('.nav-cluster'))open.classList.remove('open');const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.href===location.href||reduce.matches)return;e.preventDefault();document.body.classList.add('route-leaving');setTimeout(()=>location.href=u.href,95)});addEventListener('pageshow',()=>{document.body.classList.remove('route-leaving');document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),700)})}
  function scrollState(){const y=Math.max(0,scrollY),d=y-lastY;if(Math.abs(d)>4){direction=d>0?1:-1;document.body.style.setProperty('--motion-dir',String(direction));document.body.classList.toggle('scroll-down',d>0&&y>100&&!document.body.classList.contains('studio-open'));lastY=y}const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,y/max));document.body.style.setProperty('--scroll-p',p.toFixed(4));document.body.classList.toggle('motion-scrolled',y>24)}
  function init(){ensureStyle();desktopNav();mobileNav();ambient();mark();connection();navigation();scrollState();document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),700)}
  addEventListener('online',connection);addEventListener('offline',connection);addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;scrollState()})},{passive:true});addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelector('.nav-cluster.open')?.classList.remove('open');document.querySelector('.mobile-studio-sheet.open')?.classList.remove('open');document.querySelector('.mobile-studio-backdrop.open')?.classList.remove('open');document.body.classList.remove('studio-open')});new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes)if(node.nodeType===1&&!node.matches?.('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop,.apple-orbit'))mark(node)}).observe(document.body,{childList:true,subtree:true});init();
})();
