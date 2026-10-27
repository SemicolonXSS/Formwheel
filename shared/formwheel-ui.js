/* Shared Rapid Shop cosmetic themes across Formwheel GitHub Pages projects.
   Cross-repository navigation carries only a theme id; no wallet or purchase data. */
(()=>{
'use strict';
const key='fw-global-theme-v1';
const palettes={
 sunset:['#fff0e8','#fff9f4','#ad3867','#ed9365'],
 forest:['#eaf7eb','#f7fff7','#176b49','#489467'],
 neon:['#f2eaff','#fdfaff','#6730bd','#9a55e5'],
 galaxy:['#e7e8ff','#f7f6ff','#3f359b','#7971db'],
 ocean:["#def8ff","#f3fdff","#086b8e","#13a6bb"],
 sakura:["#fff0f7","#fff8fb","#ac417f","#ed9fc8"],
 midnight:["#1f2940","#283751","#a7baff","#647ca5"],
 aurora:["#e7f9f5","#f4f8ff","#386f95","#9074d8"],
 ember:["#fff1e4","#fff9ef","#ae4f28","#e9913b"],
 cyber:["#edf5ff","#f9f5ff","#603bb6","#1b9da9"],
 royal:["#f5edff","#fffcf2","#6e43a0","#b88a3a"],
 void:["#e9e6f5","#f4f2fa","#575071","#86809c"],
 prismatic:["#f6f1ff","#fff9fc","#8051bb","#cf7baf"],
 echo:["#101729","#172c40","#62d0d7","#225974"],
 nova:["#15152c","#392746","#ffdeab","#af60cb"],
 "void-premium":["#05050d","#191323","#b396ed","#42305c"],
 rift:["#061b25","#15243c","#7b8cef","#7b2cbf"],
 comet:["#071b35","#16365c","#ffb56e","#215e9e"],
 eclipse:["#080914","#211c39","#f6cf84","#9c87c8"],
 quantum:["#182354","#29335e","#62d9da","#7653c5"],
 celestial:["#0c1632","#2e2758","#f8c986","#d68aba"],
 singularity:["#050511","#1c1533","#b78cff","#8e55e8"],
 overdrive:["#191130","#35204d","#fff0af","#ea9e36"] ,
 "cosmic-infinity":["#0b122a","#182345","#7de8ed","#b26df0"],
 "cosmic-paradox":["#0c102e","#302254","#7de8e0","#8257c5"],
 "cosmic-omega":["#08071d","#321f71","#ffe6b8","#bb5ce5"],
 "cosmic-eternity":["#171739","#fffaf0","#292929","#88d7e7"],
 "cosmic-genesis":["#070f28","#fffaf5","#292929","#b384ff"],
 "daynight":["#142c57","#fffaf1","#292929","#ffad66"],
 "playtester-purple":["#271342","#342052","#f6e9ff","#b98aff"],
 "playtester-red":["#430e28","#531d38","#fff0ee","#ff7466"],
 "playtester-blue":["#09244d","#153b65","#e6faff","#69d8f3"]
};
const gradients={
 "playtester-purple":"radial-gradient(circle at 24% 25%,#e7c5ff 0%,transparent 36%),linear-gradient(125deg,#271342,#7650c7 58%,#bb81ff)",
 "playtester-red":"radial-gradient(circle at 25% 22%,#ffc6b2 0%,transparent 35%),linear-gradient(125deg,#430e28,#ba3055 55%,#ff7466)",
 "playtester-blue":"radial-gradient(circle at 25% 22%,#b9f3ff 0%,transparent 35%),linear-gradient(125deg,#09244d,#256fbd 58%,#69d8f3)",
 daynight:"linear-gradient(180deg,#76b7f8,#f7de9d,#ee957e)",
 "cosmic-genesis":"conic-gradient(from 90deg,#07152c,#3079aa,#b384ff,#091432,#07152c)",
 sunset:"linear-gradient(120deg,#f5a669,#ce6899,#5853b1)",
 forest:"linear-gradient(120deg,#173d30,#489467,#b3c785)",
 neon:"linear-gradient(120deg,#0e1a30,#165c75,#58246e)",
 galaxy:"linear-gradient(120deg,#131733,#4a3388,#181a41)",
 ocean:"linear-gradient(120deg,#064e6b,#13a6bb,#a4e8ed)",
 sakura:"linear-gradient(120deg,#b55e91,#f4a9c6,#ffe1ed)",
 midnight:"linear-gradient(120deg,#111827,#253454,#51679b)",
 aurora:"linear-gradient(120deg,#0b5b65,#5d54b5,#a85e9b)",
 ember:"linear-gradient(120deg,#69271f,#e56d32,#f7c15b)",
 cyber:"linear-gradient(120deg,#15112e,#6b20a4,#25c8d5)",
 royal:"linear-gradient(120deg,#352057,#7549a0,#d9ad50)",
 void:"linear-gradient(120deg,#0b0b15,#29223d,#565071)",
 prismatic:"linear-gradient(120deg,#e55786,#8069db,#3dbbc5,#e8bd6a)",
 echo:"linear-gradient(120deg,#101729,#225974,#62d0d7)",
 nova:"radial-gradient(circle,#ffdeab,#af60cb,#15152c)",
 "void-premium":"radial-gradient(circle,#42305c,#151222,#05050d)",
 rift:"linear-gradient(120deg,#061b25,#145f8c,#7b2cbf,#19102f)",
 comet:"linear-gradient(115deg,#071b35,#215e9e,#ffb56e)",
 eclipse:"radial-gradient(circle at 55% 45%,#f6cf84 0 12%,#211c39 15% 32%,#080914 55%)",
 quantum:"conic-gradient(from 25deg,#182354,#27a9ad,#7653c5,#1a224c,#27a9ad)",
 celestial:"linear-gradient(135deg,#0c1632,#5546ab,#d68aba,#f8c986)",
 singularity:"radial-gradient(circle at 50% 55%,#020208 0 18%,#8e55e8 21%,#251653 39%,#050511 70%)",
 overdrive:"conic-gradient(from 45deg,#ea9e36,#fff0af,#9c53ce,#2d5abf,#ea9e36)",
 "cosmic-infinity":"conic-gradient(from 30deg,#0b122a,#24b6c7,#b26df0,#0b122a)",
 "cosmic-paradox":"repeating-conic-gradient(from 20deg,#0c102e 0 25deg,#8257c5 25deg 45deg,#13c8ad 45deg 60deg)",
 "cosmic-omega":"radial-gradient(circle,#ffe6b8 0 8%,#bb5ce5 14%,#321f71 35%,#08071d 70%)",
 "cosmic-eternity":"conic-gradient(#faf4c1,#88d7e7,#7d66e2,#f6b4d5,#faf4c1)"
};
let approvedPlaytester=false;
const isPlaytesterTheme=id=>typeof id==='string'&&['playtester-purple','playtester-red','playtester-blue'].includes(id);
const shopKey='formwheel_rapid_shop_beta_v1';
function entitled(id){
 if(!Object.hasOwn(palettes,id))return false;
 if(isPlaytesterTheme(id))return approvedPlaytester;
 try{
  const shop=JSON.parse(localStorage.getItem(shopKey)||'null');
  return Boolean(shop && Array.isArray(shop.purchases) &&
   shop.purchases.some(p=>p && p.theme===id && p.refunded===false));
 }catch{return false;}
}
let current=null;
const assignmentsKey='fw-project-themes-v1';
function projectTheme(){
 try{
  const path=location.pathname;
  const map=JSON.parse(localStorage.getItem(assignmentsKey)||'{}');
  const name=new URLSearchParams(location.search).get('fwProject');
  return (name && map[name]) || map[path] || null;
 }catch{return null;}
}
function refresh(){
 let requested=null;
 try{
  const params=new URLSearchParams(location.search);
  const incoming=params.get('fwTheme');
  if(incoming==='classic')localStorage.removeItem(key);
  else if(Object.hasOwn(palettes,incoming) && entitled(incoming) && !params.has('fwProject'))localStorage.setItem(key,incoming);
  requested=projectTheme() || localStorage.getItem(key);
 }catch{}
 current=entitled(requested)?requested:null;
 // Preserve the preference until asynchronous entitlement verification completes.
 return current;
}
refresh();
const sheet=document.createElement('style');
sheet.textContent=`body[data-fw-global-theme] {background:var(--fw-theme-preview-gradient)!important;background-attachment:fixed!important;}
body[data-fw-global-theme] header,body[data-fw-global-theme] .card,body[data-fw-global-theme] .panel,body[data-fw-global-theme] .fw-footer{border-color:var(--fw-theme-accent)!important;}
body[data-fw-global-theme]{color:var(--fw-theme-text)!important;}
body[data-fw-global-theme] h1,body[data-fw-global-theme] h2,body[data-fw-global-theme] h3,body[data-fw-global-theme] h4,body[data-fw-global-theme] p,body[data-fw-global-theme] .hero p,body[data-fw-global-theme] .score,body[data-fw-global-theme] .stat strong{color:var(--fw-theme-text)!important;}
body[data-fw-global-theme] .card,body[data-fw-global-theme] .panel{background-color:var(--fw-theme-surface)!important;color:var(--fw-theme-text)!important;}
body[data-fw-global-theme] .muted,body[data-fw-global-theme] .sub,body[data-fw-global-theme] .theme-note,body[data-fw-global-theme] .item-desc{color:var(--fw-theme-muted)!important;}
body[data-fw-global-theme] a:not(.logo):not(.home):not(.fw-hub-logo){color:var(--fw-theme-accent);}
body[data-fw-global-theme] input,body[data-fw-global-theme] select,body[data-fw-global-theme] textarea{color:#202337;background-color:#fff;}
body[data-fw-global-theme] .fw-footer{background:var(--fw-theme-surface)!important;}
body[data-fw-global-theme] a:not(.home):not(.logo){accent-color:var(--fw-theme-accent);}
body[data-fw-global-theme] .hero h1,body[data-fw-global-theme] h1{ text-shadow:0 1px 0 var(--fw-theme-surface); }`;
document.head.append(sheet);

// Theme-aware contrast and decorative backgrounds. Animations never intercept input.
const themeStyle=document.createElement('style');
themeStyle.textContent=`
body[data-fw-global-theme]{isolation:isolate;background:var(--fw-theme-preview-gradient)!important;color:var(--fw-theme-on-background)!important}
/* Animated effects sit behind content, not behind an opaque body background. */
html:has(body[data-fw-global-theme][data-fw-effect]){background:#10152e}
body[data-fw-global-theme][data-fw-effect]{background:transparent!important;isolation:isolate}
body[data-fw-global-theme][data-fw-effect]::before{z-index:-1!important}
body[data-fw-global-theme]::before{content:"";position:fixed;inset:-60vmax;z-index:-1;pointer-events:none;background:var(--fw-theme-preview-gradient);background-position:center;background-size:cover;transform-origin:center;opacity:0}
body[data-fw-global-theme][data-fw-effect]::before{opacity:1}
body[data-fw-global-theme][data-fw-effect="spin"]::before{animation:fw-theme-spin 18s linear infinite}
body[data-fw-global-theme][data-fw-effect="slow-spin"]::before{animation:fw-theme-spin 42s linear infinite}
body[data-fw-global-theme][data-fw-effect="reverse-spin"]::before{animation:fw-theme-reverse-spin 36s linear infinite}
body[data-fw-global-theme][data-fw-effect="pulse"]::before{animation:fw-theme-pulse 8s ease-in-out infinite}
body[data-fw-global-theme][data-fw-effect="drift"]::before{animation:fw-theme-drift 16s ease-in-out infinite}
body[data-fw-global-theme][data-fw-effect="shimmer"]::before{animation:fw-theme-shimmer 12s ease-in-out infinite}
@keyframes fw-theme-spin{to{transform:rotate(360deg)}}
@keyframes fw-theme-reverse-spin{to{transform:rotate(-360deg)}}
@keyframes fw-theme-pulse{50%{transform:scale(1.13);filter:brightness(1.22)}}
@keyframes fw-theme-drift{50%{transform:translate(5%,-3%) scale(1.05);filter:hue-rotate(12deg)}}
@keyframes fw-theme-shimmer{50%{filter:brightness(1.24) saturate(1.22);transform:scale(1.045)}}
body[data-fw-global-theme] :is(h1,h2,h3,h4,p,.hero p,.score,.stat strong){color:inherit!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer){color:var(--fw-theme-text)!important;background:var(--fw-theme-surface)!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer) :is(h1,h2,h3,h4,p,.score,.stat strong,span,small,label){color:inherit}
body[data-fw-global-theme] :is(.muted,.sub,.theme-note,.item-desc){color:var(--fw-theme-muted)!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer) a{color:var(--fw-theme-accent)!important}
body[data-fw-global-theme] :is(button,input,select,textarea){color-scheme:light}
body[data-fw-global-theme] :is(input,select,textarea){color:#202337!important;background:#fff!important}
body[data-fw-global-theme] button{color:var(--fw-theme-button-text);background-color:var(--fw-theme-button-bg);border-color:var(--fw-theme-accent)}
body[data-fw-global-theme] :is(.card,.panel) button{color:var(--fw-theme-button-text);background-color:var(--fw-theme-button-bg)}
body[data-fw-global-theme] .hero h1,body[data-fw-global-theme] h1{text-shadow:none}
body[data-fw-global-theme] :is(.upgrade-desc,.stat,.score-label,.click-info,.notice,.status,.item-desc,.theme-note,.muted,.sub,.mission-row,.receipt){color:var(--fw-theme-muted)!important}
body[data-fw-global-theme] :is(.upgrade,.item,.stat,.theme-item){color:var(--fw-theme-text)!important}
body[data-fw-global-theme] :is(.card,.panel) :is(.upgrade,.item) button{color:var(--fw-theme-button-text)!important}
body[data-fw-global-theme] :is(.upgrade-price,.stat strong,.item-title){color:var(--fw-theme-text)!important}
/* Theme contrast v3: foreground depends on its actual surface, not the page. */
body[data-fw-global-theme] :is(header,main,.hero,.toolbar,.fw-install){color:var(--fw-theme-on-background)}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer){color:var(--fw-theme-text)!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer) :is(h1,h2,h3,h4,p,span,small,strong,label):not(.muted):not(.sub):not(.theme-note):not(.item-desc){color:inherit!important}
body[data-fw-global-theme] :is(button,[role="button"]){color:var(--fw-theme-button-text)!important;background-color:var(--fw-theme-button-bg)!important}
body[data-fw-global-theme] :is(input,select,textarea){color:#202337!important;background-color:#fff!important}
body[data-fw-global-theme] :is(input,textarea)::placeholder{color:#626979!important}
/* Eternity's pale conic background needs a dark, readable text plate.
   All content surfaces use the same dark palette as the preview. */
body[data-fw-global-theme="cosmic-eternity"] :is(.hero h1,.hero h2,.hero p,main > h1,main > h2,main > p){
  color:#251b47!important;text-shadow:0 1px 2px rgba(255,255,255,.9);
}
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.mission-row,.receipt,.notice,.status,.fw-install,.fw-favorites-panel,.fw-install-info){
  background:#fffaf0!important;color:#292929!important;border-color:#615f8b!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.mission-row,.receipt,.notice,.status,.fw-install,.fw-favorites-panel,.fw-install-info) :is(h1,h2,h3,h4,p,span,small,strong,label):not(.muted):not(.sub):not(.item-desc):not(.upgrade-desc):not(.theme-note){
  color:inherit!important;text-shadow:none!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.mission-row,.receipt,.notice,.status,.fw-install,.fw-favorites-panel,.fw-install-info) :is(.muted,.sub,.item-desc,.upgrade-desc,.score-label,.click-info,.theme-note){
  color:#e5def5!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(button,[role="button"]){
  color:#fff!important;background-color:#251c45!important;border-color:#88d7e7!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(input,select,textarea){background:#fff!important;color:#202337!important}
body[data-fw-global-theme="cosmic-eternity"] :is(input,textarea)::placeholder{color:#626979!important}
/* Difficulty chips keep their pale background; use black text for Eternity. */
body[data-fw-global-theme="cosmic-eternity"] .tag.difficulty{color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="cosmic-eternity"] .card .tag.difficulty{color:#292929!important}


/* Premium backgrounds: readable foreground on cards and inputs. */
body[data-fw-global-theme] :is(.card,.panel,.food,.station,.modal,.dialog) :is(.description,.name,.state,.item-desc,.subtitle){text-shadow:none!important}
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.station,.modal,.dialog) :is(a,button:not(.selected)){text-shadow:none}
body[data-fw-global-theme="cosmic-eternity"] :is(.hero,.hero-copy) :is(h1,h2,h3,p,span){color:#251b47!important;text-shadow:0 1px 2px #fff!important}
body[data-fw-global-theme="cosmic-paradox"] :is(.hero,.hero-copy) :is(h1,h2,h3,p,span){color:#fff!important;text-shadow:0 1px 3px #07071c,0 2px 8px #07071c!important}
body[data-fw-global-theme] :is(input,select,textarea,option){color:#202337!important;background:#fff!important}
/* Contrast v4: make each text color match its own backdrop. */
body[data-fw-global-theme] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog){color:var(--fw-theme-text)!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog) :is(h1,h2,h3,h4,p,span,small,strong,label,.title,.description):not(.muted):not(.sub):not(.theme-note):not(.item-desc){color:inherit!important}
body[data-fw-global-theme] :is(.card,.panel,.fw-footer) a:not(.openButton):not(.logo):not(.fw-hub-logo){color:var(--fw-theme-readable-link)!important;text-decoration-thickness:1px}
body[data-fw-global-theme] :is(.muted,.sub,.theme-note,.item-desc,.upgrade-desc,.score-label,.click-info){color:var(--fw-theme-muted)!important}
body[data-fw-global-theme] :is(.tag,.badge,.fw-maturity-caption){text-shadow:none!important}
body[data-fw-global-theme] :is(input,textarea,select,option){color:#172033!important;background:#fff!important}
body[data-fw-global-theme] :is(button,[role="button"]):not(.food):not(.selected){color:var(--fw-theme-button-text)!important}
/* Eternity monochrome lettering: dark text on warm ivory surfaces. */
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog,.fw-install,.fw-favorites-panel,.fw-install-info){
  background:#fffaf0!important;color:#292929!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog,.fw-install,.fw-favorites-panel,.fw-install-info) :is(h1,h2,h3,h4,p,span,small,strong,label,a,.title,.description,.muted,.sub,.item-desc,.upgrade-desc,.theme-note,.score-label,.click-info){
  color:#292929!important;text-shadow:none!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(button,[role="button"],.openButton){
  background:#f3edf9!important;color:#292929!important;border-color:#676080!important;
}
body[data-fw-global-theme="cosmic-eternity"] :is(button,[role="button"],.openButton) :is(span,small,strong,b){color:#292929!important}
body[data-fw-global-theme="cosmic-eternity"] :is(.tag,.badge,.fw-maturity-caption){color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="cosmic-eternity"] :is(.muted,.sub,.theme-note,.item-desc,.upgrade-desc,.score-label,.click-info){color:#252238!important}


/* Restore distinct cosmic identities; light text only on each dark theme's surface. */
body:is([data-fw-global-theme="cosmic-paradox"],[data-fw-global-theme="cosmic-omega"],[data-fw-global-theme="cosmic-infinity"],[data-fw-global-theme="cosmic-genesis"]) .card .tag.difficulty{background:#fff7e8!important;color:#292929!important}
body:is([data-fw-global-theme="cosmic-paradox"],[data-fw-global-theme="cosmic-omega"],[data-fw-global-theme="cosmic-infinity"],[data-fw-global-theme="cosmic-genesis"]) .card .tag.online{background:#eef9f2!important;color:#205c39!important}
body:is([data-fw-global-theme="cosmic-paradox"],[data-fw-global-theme="cosmic-omega"],[data-fw-global-theme="cosmic-infinity"],[data-fw-global-theme="cosmic-genesis"]) .card .tag.offline{background:#f1f2f4!important;color:#454b58!important}
body[data-fw-global-theme="cosmic-paradox"] .card .openButton{background:#423267!important;color:#fff!important;border-color:#9776e6!important}
body[data-fw-global-theme="cosmic-omega"] .card .openButton{background:#5b357b!important;color:#fff!important;border-color:#e4b6f3!important}
body[data-fw-global-theme="cosmic-infinity"] .card .openButton{background:#164c66!important;color:#fff!important;border-color:#7de8ed!important}
body[data-fw-global-theme="cosmic-genesis"] .card .openButton{background:#225c85!important;color:#fff!important;border-color:#90ddff!important}
body:is([data-fw-global-theme="cosmic-paradox"],[data-fw-global-theme="cosmic-omega"],[data-fw-global-theme="cosmic-infinity"],[data-fw-global-theme="cosmic-genesis"]) .card .openButton :is(span,small,strong,b){color:inherit!important}
/* GENESIS: light content surfaces with charcoal lettering; retain cosmic animation. */
body[data-fw-global-theme="cosmic-genesis"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog,.fw-install,.fw-favorites-panel,.fw-install-info){background:#fffaf5!important;color:#292929!important;border-color:#7fa4d9!important}
body[data-fw-global-theme="cosmic-genesis"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.notice,.status,.receipt,.modal,.dialog,.fw-install,.fw-favorites-panel,.fw-install-info) :is(h1,h2,h3,h4,p,span,small,strong,label,a,.title,.description,.muted,.sub,.item-desc,.upgrade-desc,.theme-note,.score-label,.click-info){color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="cosmic-genesis"] :is(button,[role="button"],.openButton){background:#e7f0ff!important;color:#292929!important;border-color:#7fa4d9!important;text-shadow:none!important}
body[data-fw-global-theme="cosmic-genesis"] :is(button,[role="button"],.openButton) :is(span,small,strong,b){color:#292929!important}
body[data-fw-global-theme="cosmic-genesis"] .card .openButton{background:#e7f0ff!important;color:#292929!important;border-color:#7fa4d9!important}
body[data-fw-global-theme="cosmic-genesis"] :is(.tag,.badge,.fw-maturity-caption){color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="cosmic-genesis"] :is(input,textarea,select){background:#fff!important;color:#202337!important}
/* DAYNIGHT: 30 seconds = 24 hours; stable light cards keep labels readable. */
body[data-fw-global-theme="daynight"][data-fw-effect="daynight"]::before{inset:0;opacity:1;background:linear-gradient(180deg,#76b7f8 0%,#f7de9d 100%);animation:fw-daynight-sky 30s linear infinite;transform:none!important}
/* Exact semicircular orbital paths are driven by trigonometry, not linear keyframe corners. */
body[data-fw-global-theme="daynight"][data-fw-effect="daynight"]::after{display:none!important}
body[data-fw-global-theme="daynight"] .fw-daynight-sun{
 position:fixed;top:0;left:0;width:80px;height:80px;border-radius:50%;
 pointer-events:none;z-index:-1;background:#fff8b0;box-shadow:0 0 55px 12px #ffe8a8;
 opacity:0;transform:translate3d(-200px,-200px,0);will-change:transform,opacity;contain:layout paint;
}
@keyframes fw-daynight-sky{
0%,100%{background:linear-gradient(180deg,#f2a3a0,#ffd796)}
18%,35%{background:linear-gradient(180deg,#65b6fa,#e3f5ff)}
52%,68%{background:linear-gradient(180deg,#e37191,#f9ab68)}
80%,92%{background:linear-gradient(180deg,#101b43,#39447a)}
}
body[data-fw-global-theme="daynight"] .fw-daynight-moon{
 position:fixed;top:0;left:0;width:68px;height:68px;border-radius:50%;
 z-index:-1;pointer-events:none;background:radial-gradient(circle at 35% 30%,#fffef3,#e6e6dc 75%,#c9cccf);
 box-shadow:0 0 35px 8px #f3f3dca8;animation:none!important;
 transform:translate3d(-200px,-200px,0);opacity:0;will-change:transform,opacity;contain:layout paint;
}
body[data-fw-global-theme="daynight"] .fw-daynight-moon::after{
 content:"";position:absolute;inset:0;border-radius:50%;
 background:radial-gradient(circle at 25% 35%,#bec2c657 0 6%,transparent 8%),radial-gradient(circle at 65% 60%,#aeb4bb55 0 9%,transparent 11%),radial-gradient(circle at 56% 19%,#adb3bd50 0 5%,transparent 7%);
}
body[data-fw-global-theme="daynight"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.modal,.dialog,.notice,.status){background:#fffaf1!important;color:#292929!important;border-color:#d5a37a!important}
body[data-fw-global-theme="daynight"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.modal,.dialog) :is(h1,h2,h3,h4,p,span,small,strong,label,.muted,.sub,.item-desc,.theme-note){color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="daynight"] :is(button,[role="button"],.openButton){background:#ffe6c8!important;color:#292929!important;border-color:#bd8d65!important}
body[data-fw-global-theme="daynight"] .card .openButton{background:#ffe6c8!important;color:#292929!important}
@media(prefers-reduced-motion:reduce){body[data-fw-global-theme="daynight"][data-fw-effect="daynight"]::before,body[data-fw-global-theme="daynight"][data-fw-effect="daynight"]::after,body[data-fw-global-theme="daynight"] .fw-daynight-moon{animation:none!important}}
/* DAYNIGHT: charcoal text on the animated sky and all readable surfaces. */
body[data-fw-global-theme="daynight"] :is(header,main,.hero,.toolbar,.fw-install,.fw-footer){color:#292929!important}
body[data-fw-global-theme="daynight"] :is(.hero h1,.hero h2,.hero p,main > h1,main > h2,main > p){color:#292929!important;text-shadow:0 1px 2px #fff8!important}
body[data-fw-global-theme="daynight"] :is(.card,.panel,.fw-footer,.upgrade,.item,.theme-item,.station,.modal,.dialog,.notice,.status,.fw-install,.fw-install-info,.fw-favorites-panel) :is(h1,h2,h3,h4,p,span,small,strong,label,a,.title,.description,.muted,.sub,.item-desc,.upgrade-desc,.theme-note,.score-label,.click-info){color:#292929!important;text-shadow:none!important}
body[data-fw-global-theme="daynight"] :is(button,[role="button"],.openButton) :is(span,strong,small,b){color:#292929!important}
body[data-fw-global-theme] .food.selected,body[data-fw-global-theme] .food.selected :is(span,small,strong,b,.name,.state,.components){color:#142341!important}
/* Premium cosmic card controls: pale chips must never inherit light card lettering.
   Scope to four cosmic themes; retain each theme's animated background. */
body[data-fw-global-theme="cosmic-eternity"] .card :is(.tag,.badge,.fw-maturity-caption){
  color:#292929!important;text-shadow:none!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card .tag.difficulty{
  background:#fff7e8!important;color:#292929!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card .tag.online{
  background:#eef9f2!important;color:#205c39!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card .tag.offline{
  background:#f1f2f4!important;color:#454b58!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card :is(a.openButton,button.openButton,.openButton){
  background:#f3edf9!important;color:#292929!important;border:1px solid #777197!important;text-shadow:none!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card .openButton :is(span,small,strong,b){
  color:#292929!important;
}
body[data-fw-global-theme="cosmic-eternity"] .card .openButton:hover{
  background:#e5d9f4!important;color:#292929!important;
}

@media(prefers-reduced-motion:reduce){body[data-fw-global-theme]::before{animation:none!important;transform:none!important}}
`;
document.head.append(themeStyle);
// Mount moon only after body exists; CSS limits visibility to DAYNIGHT.
function mountDaynightBodies(){
 for(const kind of ['sun','moon']){
  if(document.querySelector('.fw-daynight-'+kind))continue;
  const node=document.createElement('span');
  node.className='fw-daynight-'+kind;
  node.setAttribute('aria-hidden','true');
  document.body.append(node);
 }
}
// Keep the same 30-second semicircle, but move only compositor-friendly DOM layers.
// Avoid six CSS custom-property writes and a full style recalculation every frame.
function startDaynightOrbit(){
 mountDaynightBodies();
 const bodies={
  sun:document.querySelector('.fw-daynight-sun'),
  moon:document.querySelector('.fw-daynight-moon')
 };
 const origin=performance.now();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let lastActive=false;
 let radius=0,horizon=0,center=0;
 function measure(){
  radius=Math.max(window.innerHeight*.90,window.innerWidth*.52);
  horizon=window.innerHeight+100;
  center=window.innerWidth/2;
 }
 measure();
 window.addEventListener('resize',measure,{passive:true});
 function frame(now){
  const active=document.body?.dataset.fwGlobalTheme==='daynight' && !reduced.matches;
  if(active){
   const phase=((now-origin)%30000)/30000;
   function place(kind,start,end){
    const node=bodies[kind];
    if(!node)return;
    const t=(phase-start)/(end-start);
    if(t<0||t>1){
     if(node.style.opacity!=='0')node.style.opacity='0';
     return;
    }
    if(node.style.opacity!=='1')node.style.opacity='1';
    const theta=Math.PI*(1-t);
    const size=kind==='sun'?80:68;
    const x=center+radius*Math.cos(theta)-size/2;
    const y=horizon-radius*Math.sin(theta);
    node.style.transform='translate3d('+x.toFixed(4)+'px,'+y.toFixed(4)+'px,0)';
   }
   place('sun',0,.59);
   place('moon',.60,1);
  }else if(lastActive){
   for(const node of Object.values(bodies))if(node)node.style.opacity='0';
  }
  lastActive=active;
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startDaynightOrbit,{once:true});else startDaynightOrbit();

const effects={'playtester-purple':'shimmer','playtester-red':'pulse','playtester-blue':'drift','cosmic-infinity':'spin','cosmic-paradox':'reverse-spin','cosmic-omega':'pulse','cosmic-eternity':'slow-spin','cosmic-genesis':'reverse-spin',daynight:'daynight',overdrive:'spin',quantum:'reverse-spin',singularity:'slow-spin',nova:'pulse',echo:'pulse',comet:'drift',celestial:'shimmer',eclipse:'pulse',rift:'drift',aurora:'drift',prismatic:'shimmer',cyber:'shimmer','void-premium':'pulse'};
const textThemes={
 'playtester-purple':['#303038','#303038','#303038'],
 'playtester-red':['#303038','#303038','#303038'],
 'playtester-blue':['#303038','#303038','#303038'],
 sunset:['#281523','#432638','#6b2850'],forest:['#fff','#173e30','#145039'],
 neon:['#fff','#291c48','#5720a2'],galaxy:['#fff','#262151','#45369b'],
 ocean:['#063d50','#073c4a','#075577'],sakura:['#492039','#4b2346','#913565'],
 midnight:['#fff','#ffffff','#c3d2ff'],aurora:['#fff','#254d5b','#295d77'],
 ember:['#2c130c','#4d2819','#8a361d'],cyber:['#fff','#352657','#5534a8'],
 royal:['#fff','#3d2459','#63338a'],void:['#fff','#312b45','#575071'],
 prismatic:['#211a39','#ffffff','#643d9e'],echo:['#fff','#152b3b','#89ecf1'],
 nova:['#fff','#ffffff','#ffe0a9'],'void-premium':['#fff','#191323','#c8a9ff'],
 rift:['#fff','#ffffff','#9ba8ff'],comet:['#fff','#16365c','#ffd4a2'],
 eclipse:['#fff','#ffffff','#ffdf9b'],quantum:['#fff','#29335e','#96f7f0'],
 celestial:['#fff','#ffffff','#ffdba7'],singularity:['#fff','#1c1533','#d8b8ff'],
 overdrive:['#201329','#ffffff','#ffe5a3'],
 'cosmic-infinity':['#ffffff','#ffffff','#90ebf0'],'cosmic-paradox':['#ffffff','#ffffff','#83e8e1'],'cosmic-omega':['#ffffff','#ffffff','#ffe6b8'],'cosmic-eternity':['#292929','#292929','#292929'],'cosmic-genesis':['#292929','#292929','#292929'],daynight:['#292929','#292929','#292929']
};

// Derive readable text from each theme's *actual* surface color.
function themeLuminance(hex){
 const parts=/^#([0-9a-f]{6})$/i.exec(hex||'');
 if(!parts)return 0.15;
 const rgb=[1,3,5].map(i=>parseInt(parts[1].slice(i-1,i+1),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
function themeContrast(foreground,background){
 const a=themeLuminance(foreground),b=themeLuminance(background);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
function readableOn(hex){return themeContrast('#ffffff',hex)>=themeContrast('#172033',hex)?'#ffffff':'#172033';}

// Read approved playtester entitlement for exclusive themes; fail closed when unavailable.
(async()=>{
 try{
  const [{initializeApp,getApps},{getAuth,onAuthStateChanged},{getDatabase,ref,get}]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js')
  ]);
  const app=getApps()[0]||initializeApp({apiKey:'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',authDomain:'formwheel.firebaseapp.com',databaseURL:'https://formwheel-default-rtdb.firebaseio.com',projectId:'formwheel',appId:'1:431583088241:web:74e0e34ea1e3e1170c55d0'});
  const auth=getAuth(app),db=getDatabase(app);
  let generation=0;
  onAuthStateChanged(auth,async user=>{
   const mine=++generation;
   approvedPlaytester=false;apply();
   if(!user||user.isAnonymous)return;
   try{
    const snap=await get(ref(db,'formwheelV2/playtesterEntitlements/'+user.uid));
    if(mine!==generation)return;
    approvedPlaytester=snap.val()?.approved===true&&snap.val()?.revoked!==true;
    apply();
   }catch(e){if(mine===generation){approvedPlaytester=false;apply();}}
  });
 }catch(e){console.warn('Playtester theme verification unavailable',e)}
})();
function apply(){
 refresh();
 if(!document.body)return;
 document.body.toggleAttribute('data-fw-global-theme',Boolean(current));
 if(current){
  document.body.dataset.fwGlobalTheme=current;
  const effect=effects[current];
  if(effect)document.body.dataset.fwEffect=effect;else delete document.body.dataset.fwEffect;
  const darkThemesForButtons=new Set(['playtester-purple','playtester-red','playtester-blue','midnight','echo','nova','void-premium','rift','comet','eclipse','quantum','celestial','singularity','overdrive','cosmic-infinity','cosmic-paradox','cosmic-omega','cosmic-eternity','cosmic-genesis','daynight']);
  const [onBackground,onSurface,linkAccent]=textThemes[current]||['#fff','#fff','#333'];
  document.body.style.setProperty('--fw-theme-on-background',onBackground);
  document.body.style.setProperty('--fw-theme-text',onSurface);
  document.body.style.setProperty('--fw-theme-button-bg',current==='cosmic-eternity'?'#f3edf9':current==='cosmic-genesis'?'#e7f0ff':current==='daynight'?'#ffe6c8':darkThemesForButtons.has(current)?'#251c45':'#f0edff');
  document.body.style.setProperty('--fw-theme-button-text',current==='cosmic-eternity'?'#292929':current==='cosmic-genesis'?'#292929':current==='daynight'?'#292929':darkThemesForButtons.has(current)?'#fff':'#252040');
  const [bg,surface,accent,secondary]=palettes[current];
  document.body.style.setProperty('--fw-theme-preview-gradient',gradients[current]);
  document.body.style.setProperty('--fw-theme-bg',bg);
  document.body.style.setProperty('--fw-theme-surface',surface);
  document.body.style.setProperty('--fw-theme-accent',linkAccent);
  document.body.style.setProperty('--fw-theme-secondary',secondary);
  const darkThemes=new Set(['midnight','echo','nova','void-premium','rift','comet','eclipse','quantum','celestial','singularity','overdrive','cosmic-infinity','cosmic-paradox','cosmic-omega','cosmic-eternity','cosmic-genesis']);
  const surfaceText=isPlaytesterTheme(current)?'#303038':readableOn(surface);
  const mutedText=surfaceText==='#ffffff'?'#e9e9f5':'#414b60';
  document.body.style.setProperty('--fw-theme-text',surfaceText);
  document.body.style.setProperty('--fw-theme-muted',mutedText);
  document.body.style.setProperty('--fw-theme-readable-link',themeContrast(linkAccent,surface)>=4.5?linkAccent:surfaceText);
  document.body.style.setProperty('--fw-theme-readable-on-bg',readableOn(bg));
 }else {delete document.body.dataset.fwEffect;document.body.removeAttribute('data-fw-global-theme');document.body.style.removeProperty('--fw-theme-preview-gradient');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
document.addEventListener('click',e=>{
 const link=e.target.closest?.('a[href]');
 if(!link||e.defaultPrevented)return;
 refresh();
 try{
  const url=new URL(link.href,location.href);
  if(url.hostname==='semicolonxss.github.io' && url.origin===location.origin){
   const projectName=link.dataset.fwProject || null;
   const assignments=JSON.parse(localStorage.getItem(assignmentsKey)||'{}');
   const theme=(projectName && assignments[projectName]) || assignments[url.pathname] || current;
   if(theme && entitled(theme))url.searchParams.set('fwTheme',theme);
   else url.searchParams.delete('fwTheme');
   if(projectName)url.searchParams.set('fwProject',projectName);
   link.href=url.href;
  }
 }catch{}
},true);
window.addEventListener('formwheel-theme-changed',apply);
window.FormwheelTheme={get:()=>refresh(),apply,set:id=>{
 try{if(id==='classic'||id===null)localStorage.removeItem(key);
 else if(entitled(id))localStorage.setItem(key,id);
 // Do not clear an existing selection when authorization is unavailable.}catch{}
 apply();
 return current;
}};
})();
/* Common accessible controls, status and errors; no analytics or data transfer. */
(()=>{'use strict';if(window.FormwheelUI)return;
 let toastTimer,toastNode,errorNode,dialogNode;
 function toast(message){if(!toastNode){toastNode=document.createElement('div');toastNode.className='fw-toast';toastNode.setAttribute('role','status');document.body.append(toastNode);}toastNode.textContent=message;toastNode.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.hidden=true,3500);}
 function error(message){if(typeof message!=='string')message=errorMessage(message);if(!errorNode){errorNode=document.createElement('div');errorNode.className='fw-error';errorNode.setAttribute('role','alert');const text=document.createElement('span'),retry=document.createElement('button'),close=document.createElement('button');retry.textContent='새로고침';retry.onclick=()=>location.reload();close.textContent='닫기';close.onclick=()=>errorNode.hidden=true;errorNode.append(text,retry,close);document.body.append(errorNode);}errorNode.firstChild.textContent=message;errorNode.hidden=false;}
 function errorMessage(value){const code=String(value?.code||value?.message||value||'');if(/permission.denied|permission-denied|PERMISSION_DENIED/i.test(code))return '저장 또는 조회 권한이 없습니다. 프로젝트 관리자에게 문의해주세요.';if(/api.key|api-key|invalid-api-key/i.test(code))return '서비스 연결 설정에 오류가 있습니다. 프로젝트 관리자에게 문의해주세요.';if(/auth\//i.test(code))return '로그인 연결에 실패했습니다. 다시 로그인해주세요.';if(/network|offline|unavailable|disconnected|fetch/i.test(code))return '네트워크 연결에 실패했습니다. 연결을 확인하고 다시 시도해주세요.';return '작업을 완료하지 못했습니다. 현재 화면을 확인하고 다시 시도해주세요.';}
 function modal(title,message){dialogNode?.remove();dialogNode=document.createElement('dialog');dialogNode.className='fw-dialog';const heading=document.createElement('h2'),text=document.createElement('p'),close=document.createElement('button');heading.textContent=title;text.textContent=message;close.textContent='확인';close.onclick=()=>dialogNode.close();dialogNode.append(heading,text,close);document.body.append(dialogNode);dialogNode.showModal();close.focus();}
 function loading(message='불러오는 중…'){const node=document.createElement('div');node.className='fw-loading';node.textContent=message;node.setAttribute('role','status');document.body.append(node);return ()=>node.remove();}
 function countdown(seconds=3){let timer,node=document.createElement('div'),remaining=seconds;node.className='fw-loading';node.style.fontSize='72px';node.textContent=remaining;node.setAttribute('role','status');document.body.append(node);return new Promise(resolve=>{timer=setInterval(()=>{remaining--;if(remaining>0)node.textContent=remaining;else{clearInterval(timer);node.remove();resolve()}},1000)})}
 function result(title,summary,restart){const dialog=document.createElement('dialog');dialog.className='fw-dialog';const h=document.createElement('h2'),p=document.createElement('p'),again=document.createElement('button'),close=document.createElement('button');h.textContent=title;p.textContent=summary;again.textContent='다시 시작';close.textContent='닫기';again.onclick=()=>{dialog.close();restart?.()};close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.append(h,p,again,close);document.body.append(dialog);dialog.showModal();close.focus();return dialog}
 window.FormwheelUI={toast,error,errorMessage,modal,loading,countdown,result};
 addEventListener('unhandledrejection',event=>error(errorMessage(event.reason)));
 addEventListener('error',event=>{if(event.error)error(errorMessage(event.error));else if(event.target?.tagName==='SCRIPT')error('필요한 프로그램을 불러오지 못했습니다. 연결을 확인해주세요.');},true);
 addEventListener('offline',()=>toast('네트워크 연결이 끊겼습니다. 온라인 저장은 다시 연결한 뒤 확인해주세요.'));
 addEventListener('online',()=>toast('네트워크가 다시 연결되었습니다.'));
 function ready(){
  const app=document.getElementById('app');if(app&&!app.textContent.trim()){const done=loading();const observer=new MutationObserver(()=>{if(app.textContent.trim()){done();observer.disconnect();}});observer.observe(app,{childList:true,subtree:true});setTimeout(()=>{if(!app.textContent.trim()){done();observer.disconnect();error('시작 화면을 불러오지 못했습니다. 다시 시도해주세요.');}},15000);}
  const footer=document.createElement('footer');footer.className='fw-footer';const home=document.createElement('a'),help=document.createElement('button');home.href='https://semicolonxss.github.io/Formwheel/';home.textContent='Formwheel Home';help.textContent='이용 안내';help.onclick=()=>modal('Formwheel 이용 안내','온라인 기능은 닉네임·답안·점수·채팅 등 입력한 내용을 서버에 저장할 수 있습니다.\n기기에 저장하는 기능은 브라우저 데이터 삭제 시 초기화됩니다.\n민감한 개인정보를 입력하지 마세요. 각 프로젝트의 서버 접근 권한 검증 상태는 Check에서 확인할 수 있습니다.');const privacy=document.createElement('a');privacy.href='https://semicolonxss.github.io/Formwheel/privacy.html';privacy.textContent='개인정보 안내';const creators=document.createElement('a');creators.href='https://semicolonxss.github.io/Formwheel/creators.html';creators.textContent='제작자들';footer.append(home,help,privacy,creators);document.body.append(footer);
  const codes=new Set(['roomCodeDisplay','lobbyCode','gameRoomCode','codeDisplay']);
  function adaptCodes(){for(const id of codes){const node=document.getElementById(id);if(!node||node.dataset.fwCopy)continue;node.dataset.fwCopy='1';const button=document.createElement('button');button.textContent='코드 복사';button.type='button';button.onclick=async()=>{const code=node.textContent.trim();if(!/^\d{4,6}$/.test(code)){toast('참가 가능한 방 코드가 아직 없습니다.');return}try{await navigator.clipboard.writeText(code);toast('방 코드를 복사했습니다.')}catch{modal('방 코드',code)}};node.after(button)}}adaptCodes();new MutationObserver(adaptCodes).observe(document.body,{childList:true,subtree:true});
  const nickIds=/^(nickname|nick|hostName|joinName|soloName|battleName|soloNickname|playerName|myName|nicknameInput|n)$/i;
  function adapt(){document.querySelectorAll('input').forEach(input=>{if(nickIds.test(input.id))input.maxLength=12;});}adapt();new MutationObserver(adapt).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

/* Cook-style, non-blocking project tutorials. */
(()=>{
'use strict';
const guides={"Formwheel":[["프로젝트 찾기","검색창에 이름이나 관심 있는 기능을 입력해 보세요.","input[type=search],input"],["필터로 좁히기","게임·도구·앱과 인원·연결·난이도를 골라 원하는 프로젝트를 찾으세요.","인원"],["시작하기","프로젝트 카드를 누르면 해당 서비스가 열립니다. 각 서비스의 튜토리얼로 사용법을 배워 보세요.",".card"],["다시 찾기","필터 초기화로 전체 목록을 다시 볼 수 있어요. 각 프로젝트의 로고를 누르면 메인으로 돌아옵니다.","필터 초기화"]],"Wheel":[["항목 준비","추첨할 이름이나 항목을 추가하세요. 먼저 항목 두 개로 시험해 보세요.","input"],["추첨 설정","시간·라운드·당첨 항목 제외 여부를 확인하세요. 원하는 설정을 고른 뒤 돌림판을 돌리세요.","select"],["결과 확인","돌림판이 멈추면 당첨 결과와 기록을 확인하세요. 제외 모드에서는 당첨 항목이 다음 추첨에서 빠집니다.","돌리기"],["저장과 공유","목록 복사·공유·저장 기능으로 다음 추첨에서도 같은 항목을 사용할 수 있어요.","공유"]],"Form":[["설문 준비","Form 제목과 설명을 입력하세요.","input"],["질문 만들기","질문 추가를 누르고 질문 내용·유형·선택지를 설정하세요.","질문 추가"],["미리보기","미리보기로 응답자에게 보이는 화면을 확인하고 저장하세요.","미리보기"],["게시와 응답","설문 게시 후 링크를 공유하고, 응답 보기에서 제출된 응답을 확인하세요.","설문 게시"]],"Quiz":[["퀴즈 만들기","Quiz 만들기에서 제목·제한 시간을 정하고 질문과 정답을 입력하세요.","퀴즈 만들기"],["참가 코드","게임을 만들고 코드를 친구에게 알려 주세요. 참가자는 참가하기에서 코드와 닉네임을 입력해요.","참가하기"],["문제 진행","참가자가 모이면 게임을 시작하세요. 참가자는 제한 시간 안에 답을 제출하세요.","게임 시작하기"],["결과와 다음 문제","답안 공개 후 다음 문제로 진행하고 마지막에 최종 순위를 확인하세요.","다음 문제"]],"Battle":[["대결 준비","Battle 만들기에서 닉네임·퀴즈·방식·제한 시간을 선택하세요.","Battle 만들기"],["친구 참가","생성된 Battle 코드를 공유하세요. 친구는 Battle 참가하기에서 코드와 닉네임을 입력해요.","Battle 참가하기"],["답안 제출","대결이 시작되면 문제를 읽고 제한 시간 안에 선택지를 고르세요.","#app"],["라운드 결과","라운드 결과와 최종 점수를 확인하세요. 새 Battle 만들기로 다시 대결할 수 있어요.","새 Battle 만들기"]],"Bomb":[["방 준비","닉네임을 입력하고 방을 만들거나 코드로 참가하세요. 시작 전에 화면의 시간 설정을 확인하세요.","방 만들기"],["게임 시작","친구가 모이면 방장이 게임 시작을 눌러요.","게임 시작"],["폭탄 넘기기","폭탄을 가진 사람이 폭탄 넘기기를 눌러 다른 사람에게 넘겨요. 폭발 순간 보유자를 확인하세요.","폭탄 넘기기"],["다시 도전","결과를 확인하고 다시 하기로 새 게임을 진행하세요.","다시 하기"]],"WheelB":[["Battle 만들기","닉네임과 Quiz 제한 시간을 선택하고 Battle을 만드세요.","Battle 만들기"],["상대 입장","상대에게 코드를 알려 주세요. 상대는 참가하기에서 코드와 닉네임을 입력해요.","참가하기"],["스핀과 답안","게임 화면에서 스핀을 진행하고 제시되는 질문에 답하세요.","스핀"],["다음 라운드","결과를 확인한 뒤 다음 라운드로 진행하고 최종 점수를 비교하세요.","다음 라운드"]],"Risk":[["방 참가","방을 만들거나 방 코드로 참가하세요.","방 만들기"],["친구 모으기","대기실에서 참가자를 확인한 뒤 방장이 게임을 시작해요.","게임 시작"],["점수 걸기","현재 점수와 라운드 상황을 보고 걸 점수를 정한 뒤 베팅하기를 누르세요.","베팅하기"],["결과 확인","라운드 결과를 보며 다음 선택을 정하세요. 마지막에는 최종 순위를 확인하세요.","GAME OVER"]],"Spy":[["설정과 방","닉네임·난이도·장소 범위·게임 모드를 정하고 방을 만드세요. 친구는 코드로 참가해요.","방 만들기"],["비밀 역할","게임 시작 후 자신의 역할을 확인하세요. 시민은 제시어를, Spy는 질문의 단서를 활용해요.","당신의 역할"],["질문과 답변","질문할 사람을 고르고 질문하세요. 온라인 모드는 화면에서 답변을 제출하고 오프라인 모드는 함께 대화해요.","질문할 사람"],["투표와 마지막 기회","의심 투표로 Spy를 찾아보세요. 지목된 Spy에게는 제시어를 추측하는 마지막 기회가 있어요.","투표하기"]],"Reflex":[["모드 선택","혼자 연습하려면 게임 시작, 친구와 대결하려면 Battle을 선택하세요.","게임 시작"],["신호 기다리기","반응 영역의 시작 신호를 기다리세요. 신호가 바뀐 뒤 최대한 빨리 눌러요.","READY"],["Battle 참가","Battle에서 닉네임과 방 코드를 입력해 방을 만들거나 참가하세요.","방 만들기"],["기록 비교","라운드별 반응 시간과 최종 결과를 확인하고 다시 도전하세요.","다시 하기"]],"Casino":[["로그인과 잔액","로그인하고 보유 코인을 확인하세요. 화면에서 사용할 게임을 골라요.","로그인"],["게임 고르기","Roulette·Blackjack·Dice 등 원하는 게임의 Play를 누르세요.","Play"],["게임 진행","게임 창의 안내에 따라 베팅 금액과 행동을 선택하고 결과를 확인하세요.","Game"],["상점과 인벤토리","코인 상점·인벤토리에서 사용할 아이템과 보유 상태를 확인하세요.","코인 상점"]],"DiceDuel":[["방 준비","방을 만들고 친구에게 코드를 공유하세요. 친구는 방 참가에서 들어와요.","방 만들기"],["주사위 선택","게임 시작 전에 내 주사위 선택에서 속성과 효과를 확인하고 고르세요.","내 주사위 선택"],["각자 굴리기","내 주사위 굴리기를 누르세요. 양쪽 주사위가 다 굴러간 뒤 결과를 확인하세요.","내 주사위 굴리기"],["5라운드 대결","방장의 진행으로 다음 라운드를 시작해요. 5라운드가 끝나면 최종 결과를 확인하세요.","다시 대결"]],"Vote":[["투표 만들기","투표 제목과 선택지를 입력하세요. 선택지 추가로 항목을 더 만들 수 있어요.","투표 제목"],["참가하기","투표방 코드를 공유하세요. 참가자는 코드와 닉네임을 입력해 참가해요.","참가하기"],["투표 진행","방장이 투표 시작을 누르면 참가자가 원하는 선택지를 골라 투표해요.","투표하기"],["종료와 결과","현재 결과를 확인하고 방장 관리에서 투표를 종료하세요.","현재 결과"]],"Marble":[["참가자 입력","[기생충-3], [전랑]처럼 입력하고 입력 버튼을 누르세요. -숫자는 같은 이름의 구슬 개수예요.","입력"],["맵 선택","기본 맵을 고르거나 커스텀 맵을 만드세요. 크게 보기로 맵을 미리 확인해요.","맵 선택"],["경주 시작","배속과 표시 설정을 확인한 뒤 MARBLE START를 누르세요.","MARBLE START"],["맵 저장과 공유","현재 맵 저장으로 보관하거나 맵 공유에서 링크·QR로 친구에게 보내세요.","맵 공유"]],"Clicker":[["클릭으로 시작","CLICK을 눌러 점수를 모으세요.","CLICK"],["업그레이드","점수를 사용해 클릭 파워와 자동 클릭을 올리세요. 가격과 증가량을 확인하세요.","클릭 파워"],["Prestige","Prestige 조건과 효과를 화면에서 확인하고 성장 전략을 정하세요.","Prestige"],["기록 등록","점수 등록으로 기록을 남기고 리더보드를 확인하세요.","점수 등록"]],"Fate":[["방 입장","닉네임을 입력하고 새 방을 만들거나 코드로 참가하세요.","새 방 만들기"],["운명 선택","라운드의 운명 카드 설명을 읽고 안전·탐욕·혼돈·복수 중 전략을 정하세요.","이번 라운드의 운명"],["돌림판","내 운명 돌리기를 눌러 점수 변화와 특수 효과를 확인하세요.","내 운명 돌리기"],["라운드 진행","방장의 다음 라운드 진행에 따라 플레이하고 최종 결과와 순위를 확인하세요.","다음 라운드"]],"Balance":[["방 만들기","닉네임과 설정을 입력해 방을 만들거나 코드로 참가하세요.","방 만들기"],["게임 시작","방 코드를 공유하고 참가자가 모이면 방장이 게임을 시작해요.","게임 시작"],["행동 선택","공격·방어·점수 획득·교환·랜덤의 효과를 보고 행동을 선택하세요.","공격"],["위험도 관리","점수뿐 아니라 위험도도 확인하세요. 위험 한계에서 발생하는 이벤트를 고려해 다음 행동을 골라요.","방어"]],"Vault":[["금고 확인","나의 금고 열기에서 보물·성장·아이템을 확인하세요.","나의 금고 열기"],["공용 금고 참가","공용 금고에서 방을 만들거나 코드로 참가하고 친구와 시작하세요.","공용 금고"],["획득과 탈출","게임 중 획득 상황을 보고 계속 진행할지 탈출하고 보관할지 결정하세요.","탈출하고 보관"],["금고 성장","보관한 보물과 아이템을 확인하고 금고 업그레이드를 활용하세요.","금고 업그레이드"]],"Time":[["모드 선택","Solo는 닉네임을 입력하고 시작하세요. Battle은 방을 만들거나 코드로 참가해요.","Solo 시작"],["좌우 이동","좌우 버튼으로 이동하며 장애물을 피하고 모래시계를 모으세요.","←"],["남은 시간","장애물은 시간을 깎고 모래시계는 시간을 늘려요. 남은 시간을 계속 확인하세요.","→"],["대결과 기록","Battle에서는 공격 충전을 활용하고, Solo에서는 종료 후 리더보드 기록을 확인하세요.","Solo 리더보드"]],"Edit":[["미디어 추가","미디어 추가로 편집할 영상이나 이미지를 불러오세요.","미디어 추가"],["클립 편집","클립을 선택하고 자르기·복제·순서 이동으로 타임라인을 구성하세요.","자르기"],["꾸미기와 재생","텍스트·스티커·음악·효과를 추가하고 재생으로 결과를 확인하세요.","텍스트"],["저장과 내보내기","프로젝트 저장으로 이어서 편집할 상태를 보관하고 내보내기로 결과를 만들어요.","내보내기"]],"Music":[["세 가지 모드","음악 제작·재생·플레이 중 원하는 모드를 선택하세요.","음악 제작"],["곡 만들기","제작에서 악기·BPM·음표 길이를 정하고 음을 선택해 추가하세요. 쉼표와 되돌리기도 활용해요.","선택 음 추가"],["저장과 감상","Firebase 저장 또는 JSON 내보내기로 보관하세요. 음악 재생에서 곡을 선택해 감상할 수 있어요.","음악 재생"],["리듬 플레이","음악 플레이에서 곡과 난이도를 고르고 시작하세요. 화면의 키 안내에 맞춰 떨어지는 음표를 연주해요.","음악 플레이"]],"Chat":[["계정 준비","회원가입 또는 로그인 후 닉네임을 확인하세요.","로그인"],["채팅방","만들기로 새 방을 만들거나 입장에서 친구가 준 방 코드를 입력하세요.","만들기"],["메시지 보내기","방을 선택하고 메시지를 입력한 뒤 전송 버튼을 누르세요. 이모티콘도 사용할 수 있어요.","textarea,input"],["방 관리","방 정보에서 코드를 확인하세요. 관리 권한이 있으면 화면의 관리 기능을 사용할 수 있어요.","ⓘ"]],"Tool":[["도구 고르기","계산기·타이머·자리바꾸기 등 필요한 도구를 메뉴에서 선택하세요.","계산기"],["입력과 실행","선택한 도구의 입력칸과 옵션을 채우고 실행 버튼을 누르세요. 결과를 확인한 뒤 값을 바꿔 다시 시험해요.","input"],["파일 도구","영상·오디오·이미지 도구는 파일을 불러와 옵션을 설정하고 미리보기나 결과를 확인하세요.","이미지 도구"],["자리바꾸기","자리바꾸기에서 그리드와 인원을 준비하고 빈칸·배치 조건을 정한 뒤 섞기와 공개를 진행하세요.","자리바꾸기"]],"Button":[["모드와 설정","솔로 또는 같이를 선택하고 게임 설정을 확인하세요.","솔로"],["명령 읽기","라운드마다 제시되는 명령을 먼저 읽으세요. 눌러야 하는지 기다려야 하는지 판단해요.","Chaos 규칙"],["제한 시간","시간 안에 올바른 버튼을 찾아 누르세요. 가짜 문구와 방해 요소를 주의하세요.","솔로 시작"],["같이 플레이","닉네임과 방 코드로 친구와 모여 시작하고 최종 결과를 비교하세요.","방 만들기"]],"Decode":[["입력과 방향","변환할 텍스트를 넣고 Encode 또는 Decode를 선택하세요.","textarea"],["형식 고르기","Base64·URL·HTML·진법 등 필요한 형식을 고르고 변환하기를 누르세요.","변환하기"],["자동 인식","형식을 모르겠다면 자동 분석으로 후보를 확인하세요. 후보를 적용한 뒤 결과가 맞는지 읽어보세요.","자동 분석"],["결과 활용","결과 복사 또는 결과를 입력으로를 눌러 여러 변환을 이어서 진행하세요.","결과 복사"]],"AI":[["말 걸기","입력창에 문장을 쓰고 보내기를 누르세요.","보내기"],["사용법 확인","사용법에서 AI에게 알려주는 방법과 지원하는 입력을 확인하세요.","사용법"],["상태와 기억","AI 상태·기억·발전 과정에서 배운 내용과 현재 단계를 확인하세요.","AI 상태"],["다시 가르치기","대화를 이어가며 내용을 알려 주세요. 기억 초기화는 배운 내용을 지울 때 사용하세요.","기억"]],"Check":[["프로젝트 찾기","목록에서 확인할 프로젝트를 찾으세요. 검색과 표시 필터로 항목을 좁힐 수 있어요.","input"],["항목 확인","개선 항목과 검토 근거를 읽고 실제로 완료된 항목을 체크하세요.","input[type=checkbox]"],["진행 상태","미완료 항목 필터로 남은 일을 확인하세요. 전체 체크는 표시된 항목을 확인한 뒤 사용하세요.","표시"],["상태 초기화","전체 해제·진행상태 초기화는 체크 상태를 되돌리는 기능이에요. 필요할 때 선택하세요.","진행상태 초기화"]]};
function init(){
if(new URLSearchParams(location.search).has('fwMatch'))return;
const project=decodeURIComponent(location.pathname).split('/').filter(Boolean)[0]||'Formwheel';
const name=project==='Formwheel'?'Formwheel':project.replace(/^Formwheel_/i,'');
const steps=guides[name];if(!steps||document.getElementById('fw-tutorial'))return;
const style=document.createElement('style');style.textContent=`
.fw-tutorial-launch{position:fixed;right:16px;bottom:16px;z-index:99980;padding:10px 16px;border:1px solid #c8ccdf;background:#fff;color:#24294c;box-shadow:0 4px 20px #0002;font:600 14px system-ui;cursor:pointer}
#fw-tutorial{position:fixed;right:16px;bottom:70px;z-index:99981;width:min(390px,calc(100vw - 32px));max-height:45dvh;overflow:auto;padding:18px;border:2px solid #9183da;border-radius:18px;background:#fff;color:#24243a;box-shadow:0 8px 36px #0003;font:14px/1.7 system-ui;text-align:left;box-sizing:border-box}
#fw-tutorial[hidden]{display:none!important}#fw-tutorial h2{font:700 17px/1.5 system-ui;margin:0 0 8px;color:#24243a}#fw-tutorial p{margin:0 0 12px;color:#424257}#fw-tutorial .fw-tutorial-actions{display:flex;gap:8px;flex-wrap:wrap}#fw-tutorial button{padding:8px 14px;border:1px solid #d5d3e6;border-radius:10px;background:#f1effa;color:#302653;font:600 14px system-ui;cursor:pointer}#fw-tutorial button:disabled{opacity:.45;cursor:default}
.fw-tutorial-target{outline:3px solid #a28ae8!important;outline-offset:4px!important}
@media(max-width:600px){#fw-tutorial{right:10px;bottom:66px;width:calc(100vw - 20px);padding:14px}.fw-tutorial-launch{right:10px;bottom:10px}}
`;document.head.append(style);
const launch=document.createElement('button');launch.type='button';launch.className='fw-tutorial-launch';launch.textContent='🎓 튜토리얼';launch.setAttribute('aria-controls','fw-tutorial');launch.setAttribute('aria-expanded','false');
const panel=document.createElement('section');panel.id='fw-tutorial';panel.hidden=true;panel.setAttribute('aria-label',name+' 튜토리얼');
const title=document.createElement('h2'),text=document.createElement('p'),actions=document.createElement('div');text.setAttribute('aria-live','polite');actions.className='fw-tutorial-actions';
const back=document.createElement('button'),next=document.createElement('button'),close=document.createElement('button');for(const b of [back,next,close])b.type='button';back.textContent='이전';close.textContent='닫기';actions.append(back,next,close);panel.append(title,text,actions);document.body.append(launch,panel);
let index=0,target=null,active=false,frame=0;
const key='formwheel_tutorial_'+project+'_v1';
function clear(){if(target){target.classList.remove('fw-tutorial-target');target=null;}}
function find(hint){let nodes=[];try{nodes=[...document.querySelectorAll(hint)];}catch{}if(!nodes.length)nodes=[...document.querySelectorAll('button,h1,h2,h3,label,a')].filter(n=>!panel.contains(n)&&n!==launch&&n.textContent.includes(hint));return nodes.find(n=>n.getClientRects().length&&!n.closest('[hidden]'));}
function highlight(){clear();if(!active)return;target=find(steps[index][2]);target?.classList.add('fw-tutorial-target');}
function render(){title.textContent=(index+1)+' / '+steps.length+' · '+steps[index][0];text.textContent=steps[index][1];back.disabled=index===0;next.textContent=index===steps.length-1?'완료':'다음';highlight();}
function end(focus=true){active=false;panel.hidden=true;clear();launch.setAttribute('aria-expanded','false');try{localStorage.setItem(key,'done');}catch{}if(focus)launch.focus();}
function start(focus=true){index=0;active=true;panel.hidden=false;launch.setAttribute('aria-expanded','true');render();if(focus)next.focus();}
launch.onclick=()=>active?end():start();
back.onclick=()=>{if(index>0){index--;render();}};
next.onclick=()=>{if(index===steps.length-1)end();else{index++;render();}};
close.onclick=()=>end();
document.addEventListener('keydown',event=>{if(active&&event.key==='Escape')end();});
new MutationObserver(()=>{if(!active||frame)return;frame=requestAnimationFrame(()=>{frame=0;highlight();});}).observe(document.body,{childList:true,subtree:true});
if(name!=='Formwheel'){try{if(!localStorage.getItem(key))start(false);}catch{start(false);}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

