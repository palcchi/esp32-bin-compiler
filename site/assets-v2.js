(()=>{
'use strict';
if(window.__vallianAssetsV2)return;window.__vallianAssetsV2=true;
const T=(body)=>`<svg class="vl-icon vl-icon-clean" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const P=(body)=>`<svg class="vl-icon vl-icon-pixel" viewBox="0 0 24 24" fill="none" aria-hidden="true">${body}</svg>`;
const icons={
 cpu:T('<path d="M5 6a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -12"/><path d="M9 9h6v6h-6l0 -6"/><path d="M3 10h2M3 14h2M10 3v2M14 3v2M21 10h-2M21 14h-2M14 21v-2M10 21v-2"/>'),
 grid:T('<path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>'),
 edit:T('<path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415"/><path d="M16 5l3 3"/>'),
 folder:T('<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"/>'),
 text:T('<path d="M4 20l3 0M14 20l7 0M6.9 15l6.9 0M10.2 6.3l5.8 13.7M5 20l6 -16l2 0l7 16"/>'),
 history:T('<path d="M12 8l0 4l2 2"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>'),
 arrow:T('<path d="M7 17L17 7"/><path d="M7 7h10v10"/>'),
 plus:T('<path d="M12 5v14M5 12h14"/>'),
 select:T('<path d="M4 4l7 17l2 -7l7 -2z"/>'),
 rect:T('<rect x="4" y="5" width="16" height="14" rx="1"/>'),
 circle:T('<circle cx="12" cy="12" r="7"/>'),
 line:T('<path d="M5 19L19 5"/>'),
 pixel:T('<rect x="8" y="8" width="8" height="8"/>'),
 save:T('<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>'),
 download:T('<path d="M12 4v11M8 11l4 4l4 -4M5 20h14"/>'),
 home:P('<path d="M3 9H1V11H3V21H9V15H15V21H21V11H23V9H21V7H19V5H17V3H15V1H9V3H7V5H5V7H3V9ZM9 3H15V5H17V7H19V19H17V13H7V19H5V7H7V5H9V3Z" fill="currentColor"/>'),
 code:P('<path d="M8 3H10V5H8V7H6V9H4V11H2V13H4V15H6V17H8V19H10V21H8V19H6V17H4V15H2V13H0V11H2V9H4V7H6V5H8V3Z" fill="currentColor"/><path d="M16 3H14V5H16V7H18V9H20V11H22V13H20V15H18V17H16V19H14V21H16V19H18V17H20V15H22V13H24V11H22V9H20V7H18V5H16V3Z" fill="currentColor"/>'),
 image:P('<path fill-rule="evenodd" clip-rule="evenodd" d="M22 2H2V4H0V20H2V22H22V20H24V4H22V2ZM22 4V16H20V14H18V12H16V10H14V12H12V14H10V16H8V14H6V12H4V14H2V4H22ZM2 20V16H4V14H6V16H8V18H10V16H12V14H14V12H16V14H18V16H20V18H22V20H2ZM8 6H4V10H8V6Z" fill="currentColor"/>'),
 video:P('<path d="M2 3H16V5H18V9H20V7H24V17H20V15H18V19H16V21H2V19H0V5H2V3ZM16 5H2V19H16V5ZM20 11H22V13H20V11Z" fill="currentColor"/>'),
 wifi:P('<path d="M3 9H1V5H3V3H21V5H23V9H21V11H19V13H17V15H15V17H9V15H7V13H5V11H3V9ZM21 5H3V9H5V11H7V13H9V15H15V13H17V11H19V9H21V5Z" fill="currentColor"/><path d="M10 19H14V23H10V19Z" fill="currentColor"/>'),
 chip:P('<path d="M9 0H11V4H13V0H15V4H19V8H23V10H19V12H23V14H19V16H23V18H19V22H15V18H13V22H11V18H9V22H7V18H3V14H0V12H3V10H0V8H3V4H7V0H9ZM17 6H5V16H17V6ZM13 9H9V13H13V9Z" fill="currentColor"/>')
};
const aliases={devices:'cpu',gui:'grid',editor:'edit',projects:'folder',lyrics:'text',compiler:'code',ota:'wifi',builds:'history',photo:'image'};
function icon(name){return icons[aliases[name]||name]||icons.grid}
function hydrate(root=document){root.querySelectorAll?.('[data-icon]').forEach(el=>{if(el.dataset.assetHydrated==='1')return;el.innerHTML=icon(el.dataset.icon);el.dataset.assetHydrated='1';el.setAttribute('aria-hidden','true')})}
const api={icon,hydrate,icons};window.VallianAssets=api;
const run=()=>hydrate(document);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
new MutationObserver(rs=>rs.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.('[data-icon]'))hydrate(n.parentElement||document);hydrate(n)}}))).observe(document.documentElement,{childList:true,subtree:true});
})();
