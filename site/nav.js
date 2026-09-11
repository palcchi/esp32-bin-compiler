(()=>{
  if(window.__vallianMotionShell)return;
  window.__vallianMotionShell=true;

  const ROUTES=new Set(['/','/projects','/editor','/lyrics','/image','/draw','/video','/code','/builds','/devices','/presets']);
  const STUDIO=new Set(['/projects','/editor','/lyrics','/image','/draw','/video','/presets']);
  const PAGE_CACHE=new Map();
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let routeSequence=0;
  let activeAbort=null;
  let routing=false;
  let renderedKey=location.pathname+location.search;
  let scrollDirection=1;
  let lastScrollY=scrollY;

  const normalize=value=>{
    let path=String(value||'/').split('?')[0].split('#')[0];
    path=path.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
    return path||'/';
  };
  const routeKey=url=>{const u=new URL(url,location.href);return u.pathname+u.search};
  const activePath=()=>normalize(location.pathname);
  const routeLabel=path=>({
    '/':'Home','/projects':'Projects','/editor':'OLED Editor','/lyrics':'Lyrics Studio','/image':'Image Converter','/draw':'Pixel Draw','/video':'Video Converter','/code':'Code Compiler','/builds':'Build History','/devices':'Devices','/presets':'Presets'
  })[normalize(path)]||'OLED Studio';

  const studioLinks=[
    ['/editor','Editor','✦','Scene mixer'],
    ['/projects','Projects','▦','Save slots'],
    ['/lyrics','Lyrics','Aa','Text animation'],
    ['/image','Image','▧','1-bit converter'],
    ['/draw','Draw','✎','Pixel canvas'],
    ['/video','Video','▶','Frame converter'],
    ['/presets','Presets','◌','Style packs']
  ];

  function ensureStyles(){
    if(!document.querySelector('link[data-glass-ui]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/glass.css?v=2';link.dataset.glassUi='1';document.head.append(link);
    }
    if(!document.querySelector('link[data-motion-ui]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='/motion.css?v=2';link.dataset.motionUi='1';document.head.append(link);
    }
    document.querySelectorAll('link[href*="gameboy.css"],link[href*="theme-yellow.css"]').forEach(el=>el.remove());
    let theme=document.querySelector('meta[name="theme-color"]');
    if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.append(theme)}
    theme.content='#f4f4f6';
  }

  function buildDesktopNav(){
    let menu=document.querySelector('.main-menu');
    if(!menu){
      const shell=document.querySelector('.shell');if(!shell)return;
      menu=document.createElement('nav');menu.className='main-menu';shell.querySelector('.site-header,.page-nav')?.after(menu);
    }
    const current=activePath();
    menu.className='main-menu motion-nav';menu.dataset.adaptiveNav='1';menu.setAttribute('aria-label','Navigasi utama');menu.innerHTML='';
    const pill=document.createElement('span');pill.className='nav-active-pill';menu.append(pill);
    const makeLink=(label,href)=>{const a=document.createElement('a');a.className='nav-item'+(current===href?' active':'');a.href=href;a.textContent=label;return a};
    menu.append(makeLink('Home','/'));

    const cluster=document.createElement('div');cluster.className='nav-cluster';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='nav-trigger'+(STUDIO.has(current)?' active':'');trigger.setAttribute('aria-expanded','false');trigger.innerHTML='<span>Studio</span><span class="nav-caret">⌄</span>';
    const panel=document.createElement('div');panel.className='studio-nav-panel';panel.innerHTML='<div class="studio-nav-grid"></div>';
    const grid=panel.firstElementChild;
    studioLinks.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(current===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span class="studio-nav-copy"><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    cluster.append(trigger,panel);menu.append(cluster);
    menu.append(makeLink('Compiler','/code'),makeLink('Builds','/builds'),makeLink('Devices','/devices'));
    const ota=document.createElement('a');ota.className='nav-ota';ota.href='http://192.168.4.1';ota.textContent='OTA';menu.append(ota);

    const setOpen=open=>{cluster.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open))};
    trigger.onclick=e=>{e.stopPropagation();setOpen(!cluster.classList.contains('open'))};
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){let timer;cluster.onmouseenter=()=>{clearTimeout(timer);setOpen(true)};cluster.onmouseleave=()=>{timer=setTimeout(()=>setOpen(false),130)}}

    const currentControl=STUDIO.has(current)?trigger:menu.querySelector(`.nav-item[href="${current}"]`);
    const movePill=(target,animate=true)=>{
      if(!target){pill.style.opacity='0';return}
      const mr=menu.getBoundingClientRect(),r=target.getBoundingClientRect();
      if(!animate)pill.style.transition='none';pill.style.opacity='1';pill.style.width=r.width+'px';pill.style.transform=`translateX(${r.left-mr.left}px)`;
      if(!animate)requestAnimationFrame(()=>pill.style.transition='');
    };
    requestAnimationFrame(()=>movePill(currentControl,false));
    [...menu.children].filter(el=>el.matches('.nav-item,.nav-cluster')).forEach(el=>{const target=el.classList.contains('nav-cluster')?trigger:el;el.addEventListener('mouseenter',()=>movePill(target))});
    menu.addEventListener('mouseleave',()=>movePill(currentControl));
    if('ResizeObserver'in window)new ResizeObserver(()=>movePill(currentControl,false)).observe(menu);
  }

  function buildMobileNav(){
    document.querySelectorAll('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop').forEach(el=>el.remove());
    const current=activePath(),bar=document.createElement('nav');bar.className='mobile-tabbar motion-mobile-nav';bar.setAttribute('aria-label','Navigasi utama mobile');
    const addTab=(label,href,icon)=>{const a=document.createElement('a');a.href=href;if(current===href)a.className='active';a.innerHTML=`<i aria-hidden="true">${icon}</i><span>${label}</span>`;bar.append(a)};
    addTab('Home','/','⌂');
    const studio=document.createElement('button');studio.type='button';studio.className='create-tab'+(STUDIO.has(current)?' active':'');studio.innerHTML='<i aria-hidden="true">＋</i><span>Studio</span>';studio.setAttribute('aria-expanded','false');bar.append(studio);
    addTab('Code','/code','⌘');addTab('Builds','/builds','↻');addTab('Device','/devices','◫');document.body.append(bar);

    const backdrop=document.createElement('div');backdrop.className='mobile-studio-backdrop';
    const sheet=document.createElement('div');sheet.className='mobile-studio-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','Studio tools');sheet.innerHTML='<div class="mobile-sheet-head"><strong>Studio</strong><span>CREATE & CONVERT</span></div><div class="mobile-studio-grid"></div>';
    const grid=sheet.querySelector('.mobile-studio-grid');
    studioLinks.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(current===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    const ota=document.createElement('a');ota.href='http://192.168.4.1';ota.className='ota-mobile';ota.innerHTML='<span class="studio-nav-icon">↗</span><span><b>OTA</b><small>192.168.4.1</small></span>';grid.append(ota);document.body.append(backdrop,sheet);
    const setOpen=open=>{
      backdrop.classList.toggle('open',open);sheet.classList.toggle('open',open);studio.setAttribute('aria-expanded',String(open));document.body.classList.toggle('studio-open',open);
      if(open){document.body.classList.remove('scroll-down');document.body.classList.add('scroll-up')}
    };
    studio.onclick=()=>setOpen(!sheet.classList.contains('open'));backdrop.onclick=()=>setOpen(false);
  }

  function addAmbientUI(){
    if(!document.querySelector('.motion-glow')){const el=document.createElement('div');el.className='motion-glow';document.body.append(el)}
    if(!document.querySelector('.motion-ambient')){const el=document.createElement('div');el.className='motion-ambient';el.innerHTML='<i></i><i></i>';document.body.append(el)}
    if(!document.querySelector('.motion-progress')){const el=document.createElement('div');el.className='motion-progress';el.innerHTML='<i></i>';document.body.append(el)}
    if(!document.querySelector('.route-status')){const el=document.createElement('div');el.className='route-status';el.innerHTML='<span class="route-status-dot"></span><span class="route-status-copy"><small>VALLIAN LAB</small><b>Opening…</b></span>';document.body.append(el)}
  }

  let revealObserver;
  function observer(){
    if(revealObserver)return revealObserver;
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const el=entry.target;
      if(entry.isIntersecting){el.style.setProperty('--motion-dir',String(scrollDirection));requestAnimationFrame(()=>el.classList.add('is-in'))}
      else el.classList.remove('is-in');
    }),{threshold:.04,rootMargin:'-2% 0px -2% 0px'});
    return revealObserver;
  }

  function splitText(el){
    if(!el||el.dataset.motionSplit)return;el.dataset.motionSplit='1';
    const label=el.textContent.replace(/\s+/g,' ').trim();if(label)el.setAttribute('aria-label',label);
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    let index=0;nodes.forEach(node=>{const frag=document.createDocumentFragment();node.nodeValue.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.append(document.createTextNode(part));return}const wrap=document.createElement('span');wrap.className='motion-word-wrap';wrap.setAttribute('aria-hidden','true');const word=document.createElement('span');word.className='motion-word';word.style.setProperty('--i',index++);word.textContent=part;wrap.append(word);frag.append(wrap)});node.replaceWith(frag)});
    el.classList.add('motion-title');observer().observe(el);
  }

  function selectIncludingRoot(root,selector){const out=[];if(root.nodeType===1&&root.matches?.(selector))out.push(root);root.querySelectorAll?.(selector).forEach(el=>out.push(el));return out}
  function enhanceMotion(root=document){
    selectIncludingRoot(root,'.home-hero h1,.page-intro h1,.page-head h1,.section-title h2,.section-heading h2').forEach(splitText);
    selectIncludingRoot(root,'.feature,.build-card,.lyrics-workspace>.card,.lyrics-workspace>aside,.studio.card,.home-section>.card,.scene-panel,.preview-card').forEach((el,i)=>{if(el.hasAttribute('data-motion-reveal'))return;el.setAttribute('data-motion-reveal','');el.style.setProperty('--reveal-delay',Math.min(i%7,6)*32+'ms');observer().observe(el)});
    selectIncludingRoot(root,'.settings-grid>label,.control-row>label,.studio-actions>.button,.studio-actions>a,.editor-hints>span,.scene-row').forEach((el,i)=>{if(el.hasAttribute('data-motion-control'))return;el.setAttribute('data-motion-control','');el.style.setProperty('--control-delay',Math.min(i%8,7)*24+'ms');observer().observe(el)});
    if(!reduceMotion.matches&&matchMedia('(pointer:fine)').matches)selectIncludingRoot(root,'.button').forEach(el=>{if(el.dataset.magnetic)return;el.dataset.magnetic='1';el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.translate=((e.clientX-r.left-r.width/2)*.065)+'px '+((e.clientY-r.top-r.height/2)*.09)+'px'});el.addEventListener('pointerleave',()=>el.style.translate='')});
  }

  function updateConnectionBadge(){
    const b=document.querySelector('#connectionBadge');if(!b)return;const online=navigator.onLine;b.textContent=online?'ONLINE':'OFFLINE';b.classList.toggle('online',online);b.classList.toggle('offline',!online);
  }

  function setupShell(){ensureStyles();buildDesktopNav();buildMobileNav();addAmbientUI();enhanceMotion();updateConnectionBadge();updateScrollState(true)}

  function showRouteStatus(label,delay=160){
    const status=document.querySelector('.route-status'),copy=status?.querySelector('.route-status-copy b');if(copy)copy.textContent=label;
    const timer=setTimeout(()=>status?.classList.add('show'),delay);return()=>{clearTimeout(timer);status?.classList.remove('show')};
  }

  async function fetchWithTimeout(url,options={},timeout=5000){
    const own=new AbortController(),timer=setTimeout(()=>own.abort(),timeout);
    if(activeAbort)activeAbort.abort();activeAbort=own;
    try{return await fetch(url,{...options,signal:own.signal})}finally{clearTimeout(timer);if(activeAbort===own)activeAbort=null}
  }

  const fetchPage=async href=>{
    const u=new URL(href,location.href),key=u.pathname+u.search;if(PAGE_CACHE.has(key))return PAGE_CACHE.get(key);
    const promise=fetchWithTimeout(key,{headers:{'X-Vallian-Navigation':'1'}},5000).then(r=>{if(!r.ok)throw new Error('Page '+r.status);return r.text()}).catch(e=>{PAGE_CACHE.delete(key);throw e});PAGE_CACHE.set(key,promise);return promise;
  };

  function preparePage(html,href){
    const pageURL=new URL(href,location.href),doc=new DOMParser().parseFromString(html,'text/html');
    const scripts=[...doc.body.querySelectorAll('script')].map(node=>({src:node.getAttribute('src'),code:node.getAttribute('src')?'':node.textContent||''}));doc.body.querySelectorAll('script').forEach(node=>node.remove());
    return{pageURL,doc,scripts};
  }

  function syncHead(doc,pageURL){
    document.querySelectorAll('[data-route-head]').forEach(el=>el.remove());
    [...doc.head.querySelectorAll('link[rel="stylesheet"]')].forEach(link=>{const href=new URL(link.getAttribute('href')||'',pageURL);if(['/styles.css','/glass.css','/motion.css','/gameboy.css','/theme-yellow.css'].includes(href.pathname))return;const copy=document.createElement('link');copy.rel='stylesheet';copy.href=href.href;copy.dataset.routeHead='1';document.head.append(copy)});
    [...doc.head.querySelectorAll('style')].forEach(style=>{const copy=document.createElement('style');copy.dataset.routeHead='1';copy.textContent=style.textContent;document.head.append(copy)});document.title=doc.title||'Vallian OLED Studio';
  }

  function runExternalScript(src,pageURL){
    return new Promise(resolve=>{
      const url=new URL(src,pageURL);if(url.pathname.endsWith('/nav.js'))return resolve();
      const s=document.createElement('script');s.src=url.href;s.async=false;s.dataset.routeScript='1';
      let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);ensureStyles();buildDesktopNav();buildMobileNav();enhanceMotion();resolve()};
      s.onload=finish;s.onerror=finish;const timer=setTimeout(finish,4500);document.body.append(s);
    });
  }

  async function runPageScripts(scripts,pageURL){
    document.querySelectorAll('script[data-route-script]').forEach(el=>el.remove());
    for(const script of scripts){
      if(script.src)await runExternalScript(script.src,pageURL);
      else if(script.code.trim()){try{new Function(script.code+'\n//# sourceURL=vallian-inline-route.js')()}catch(err){console.error('[Vallian inline route]',err)}}
    }
    ensureStyles();buildDesktopNav();buildMobileNav();enhanceMotion();updateConnectionBadge();
  }

  async function navigate(href,{history=true,force=false}={}){
    const target=new URL(href,location.href),path=normalize(target.pathname),key=routeKey(target.href);
    if(!ROUTES.has(path)){location.href=target.href;return}
    if(!force&&key===renderedKey)return;

    const token=++routeSequence;routing=true;document.body.classList.add('route-switching');
    addAmbientUI();const stopStatus=showRouteStatus('Opening '+routeLabel(path),190);const progress=document.querySelector('.motion-progress>i');if(progress)progress.style.transform='scaleX(.22)';

    let html;
    try{html=await fetchPage(target.href)}catch(err){stopStatus();routing=false;document.body.classList.remove('route-switching');location.href=target.href;return}
    if(token!==routeSequence)return;
    if(progress)progress.style.transform='scaleX(.62)';

    const prepared=preparePage(html,target.href);
    if(history)history.pushState({vallian:true},'',target.href);
    syncHead(prepared.doc,prepared.pageURL);
    document.body.className=(prepared.doc.body.className||'')+' route-ready';
    document.body.innerHTML=prepared.doc.body.innerHTML;
    renderedKey=key;
    ensureStyles();addAmbientUI();buildDesktopNav();buildMobileNav();enhanceMotion();updateConnectionBadge();scrollTo(0,0);

    const postStop=showRouteStatus('Loading '+routeLabel(path),260);
    if(document.querySelector('.motion-progress>i'))document.querySelector('.motion-progress>i').style.transform='scaleX(.82)';
    await runPageScripts(prepared.scripts,prepared.pageURL);
    if(token!==routeSequence)return;
    postStop();stopStatus();routing=false;document.body.classList.remove('route-switching');document.body.classList.add('route-ready');
    const p=document.querySelector('.motion-progress>i');if(p){p.style.transform='scaleX(1)';setTimeout(()=>{const q=document.querySelector('.motion-progress>i');if(q&&!routing)q.style.transform='scaleX(0)'},280)}
    setTimeout(()=>document.body.classList.remove('route-ready'),720);
  }

  function warmRoute(href){const u=new URL(href,location.href);if(u.origin!==location.origin||!ROUTES.has(normalize(u.pathname)))return;fetchPage(u.href).catch(()=>{})}

  document.addEventListener('click',e=>{
    const open=document.querySelector('.nav-cluster.open');if(open&&!e.target.closest('.nav-cluster')){open.classList.remove('open');open.querySelector('.nav-trigger')?.setAttribute('aria-expanded','false')}
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
    const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;const path=normalize(u.pathname);if(!ROUTES.has(path)||(u.hash&&path===activePath()))return;e.preventDefault();navigate(u.href);
  });
  document.addEventListener('pointerenter',e=>{const a=e.target.closest?.('a[href]');if(a)warmRoute(a.href)},true);
  document.addEventListener('touchstart',e=>{const a=e.target.closest?.('a[href]');if(a)warmRoute(a.href)},{passive:true,capture:true});
  addEventListener('popstate',()=>navigate(location.href,{history:false,force:true}));
  addEventListener('online',updateConnectionBadge);addEventListener('offline',updateConnectionBadge);
  addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelector('.nav-cluster.open')?.classList.remove('open');document.querySelector('.mobile-studio-sheet.open')?.classList.remove('open');document.querySelector('.mobile-studio-backdrop.open')?.classList.remove('open');document.querySelector('.create-tab')?.setAttribute('aria-expanded','false');document.body.classList.remove('studio-open')});

  document.addEventListener('pointerdown',e=>{
    const el=e.target.closest('.button,.feature,.studio-nav-panel a,.mobile-studio-grid a,.motion-mobile-nav a,.motion-mobile-nav button');if(!el||reduceMotion.matches)return;
    const r=el.getBoundingClientRect(),dot=document.createElement('span');dot.className='tap-ripple';dot.style.left=(e.clientX-r.left)+'px';dot.style.top=(e.clientY-r.top)+'px';el.append(dot);setTimeout(()=>dot.remove(),650);
  },{passive:true});

  addEventListener('pointermove',e=>{const glow=document.querySelector('.motion-glow');if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}},{passive:true});

  function updateScrollState(force=false){
    const y=Math.max(0,scrollY),delta=y-lastScrollY;
    if(force||Math.abs(delta)>5){if(!force)scrollDirection=delta>0?1:-1;document.body.style.setProperty('--motion-dir',String(scrollDirection));document.body.classList.toggle('scroll-down',scrollDirection>0&&y>90&&!document.body.classList.contains('studio-open'));document.body.classList.toggle('scroll-up',scrollDirection<0||y<=90);lastScrollY=y}
    document.body.classList.toggle('motion-scrolled',y>28);
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),fraction=Math.max(0,Math.min(1,y/max));document.body.style.setProperty('--scroll-p',fraction.toFixed(4));
    const p=document.querySelector('.motion-progress>i');if(p&&!routing)p.style.transform=`scaleX(${fraction})`;
  }
  let scrollTick=false;addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{scrollTick=false;updateScrollState()})},{passive:true});

  const mutation=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&!node.matches?.('.motion-glow,.motion-ambient,.motion-progress,.route-status,.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop'))enhanceMotion(node)});mutation.observe(document.body,{childList:true,subtree:true});

  ensureStyles();setupShell();
  const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,320));idle(()=>['/editor','/projects','/lyrics','/image','/draw','/video','/code','/builds','/devices'].forEach(warmRoute));
})();
