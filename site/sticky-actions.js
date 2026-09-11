(()=>{
'use strict';
if(window.__vallianStickyActions)return;window.__vallianStickyActions=true;
const $=s=>document.querySelector(s);
const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
const actions={
 '/device':[
  {label:'Simulate',icon:'▶',kind:'secondary',run:()=>$('.composer-tab[data-view="simulate"]')?.click()},
  {label:'Wiring',icon:'⌁',kind:'secondary',run:()=>$('.composer-tab[data-view="wiring"]')?.click()},
  {label:'Build BIN',icon:'↓',kind:'accent',target:'#buildDevice',before:()=>$('.composer-tab[data-view="code"]')?.click()}
 ],
 '/lyrics':[
  {label:'Preview',icon:'▶',kind:'secondary',target:'#playLyrics'},
  {label:'Export',icon:'↗',kind:'secondary',target:'#exportLyrics'},
  {label:'Build BIN',icon:'↓',kind:'accent',target:'#buildBin'}
 ],
 '/video':[
  {label:'Preview',icon:'▶',kind:'secondary',target:'#previewButton'},
  {label:'Export .h',icon:'↗',kind:'primary',target:'#exportButton'}
 ],
 '/image':[
  {label:'Preview',icon:'◫',kind:'secondary',run:()=>$('#out')?.scrollIntoView({behavior:'smooth',block:'center'})},
  {label:'Export .h',icon:'↗',kind:'primary',target:'#export'}
 ],
 '/editor':[
  {label:'Preview',icon:'◫',kind:'secondary',run:()=>$('#editorOled')?.scrollIntoView({behavior:'smooth',block:'center'})},
  {label:'Save',icon:'✓',kind:'primary',target:'#saveProject'}
 ],
 '/code':[
  {label:'History',icon:'↻',kind:'secondary',href:'/builds'},
  {label:'Build BIN',icon:'↓',kind:'accent',target:'#buildCode'}
 ]
};
function build(){
 const cfg=actions[path];if(!cfg?.length||innerWidth>760)return;
 document.querySelector('.mobile-actionbar')?.remove();
 const bar=document.createElement('nav');bar.className='mobile-actionbar';bar.style.setProperty('--action-count',cfg.length);bar.setAttribute('aria-label','Page actions');
 cfg.forEach(a=>{let el;if(a.href){el=document.createElement('a');el.href=a.href}else{el=document.createElement('button');el.type='button'}el.className='mobile-action-'+(a.kind||'secondary');el.innerHTML=`<span class="action-icon">${a.icon||''}</span><span>${a.label}</span>`;if(!a.href)el.onclick=()=>{a.before?.();if(a.run)return a.run();const t=$(a.target);if(t&&!t.disabled)t.click()};bar.append(el);if(a.target){const sync=()=>{const t=$(a.target);if(!t)return;el.disabled=!!t.disabled;el.classList.toggle('hidden',t.classList.contains('hidden'))};sync();const t=$(a.target);if(t)new MutationObserver(sync).observe(t,{attributes:true,attributeFilter:['disabled','class']})}});
 document.body.append(bar);document.body.classList.add('has-mobile-actionbar');
}
let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{document.body.classList.remove('has-mobile-actionbar');document.querySelector('.mobile-actionbar')?.remove();build()},120)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
