/* Formwheel Hub first-visit walkthrough — no account required. */
(()=>{"use strict";
const STORAGE_KEY="fw-hub-tour-v1";
const steps=[
 {title:"🎡 Formwheel에 오신 걸 환영해요!",description:"게임과 유용한 도구를 한곳에서 즐길 수 있어요. 계정 없이도 여러 프로젝트를 둘러볼 수 있습니다.",selector:"header"},
 {title:"🌀 바로 혼자 플레이",description:"무슨 게임을 할지 모르겠다면 혼자 플레이! 두구두구 연출 후 무작위 게임으로 이동해요. 스킵도 가능해요.",selector:"#fw-nav-solo"},
 {title:"✨ 나를 위한 추천",description:"오늘의 추천에서 새로운 프로젝트나 익숙한 프로젝트를 만나보세요. 추천 제외 설정도 할 수 있어요.",selector:"#fw-recommended-cards"},
 {title:"🔎 원하는 프로젝트 찾기",description:"검색과 게임·도구·앱 필터로 원하는 프로젝트를 골라보세요.",selector:"#projects"},
 {title:"⚔️ 친구와 함께",description:"빠른 대전이나 랜덤 플레이를 선택해 친구 또는 다른 사람과 게임을 즐겨보세요.",selector:"#fw-nav-quick"}
];
const style=document.createElement("style");
style.textContent=`.fw-tour-overlay{position:fixed;inset:0;background:rgba(9,14,35,.78);z-index:110000;display:grid;place-items:center;padding:16px;box-sizing:border-box}.fw-tour-overlay[hidden]{display:none!important}.fw-tour-panel{width:min(420px,100%);box-sizing:border-box;background:#fff;color:#242b40;border-radius:20px;padding:25px 23px;box-shadow:0 22px 80px #0007}.fw-tour-panel h2{font-size:21px;margin:8px 0 10px}.fw-tour-panel p{line-height:1.7;font-size:14px;color:#565e73}.fw-tour-counter{font-size:12px;font-weight:700;color:#5652a9}.fw-tour-buttons{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;margin-top:18px}.fw-tour-buttons button{border:1px solid #d9deef;border-radius:10px;padding:10px 14px;font:inherit;cursor:pointer;background:#f4f5fa;color:#27304a}.fw-tour-buttons .fw-tour-next{background:#393cb9;color:white;border-color:#393cb9;font-weight:750}.fw-tour-buttons button:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}.fw-tour-replay{margin:8px auto;display:block;border:0;background:transparent;color:#555ec5;text-decoration:underline;cursor:pointer;font-size:12px}`;
document.head.appendChild(style);
const overlay=document.createElement("div");
overlay.className="fw-tour-overlay";overlay.hidden=true;
overlay.innerHTML='<section class="fw-tour-panel" role="dialog" aria-modal="true" aria-labelledby="fw-tour-title"><div class="fw-tour-counter" aria-live="polite"></div><h2 id="fw-tour-title"></h2><p id="fw-tour-description"></p><div class="fw-tour-buttons"><button type="button" data-action="skip">건너뛰기</button><button type="button" data-action="prev">이전</button><button type="button" data-action="next" class="fw-tour-next">다음 →</button></div></section>';
document.body.appendChild(overlay);
let index=0,returnFocus=null;
const get=q=>overlay.querySelector(q);
function render(){const step=steps[index];get(".fw-tour-counter").textContent=`${index+1} / ${steps.length}`;get("#fw-tour-title").textContent=step.title;get("#fw-tour-description").textContent=step.description;get('[data-action="prev"]').hidden=index===0;get('[data-action="next"]').textContent=index===steps.length-1?"시작하기 ✓":"다음 →";}
function finish(){overlay.hidden=true;try{localStorage.setItem(STORAGE_KEY,"done")}catch{}if(returnFocus?.isConnected)returnFocus.focus();}
function start(){if(!overlay.hidden)return;returnFocus=document.activeElement;index=0;render();overlay.hidden=false;get('[data-action="next"]').focus();}
overlay.addEventListener("click",e=>{const action=e.target.closest("button")?.dataset.action;if(action==="skip")finish();else if(action==="prev"){index=Math.max(0,index-1);render()}else if(action==="next"){if(index===steps.length-1)finish();else{index++;render()}}});
overlay.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();finish()}if(e.key==="Tab"){const buttons=[...overlay.querySelectorAll("button")].filter(b=>!b.hidden);const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const replay=document.createElement("button");replay.type="button";replay.className="fw-tour-replay";replay.textContent="❔ Hub 사용법 다시 보기";replay.addEventListener("click",start);
(document.querySelector("#projects")||document.querySelector("main")||document.body).before(replay);
let done=false;try{done=localStorage.getItem(STORAGE_KEY)==="done"}catch{}
if(!done){window.addEventListener("load",()=>setTimeout(()=>{if(!document.hidden&&document.querySelector("#fw-nav-solo"))start()},1500),{once:true})}
window.fwStartHubTour=start;
})();
