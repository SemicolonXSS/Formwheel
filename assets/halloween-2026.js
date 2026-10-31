/* Formwheel Haunted Night 2026 — isolated seasonal layer; no Rapid balance writes. */
(()=>{'use strict';
const START=Date.parse('2026-10-30T15:00:00Z'),END=Date.parse('2026-10-31T15:00:00Z');
const KEY='fw-halloween-2026-v1';
const active=()=>Date.now()>=START&&Date.now()<END;
let stopSession=null, boundaryTimer;
function syncSeason(){
 clearTimeout(boundaryTimer);
 if(!active()){if(stopSession){stopSession();stopSession=null;}if(Date.now()<START)boundaryTimer=setTimeout(syncSeason,Math.min(START-Date.now(),2147483647));return;}
 if(!stopSession)stopSession=startSession();
 boundaryTimer=setTimeout(syncSeason,Math.min(END-Date.now(),2147483647));
}
function startSession(){
let state={found:[],badge:false,caught:0};
try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');if(Array.isArray(old.found))state.found=[...new Set(old.found.filter(n=>Number.isInteger(n)&&n>=0&&n<5))];state.badge=!!old.badge||state.found.length===5;state.caught=Number.isSafeInteger(old.caught)&&old.caught>=0?Math.max(old.caught,state.found.length):state.found.length;}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
const hour=()=>Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
const config=()=>{const h=hour();return {count:h<6?15:h<12?3:h<17?5:h<20?9:15,delay:h===23?1800:h<6||h>=20?3600:h>=17?5500:8000,frenzy:h===23};};
const style=document.createElement('style');style.textContent=`
#fw-halloween{position:relative;z-index:5;max-width:700px;margin:8px auto;padding:9px 12px;border:1px solid #fb923c;border-radius:14px;background:linear-gradient(135deg,#27133d,#542348);color:#fff;text-align:center;box-shadow:0 8px 30px #0003}
#fw-halloween h2{color:#ffcf80;margin:0 0 5px;font-size:16px}#fw-halloween p{color:#fff;margin:4px}#fw-halloween button{background:#ffb347;color:#241329;border:0;border-radius:9px;padding:5px 9px;font-weight:800;cursor:pointer;font-size:12px}
#fw-hw-counter{display:flex;align-items:center;justify-content:center;gap:5px 14px;flex-wrap:wrap;font-weight:800;font-size:13px}
body.fw-halloween-active{position:relative}#fw-hw-ghost-field{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:6}.fw-hw-ghost{position:absolute;z-index:1;pointer-events:auto;background:#251b3de8;color:#fff;border:2px solid #ffc778;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:21px;box-shadow:0 4px 15px #0005;touch-action:manipulation}
.fw-hw-ghost:focus-visible{outline:3px solid #fff;outline-offset:3px}
#fw-halloween-status{font-weight:750}body.fw-halloween-active{--fw-halloween-accent:#ffab49}
@media(prefers-reduced-motion:no-preference){#fw-halloween{animation:fw-hw-glow 4s ease-in-out infinite alternate}@keyframes fw-hw-glow{to{box-shadow:0 8px 32px #ff9d4570}}}
`;document.head.append(style);document.body.classList.add('fw-halloween-active');
const panel=document.createElement('section');panel.id='fw-halloween';panel.setAttribute('aria-label','할로윈 특별 이벤트');
panel.innerHTML='<h2>🎃 FORMWHEEL: HAUNTED NIGHT</h2><div id="fw-hw-counter" aria-live="polite"><span id="fw-hw-caught"></span><span id="fw-hw-spawn"></span></div><p id="fw-halloween-status" aria-live="polite"></p><button type="button" id="fw-hw-info">이벤트 안내 · 보상 안내</button>';
document.body.prepend(panel);
const field=document.createElement('div');field.id='fw-hw-ghost-field';field.setAttribute('aria-label','출현한 유령');panel.after(field);
const caughtEl=panel.querySelector('#fw-hw-caught'),spawnEl=panel.querySelector('#fw-hw-spawn'),status=panel.querySelector('#fw-halloween-status');
const update=()=>{const c=config();caughtEl.textContent='👻 잡은 유령 '+state.caught+'마리';spawnEl.textContent='출현량 '+c.count+'마리'+(c.frenzy?' · 🔥 GHOST FRENZY ×2':'');status.textContent=state.badge?'🏅 HALLOWEEN 2026 — 최초 5마리 발견 완료!':'🔎 최초 발견 '+state.found.length+'/5';};
update();
panel.querySelector('#fw-hw-info').onclick=()=>alert('2026년 10월 31일 00:00~24:00 (한국 시간)\n시간대별로 유령이 더 많이 나타납니다. 23시에는 GHOST FRENZY!\n기존 최초 5마리 발견 기록은 유지됩니다. 처음 5마리 발견 기록은 이 기기에 저장됩니다. 실제 계정 배지 및 Rapid 지급은 아직 연동되지 않았습니다.');
const spots=[0,1,2,3,4];
const ghosts=new Set();const pending=new Set();let timer;
function placeGhost(btn){
 const pageHeight=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight,window.innerHeight);
 const width=Math.max(100,field.clientWidth||window.innerWidth);
 const maxX=Math.max(8,width-46),maxY=Math.max(120,pageHeight-55);
 // Spread ghosts across the entire Hub document, not just the top event strip.
 btn.style.left=Math.round(8+Math.random()*Math.max(0,maxX-8))+'px';
 btn.style.top=Math.round(Math.min(maxY,120)+Math.random()*Math.max(0,maxY-120))+'px';
}

function makeGhost(initialIndex){
 if(!active()||ghosts.size>=config().count)return;
 if(initialIndex!=null)pending.add(initialIndex);
 const btn=document.createElement('button');btn.type='button';btn.className='fw-hw-ghost';btn.textContent='👻';btn.setAttribute('aria-label','유령 잡기');
 if(initialIndex!=null)btn.dataset.discovery=String(initialIndex);
 btn.onclick=()=>{if(!active()||!ghosts.has(btn))return;ghosts.delete(btn);btn.remove();if(initialIndex!=null)pending.delete(initialIndex);state.caught++;if(initialIndex!=null&&!state.found.includes(initialIndex)){state.found.push(initialIndex);if(state.found.length===5){state.badge=true;alert('🎃 HALLOWEEN 2026 기념 기록 획득!');}}save();update();};
 field.append(btn);placeGhost(btn);ghosts.add(btn);
}
function replenish(){if(!active()){cleanup();return;}const c=config();while(ghosts.size>c.count){const b=ghosts.values().next().value;ghosts.delete(b);if(b.dataset.discovery!=null)pending.delete(Number(b.dataset.discovery));b.remove();}if(ghosts.size<c.count){const missing=spots.findIndex((_,i)=>!state.found.includes(i)&&!pending.has(i));makeGhost(missing<0?undefined:missing);}update();timer=setTimeout(replenish,c.delay);}
function cleanup(){clearTimeout(timer);ghosts.forEach(b=>b.remove());ghosts.clear();pending.clear();panel.remove();field.remove();style.remove();document.body.classList.remove('fw-halloween-active');}
spots.forEach((_,i)=>{if(!state.found.includes(i))makeGhost(i);});
replenish();
return cleanup;
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSeason();});
window.addEventListener('pageshow',syncSeason);
window.addEventListener('pagehide',()=>{clearTimeout(boundaryTimer);if(stopSession){stopSession();stopSession=null;}});
syncSeason();
})();
