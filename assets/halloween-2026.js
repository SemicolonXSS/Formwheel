/* Formwheel Haunted Night 2026 — isolated, reversible seasonal layer. */
(()=>{'use strict';
const START=Date.parse('2026-10-30T15:00:00Z'), END=Date.parse('2026-10-31T15:00:00Z');
const KEY='fw-halloween-2026-v1', BADGE='HALLOWEEN 2026';
const active=()=>Date.now()>=START&&Date.now()<END;
if(!active())return;
let state={found:[],badge:false};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(Array.isArray(saved.found))state.found=[...new Set(saved.found.filter(n=>Number.isInteger(n)&&n>=0&&n<5))];state.badge=!!saved.badge;}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
const style=document.createElement('style');style.textContent=`
#fw-halloween{position:relative;z-index:5;max-width:860px;margin:14px auto;padding:18px;border:2px solid #fb923c;border-radius:20px;background:linear-gradient(135deg,#27133d,#542348);color:#fff;text-align:center;box-shadow:0 8px 30px #0003}
#fw-halloween h2{color:#ffcf80;margin:0 0 8px}#fw-halloween p{color:#fff;margin:8px}#fw-halloween button{background:#ffb347;color:#241329;border:0;border-radius:12px;padding:9px 14px;font-weight:800;cursor:pointer}
.fw-hw-ghost{position:fixed;z-index:9995;background:#251b3de8;color:#fff;border:2px solid #ffc778;border-radius:50%;width:46px;height:46px;cursor:pointer;font-size:25px;box-shadow:0 4px 15px #0005}
.fw-hw-ghost:focus-visible{outline:3px solid #fff;outline-offset:3px}
#fw-halloween-status{font-weight:750}body.fw-halloween-active{--fw-halloween-accent:#ffab49}
@media(prefers-reduced-motion:no-preference){#fw-halloween{animation:fw-hw-glow 4s ease-in-out infinite alternate}@keyframes fw-hw-glow{to{box-shadow:0 8px 32px #ff9d4570}}}
`;document.head.append(style);document.body.classList.add('fw-halloween-active');
const panel=document.createElement('section');panel.id='fw-halloween';panel.setAttribute('aria-label','할로윈 특별 이벤트');
panel.innerHTML='<h2>🎃 FORMWHEEL: HAUNTED NIGHT</h2><p>👻 숨은 유령 5마리를 찾아보세요! 10월 31일 하루 한정 이벤트</p><p id="fw-halloween-status" aria-live="polite"></p><p>🍬 찾은 유령은 이 기기에 기록됩니다. Rapid 지급은 계정 연동 전까지 보류됩니다.</p><button type="button" id="fw-hw-info">이벤트 안내</button>';
const main=document.querySelector('main');(main||document.body).prepend(panel);
const status=panel.querySelector('#fw-halloween-status');
const update=()=>{status.textContent=state.badge?'🏅 HALLOWEEN 2026 — 유령 5마리 발견 완료!':'👻 발견한 유령: '+state.found.length+'/5';};
update();
panel.querySelector('#fw-hw-info').onclick=()=>alert('이벤트: 2026년 10월 31일 00:00~24:00 (한국 시간)\\n유령 5마리를 찾아 한정 기념 기록을 남기세요.\\n기록은 현재 브라우저에 보관됩니다. 실제 계정 배지 및 Rapid 지급은 아직 연동되지 않았습니다.');
const spots=[[8,22],[84,32],[12,68],[77,76],[49,51]];
spots.forEach(([x,y],i)=>{if(state.found.includes(i))return;const btn=document.createElement('button');btn.type='button';btn.className='fw-hw-ghost';btn.textContent='👻';btn.setAttribute('aria-label','숨은 유령 '+(i+1)+' 발견');btn.style.left='clamp(6px, '+x+'vw, calc(100vw - 54px))';btn.style.top=y+'vh';btn.onclick=()=>{if(!active())return;state.found.push(i);if(state.found.length===5)state.badge=true;save();btn.remove();update();if(state.badge)alert('🎃 축하해요! HALLOWEEN 2026 기념 기록을 획득했어요!');};document.body.append(btn);});
})();
