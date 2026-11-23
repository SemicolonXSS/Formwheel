/* Formwheel discovery and daily challenge: static, optional, no accounts or tracking. */
(()=>{'use strict';
const games=[
{name:'Reflex',url:'https://semicolonxss.github.io/Formwheel_Reflex/',tag:'반응 속도'},
{name:'Clicker',url:'https://semicolonxss.github.io/Formwheel_Clicker/',tag:'클릭'},
{name:'Cook',url:'https://semicolonxss.github.io/Formwheel_Cook/',tag:'요리'},
{name:'Polyrhythm',url:'https://semicolonxss.github.io/Formwheel/polyrhythm.html',tag:'리듬'},
{name:'Afterbeat',url:'https://semicolonxss.github.io/Formwheel/afterbeat.html',tag:'리듬'},
{name:'Maze',url:'https://semicolonxss.github.io/Formwheel_Maze/',tag:'미로'},
{name:'Grid',url:'https://semicolonxss.github.io/Formwheel/grid.html',tag:'퍼즐'},
{name:'Optical Chaos',url:'https://semicolonxss.github.io/Formwheel/optical-chaos.html',tag:'착시'},
{name:'LOOP',url:'https://semicolonxss.github.io/Formwheel/loop.html',tag:'음악'},
{name:'RULETORY',url:'https://semicolonxss.github.io/Formwheel_Ruletory/',tag:'전략'}
];
const utcDay=Math.floor(Date.now()/86400000);
const daily=games[(utcDay+3)%games.length];
const style=document.createElement('style');style.textContent=`
#fw-discovery{max-width:1050px;margin:22px auto;padding:20px;border-radius:22px;background:linear-gradient(135deg,#291b50,#16152c);border:1px solid #7552b0;color:#faf7ff;font:15px/1.55 system-ui,sans-serif;box-sizing:border-box}
#fw-discovery *{box-sizing:border-box}#fw-discovery h2{color:white;margin:0 0 8px;font-size:22px}#fw-discovery p{color:#d8ccec;margin:5px 0 12px}
#fw-discovery .fw-discovery-actions{display:flex;flex-wrap:wrap;gap:10px}
#fw-discovery a,#fw-discovery button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 15px;border-radius:12px;background:#d5b6ff;color:#221337;border:0;font:800 14px system-ui,sans-serif;text-decoration:none;cursor:pointer}
#fw-discovery .fw-secondary{background:#433268;color:#fff}#fw-discovery :is(a,button):focus-visible{outline:3px solid #ffd17d;outline-offset:3px}
`;document.head.appendChild(style);
function choose(exclude){const pool=games.filter(g=>!exclude||!location.href.startsWith(g.url));return pool[Math.floor(Math.random()*pool.length)]||games[0]}
function init(){
if(document.getElementById('fw-discovery'))return;
const wrap=document.createElement('section');wrap.id='fw-discovery';wrap.setAttribute('aria-label','오늘의 게임 도전과 추천');
const h=document.createElement('h2');h.textContent='🏆 오늘의 도전 · '+daily.name;
const p=document.createElement('p');p.textContent='오늘의 추천 게임은 '+daily.name+'! 친구와 기록을 비교하고 새로운 게임도 발견해 보세요. (매일 UTC 기준 변경)';
const actions=document.createElement('div');actions.className='fw-discovery-actions';
const play=document.createElement('a');play.textContent='🎮 오늘의 게임 플레이';play.href=daily.url+(daily.url.includes('?')?'&':'?')+'utm_source=formwheel_daily&utm_medium=discovery';
const random=document.createElement('button');random.type='button';random.textContent='🎲 랜덤 게임 추천';
const next=document.createElement('a');next.className='fw-secondary';next.textContent='✨ 다른 게임 보기';
const more=document.createElement('a');more.className='fw-secondary';more.textContent='🏆 도전 페이지';more.href='https://semicolonxss.github.io/Formwheel/daily-challenge.html';
function update(){const g=choose(true);next.href=g.url+(g.url.includes('?')?'&':'?')+'utm_source=formwheel_recommendation&utm_medium=discovery';next.textContent='✨ '+g.name+' 플레이'}
random.onclick=update;update();actions.append(play,random,next,more);wrap.append(h,p,actions);
const anchor=document.querySelector('main')||document.body;anchor.appendChild(wrap);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.FormwheelDiscovery={games,daily};
})();