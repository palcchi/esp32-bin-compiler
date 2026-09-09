(()=>{
  const menu=document.querySelector('.main-menu');
  if(!menu||menu.dataset.adaptiveNav==='1')return;
  menu.dataset.adaptiveNav='1';
  menu.setAttribute('aria-label','Navigasi utama');

  const normalize=value=>{
    value=String(value||'/').split('?')[0].split('#')[0];
    value=value.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'');
    return value||'/';
  };
  const current=normalize(location.pathname);

  const tabs=[
    ['Home','/','⌂'],
    ['Editor','/editor','✎'],
    ['Projects','/projects','▣'],
    ['Builds','/builds','↻'],
    ['Devices','/devices','◫']
  ];

  const bar=document.createElement('nav');
  bar.className='mobile-tabbar';
  bar.setAttribute('aria-label','Navigasi utama mobile');
  tabs.forEach(([label,href,icon])=>{
    const link=document.createElement('a');
    link.href=href;
    if(normalize(href)===current)link.className='active';
    const glyph=document.createElement('span');
    glyph.setAttribute('aria-hidden','true');
    glyph.style.fontSize='21px';
    glyph.style.lineHeight='1';
    glyph.textContent=icon;
    const text=document.createElement('span');
    text.textContent=label;
    link.append(glyph,text);
    bar.append(link);
  });
  document.body.append(bar);

  let theme=document.querySelector('meta[name="theme-color"]');
  if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.append(theme)}
  const appearance=matchMedia('(prefers-color-scheme: dark)');
  const syncTheme=()=>{theme.content=appearance.matches?'#000000':'#f5f5f7'};
  syncTheme();
  appearance.addEventListener?.('change',syncTheme);
})();