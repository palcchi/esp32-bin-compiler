(()=>{
  if(window.__vallianMotionShellV3)return;
  window.__vallianMotionShellV3=true;

  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const STUDIO=new Set(['/projects','/editor','/lyrics','/image','/draw','/video','/presets']);
  let scrollDirection=1,lastScrollY=scrollY,scrollTick=false;

  const normalize=value=>{
    let path=String(value||'/').split('?')[0].split('#')[0];
    path=path.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
    return path||'/';
  };
  const current=()=>normalize(location.pathname);

  function ensureStyles(){
    if(!document.querySelector('link[data-glass-ui]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='/glass.css?v=2';l.dataset.glassUi='1';document.head.append(l);
    }
    if(!document.querySelector('link[data-motion-ui]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='/motion.css?v=3';l.dataset.motionUi='1';document.head.append(l);
    }
    document.querySelectorAll('link[href*="gameboy.css"],link[href*="theme-yellow.css"]').forEach(el=>el.remove());
    let theme=document.querySelector('meta[name="theme-color"]');
    if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.append(theme)}
    theme.content='#f4f4f6';
  }

  const studioLinks=[
    ['/editor','Editor','✦','Scene mixer'],['/projects','Projects','▦','Save slots'],['/lyrics','Lyrics','Aa','Text animation'],['/image','Image','▧','1-bit converter'],['/draw','Draw','✎','Pixel canvas'],['/video','Video','▶','Frame converter'],['/presets','Presets','◌','Style packs']
  ];

  function buildDesktopNav(){
    let menu=document.querySelector('.main-menu');
    if(!menu){
      const shell=document.querySelector('.shell');if(!shell)return;
      menu=document.createElement('nav');menu.className='main-menu';shell.querySelector('.site-header,.page-nav')?.after(menu);
    }
    const path=current();
    menu.className='main-menu motion-nav';menu.dataset.adaptiveNav='1';menu.setAttribute('aria-label','Navigasi utama');menu.innerHTML='';
    const pill=document.createElement('span');pill.className='nav-active-pill';menu.append(pill);
    const mk=(label,href)=>{const a=document.createElement('a');a.className='nav-item'+(path===href?' active':'');a.href=href;a.textContent=label;return a};
    menu.append(mk('Home','/'));

    const cluster=document.createElement('div');cluster.className='nav-cluster';
    const trigger=document.createElement('button');trigger.type='button';trigger.className='nav-trigger'+(STUDIO.has(path)?' active':'');trigger.setAttribute('aria-expanded','false');trigger.innerHTML='<span>Studio</span><span class="nav-caret">⌄</span>';
    const panel=document.createElement('div');panel.className='studio-nav-panel';panel.innerHTML='<div class="studio-nav-grid"></div>';
    const grid=panel.firstElementChild;
    studioLinks.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span class="studio-nav-copy"><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    cluster.append(trigger,panel);menu.append(cluster);
    menu.append(mk('Compiler','/code'),mk('Builds','/builds'),mk('Devices','/devices'));
    const ota=document.createElement('a');ota.className='nav-ota';ota.href='http://192.168.4.1';ota.textContent='OTA';menu.append(ota);

    const open=v=>{cluster.classList.toggle('open',v);trigger.setAttribute('aria-expanded',String(v))};
    trigger.onclick=e=>{e.stopPropagation();open(!cluster.classList.contains('open'))};
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){let t;cluster.onmouseenter=()=>{clearTimeout(t);open(true)};cluster.onmouseleave=()=>{t=setTimeout(()=>open(false),130)}}

    const active=STUDIO.has(path)?trigger:menu.querySelector(`.nav-item[href="${path}"]`);
    const move=(target,animate=true)=>{
      if(!target){pill.style.opacity='0';return}
      const mr=menu.getBoundingClientRect(),r=target.getBoundingClientRect();
      if(!animate)pill.style.transition='none';pill.style.opacity='1';pill.style.width=r.width+'px';pill.style.transform=`translateX(${r.left-mr.left}px)`;
      if(!animate)requestAnimationFrame(()=>pill.style.transition='');
    };
    requestAnimationFrame(()=>move(active,false));
    [...menu.children].filter(x=>x.matches('.nav-item,.nav-cluster')).forEach(x=>{const t=x.classList.contains('nav-cluster')?trigger:x;x.addEventListener('mouseenter',()=>move(t))});
    menu.addEventListener('mouseleave',()=>move(active));
    if('ResizeObserver'in window)new ResizeObserver(()=>move(active,false)).observe(menu);
  }

  function buildMobileNav(){
    document.querySelectorAll('.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop').forEach(el=>el.remove());
    const path=current(),bar=document.createElement('nav');bar.className='mobile-tabbar motion-mobile-nav';bar.setAttribute('aria-label','Navigasi utama mobile');
    const add=(label,href,icon)=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<i aria-hidden="true">${icon}</i><span>${label}</span>`;bar.append(a)};
    add('Home','/','⌂');
    const studio=document.createElement('button');studio.type='button';studio.className='create-tab'+(STUDIO.has(path)?' active':'');studio.setAttribute('aria-expanded','false');studio.innerHTML='<i aria-hidden="true">＋</i><span>Studio</span>';bar.append(studio);
    add('Code','/code','⌘');add('Builds','/builds','↻');add('Device','/devices','◫');document.body.append(bar);

    const backdrop=document.createElement('div');backdrop.className='mobile-studio-backdrop';
    const sheet=document.createElement('div');sheet.className='mobile-studio-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','Studio tools');sheet.innerHTML='<div class="mobile-sheet-head"><strong>Studio</strong><span>CREATE & CONVERT</span></div><div class="mobile-studio-grid"></div>';
    const grid=sheet.querySelector('.mobile-studio-grid');
    studioLinks.forEach(([href,label,icon,sub])=>{const a=document.createElement('a');a.href=href;if(path===href)a.className='active';a.innerHTML=`<span class="studio-nav-icon">${icon}</span><span><b>${label}</b><small>${sub}</small></span>`;grid.append(a)});
    const ota=document.createElement('a');ota.href='http://192.168.4.1';ota.className='ota-mobile';ota.innerHTML='<span class="studio-nav-icon">↗</span><span><b>OTA</b><small>192.168.4.1</small></span>';grid.append(ota);
    document.body.append(backdrop,sheet);
    const set=v=>{backdrop.classList.toggle('open',v);sheet.classList.toggle('open',v);studio.setAttribute('aria-expanded',String(v));document.body.classList.toggle('studio-open',v);if(v){document.body.classList.remove('scroll-down');document.body.classList.add('scroll-up')}};
    studio.onclick=()=>set(!sheet.classList.contains('open'));backdrop.onclick=()=>set(false);
  }

  function ambient(){
    if(!document.querySelector('.motion-glow')){const x=document.createElement('div');x.className='motion-glow';document.body.append(x)}
    if(!document.querySelector('.motion-ambient')){const x=document.createElement('div');x.className='motion-ambient';x.innerHTML='<i></i><i></i>';document.body.append(x)}
    if(!document.querySelector('.motion-progress')){const x=document.createElement('div');x.className='motion-progress';x.innerHTML='<i></i>';document.body.append(x)}
  }

  let observer;
  function getObserver(){
    if(observer)return observer;
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const el=entry.target;
      if(entry.isIntersecting){el.style.setProperty('--motion-dir',String(scrollDirection));requestAnimationFrame(()=>el.classList.add('is-in'))}
      else el.classList.remove('is-in');
    }),{threshold:.055,rootMargin:'-1% 0px -3% 0px'});
    return observer;
  }

  function splitTitle(el){
    if(!el||el.dataset.motionSplit)return;
    el.dataset.motionSplit='1';
    const accessible=el.textContent.replace(/\s+/g,' ').trim();if(accessible)el.setAttribute('aria-label',accessible);
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    let i=0;
    nodes.forEach(node=>{const frag=document.createDocumentFragment();node.nodeValue.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part)){frag.append(document.createTextNode(part));return}const wrap=document.createElement('span');wrap.className='motion-word-wrap';wrap.setAttribute('aria-hidden','true');const word=document.createElement('span');word.className='motion-word';word.style.setProperty('--i',i++);word.textContent=part;wrap.append(word);frag.append(wrap)});node.replaceWith(frag)});
    el.classList.add('motion-title');getObserver().observe(el);
  }

  const mark=(selector,kind,root=document)=>{
    root.querySelectorAll(selector).forEach((el,i)=>{
      if(el.dataset.motion)return;
      el.dataset.motion=kind;el.style.setProperty('--motion-delay',Math.min(i%7,6)*30+'ms');getObserver().observe(el);
    });
  };

  function animateEverything(root=document){
    root.querySelectorAll('.home-hero h1,.page-intro h1,.page-head h1,.section-title h2,.section-heading h2,.editor-title h2,.preview-head h2').forEach(splitTitle);
    mark('.home-hero,.feature,.card,.studio,.build-card,.empty,.lyric-editor,.code-card,.scene-panel,.preview-card,.mini-oled,.latest-build,.build-list>*,.projects-grid>*','box',root);
    mark('.home-section,.page-intro,.page-head,.section-title,.section-heading,.editor-title,.preview-head,footer,.hero-meta,.feature-grid,.lyrics-workspace,.studio-grid,.build-section','section',root);
    mark('.settings-grid>*,.control-row>*,.code-grid>*,.studio-actions>*,.hero-actions>*,.editor-hints>*,.scene-row,.build-actions>*,.button,.page-badge,.connection-badge,.count-pill,.pill,.chip,.tool-badge','control',root);
    mark('canvas,video,.mini-screen,.preview-screen,.oled-preview,.oled-stage','media',root);
  }

  function connection(){
    const b=document.querySelector('#connectionBadge');if(!b)return;
    const on=navigator.onLine;b.textContent=on?'ONLINE':'OFFLINE';b.classList.toggle('online',on);b.classList.toggle('offline',!on);
  }

  function updateScroll(force=false){
    const y=Math.max(0,scrollY),delta=y-lastScrollY;
    if(force||Math.abs(delta)>4){if(!force)scrollDirection=delta>0?1:-1;document.body.style.setProperty('--motion-dir',String(scrollDirection));document.body.classList.toggle('scroll-down',scrollDirection>0&&y>90&&!document.body.classList.contains('studio-open'));document.body.classList.toggle('scroll-up',scrollDirection<0||y<=90);lastScrollY=y}
    document.body.classList.toggle('motion-scrolled',y>28);
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),f=Math.max(0,Math.min(1,y/max));document.body.style.setProperty('--scroll-p',f.toFixed(4));const p=document.querySelector('.motion-progress>i');if(p)p.style.transform=`scaleX(${f})`;
  }

  function tapFeedback(){
    document.addEventListener('pointerdown',e=>{
      const el=e.target.closest('.button,.feature,.studio-nav-panel a,.mobile-studio-grid a,.motion-mobile-nav a,.motion-mobile-nav button');if(!el||reduceMotion.matches)return;
      const r=el.getBoundingClientRect(),dot=document.createElement('span');dot.className='tap-ripple';dot.style.left=(e.clientX-r.left)+'px';dot.style.top=(e.clientY-r.top)+'px';el.append(dot);setTimeout(()=>dot.remove(),650);
    },{passive:true});
  }

  function nativeNavigation(){
    document.addEventListener('click',e=>{
      const open=document.querySelector('.nav-cluster.open');if(open&&!e.target.closest('.nav-cluster')){open.classList.remove('open');open.querySelector('.nav-trigger')?.setAttribute('aria-expanded','false')}
      const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
      const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.href===location.href||u.hash&&normalize(u.pathname)===current())return;
      if(reduceMotion.matches)return;
      e.preventDefault();
      document.body.classList.add('route-leaving');
      const destination=u.href;
      let moved=false;
      const go=()=>{if(moved)return;moved=true;location.href=destination};
      setTimeout(go,115);
      setTimeout(go,300);
    });
    addEventListener('pageshow',()=>{document.body.classList.remove('route-leaving');document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),720)});
  }

  function init(){
    ensureStyles();buildDesktopNav();buildMobileNav();ambient();animateEverything();connection();updateScroll(true);tapFeedback();nativeNavigation();
    document.body.classList.add('page-entering');setTimeout(()=>document.body.classList.remove('page-entering'),720);
  }

  addEventListener('online',connection);addEventListener('offline',connection);
  addEventListener('pointermove',e=>{const g=document.querySelector('.motion-glow');if(g){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}},{passive:true});
  addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{scrollTick=false;updateScroll()})},{passive:true});
  addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelector('.nav-cluster.open')?.classList.remove('open');document.querySelector('.mobile-studio-sheet.open')?.classList.remove('open');document.querySelector('.mobile-studio-backdrop.open')?.classList.remove('open');document.querySelector('.create-tab')?.setAttribute('aria-expanded','false');document.body.classList.remove('studio-open')});

  const mutation=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&!node.matches?.('.motion-glow,.motion-ambient,.motion-progress,.mobile-tabbar,.mobile-studio-sheet,.mobile-studio-backdrop,.tap-ripple'))animateEverything(node)});
  mutation.observe(document.body,{childList:true,subtree:true});

  init();
})();
