/* Guided Hub tour: spotlight the actual controls, with skip and replay. */
(()=>{"use strict";
const KEY="fw-hub-tour-v1";
const steps=[
 {selector:'.fw-bet',title:'🃏 카드·간편 화면',desc:'상단에서 카드 Ver.와 간편 Ver.를 바꿀 수 있어요. 원하는 화면으로 프로젝트를 둘러보세요!'},
 {selector:'#fw-nav-solo',title:'🌀 혼자 플레이',desc:'무엇을 할지 고민된다면 혼자 플레이로 랜덤 게임을 찾아보세요.'},
 {selector:'#fw-nav-quick',title:'⚔️ 빠른 대전',desc:'상대와 온라인 대전을 시작하는 바로가기예요.'},
 {selector:'#fw-nav-friend',title:'🎲 랜덤 플레이',desc:'친구와 함께할 게임을 무작위로 고를 수 있어요.'},
 {selector:'#fw-quick-picks',title:'✨ 지금 뭐 하지?',desc:'추천 프로젝트를 빠르게 열거나 다른 추천을 받아 보세요.'},
 {selector:'#search',title:'🔎 이름·기능 검색',desc:'프로젝트 이름뿐 아니라 기능이나 키워드도 검색해 보세요.'},
 {selector:'.filterButton[data-filter="game"]',title:'🎮 게임·도구·앱',desc:'전체, 게임, 도구, 앱 중 원하는 종류만 골라 볼 수 있어요.'},
 {selector:'#fw-filter-toggle',title:'⚙️ 상세 필터',desc:'플레이 방식과 조건을 더 세밀하게 설정할 수 있어요.'},
 {selector:'#fw-favorites-toggle',title:'📌 즐겨찾기 고정',desc:'자주 찾는 프로젝트를 선택해 목록 위쪽에 고정할 수 있어요.'}
];
const css=document.createElement("style");
css.textContent=`
.fw-tour-overlay{position:fixed;inset:0;z-index:110000;pointer-events:auto}
.fw-tour-overlay[hidden]{display:none!important}
.fw-tour-highlight{position:fixed;z-index:1;box-shadow:0 0 0 9999px rgba(9,14,35,.78),0 0 0 4px #ffcd62,0 0 25px 7px #ffcd6270;border-radius:13px;pointer-events:none;transition:top .18s,left .18s,width .18s,height .18s}
.fw-tour-panel{position:fixed;z-index:2;width:min(390px,calc(100vw - 28px));max-height:calc(100dvh - 20px);overflow:auto;box-sizing:border-box;background:#fff;color:#242b40;border-radius:18px;padding:21px;box-shadow:0 18px 65px #0009}
.fw-tour-panel h2{font-size:20px;margin:9px 0}.fw-tour-panel p{line-height:1.6;font-size:14px;color:#565e73;margin:8px 0}
.fw-tour-counter{font-size:12px;font-weight:700;color:#5652a9}
.fw-tour-buttons{display:flex;gap:7px;justify-content:space-between;margin-top:16px;flex-wrap:wrap}
.fw-tour-buttons button{border:1px solid #d9deef;border-radius:10px;padding:10px 12px;font:inherit;cursor:pointer;background:#f4f5fa;color:#27304a}
.fw-tour-buttons button[hidden]{display:none!important}.fw-tour-buttons .fw-tour-next{background:#393cb9;color:#fff;border-color:#393cb9;font-weight:750}
.fw-tour-buttons button:focus-visible,.fw-tour-replay:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}
.fw-tour-replay{margin:8px auto;display:block;border:0;background:transparent;color:#555ec5;text-decoration:underline;cursor:pointer;font-size:12px}
@media(prefers-reduced-motion:reduce){.fw-tour-highlight{transition:none}}
`;
document.head.appendChild(css);
const overlay=document.createElement("div");overlay.className="fw-tour-overlay";overlay.hidden=true;
overlay.innerHTML='<div class="fw-tour-highlight" aria-hidden="true"></div><section class="fw-tour-panel" role="dialog" aria-modal="true" aria-labelledby="fw-tour-title"><div class="fw-tour-counter" aria-live="polite"></div><h2 id="fw-tour-title"></h2><p id="fw-tour-description"></p><div class="fw-tour-buttons"><button type="button" data-action="skip">건너뛰기</button><button type="button" data-action="prev">이전</button><button type="button" data-action="next" class="fw-tour-next">다음 →</button></div></section>';
document.body.appendChild(overlay);
const q=s=>overlay.querySelector(s);let index=0,returnFocus=null,frame=0;
function position(){
 if(overlay.hidden)return;
 const target=document.querySelector(steps[index].selector),highlight=q(".fw-tour-highlight"),panel=q(".fw-tour-panel");
 if(!target||!target.getClientRects().length){highlight.style.display="none";panel.style.left="14px";panel.style.top=Math.max(10,(innerHeight-panel.offsetHeight)/2)+"px";return}
 const r=target.getBoundingClientRect(),pad=5;
 highlight.style.display="block";highlight.style.left=Math.max(0,r.left-pad)+"px";highlight.style.top=Math.max(0,r.top-pad)+"px";highlight.style.width=Math.min(innerWidth-Math.max(0,r.left-pad),r.width+pad*2)+"px";highlight.style.height=Math.min(innerHeight-Math.max(0,r.top-pad),r.height+pad*2)+"px";
 const pw=panel.offsetWidth,ph=panel.offsetHeight,gap=19;
 const below=r.bottom+gap,above=r.top-ph-gap;
 let top=below+ph<=innerHeight-10?below:above>=10?above:Math.max(10,Math.min(innerHeight-ph-10,below));
 panel.style.top=top+"px";panel.style.left=Math.max(14,Math.min(innerWidth-pw-14,r.left+(r.width-pw)/2))+"px";
}
function render(){
 const step=steps[index];q(".fw-tour-counter").textContent=(index+1)+" / "+steps.length;q("#fw-tour-title").textContent=step.title;q("#fw-tour-description").textContent=step.desc;
 q('[data-action="prev"]').hidden=index===0;q('[data-action="next"]').textContent=index===steps.length-1?"완료 ✓":"다음 →";
 const target=document.querySelector(step.selector);if(target&&target.getClientRects().length)target.scrollIntoView({block:"center",behavior:"instant"});
 cancelAnimationFrame(frame);frame=requestAnimationFrame(position);
}
function finish(){overlay.hidden=true;cancelAnimationFrame(frame);try{localStorage.setItem(KEY,"done")}catch{}if(returnFocus?.isConnected)returnFocus.focus()}
function start(){if(!overlay.hidden)return;returnFocus=document.activeElement;index=0;overlay.hidden=false;render();q('[data-action="next"]').focus()}
overlay.addEventListener("click",e=>{const action=e.target.closest("button")?.dataset.action;if(action==="skip")finish();else if(action==="prev"){index=Math.max(0,index-1);render()}else if(action==="next"){if(index===steps.length-1)finish();else{index++;render()}}});
overlay.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();finish()}if(e.key==="Tab"){const buttons=[...overlay.querySelectorAll("button")].filter(b=>!b.hidden);const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
window.addEventListener("resize",position);window.addEventListener("scroll",position,true);
const replay=document.createElement("button");replay.type="button";replay.className="fw-tour-replay";replay.textContent="❔ Hub 튜토리얼 보기 (업데이트)";replay.addEventListener("click",start);
(document.querySelector("#projects")||document.querySelector("main")||document.body).before(replay);
// Opt-in only: the Hub tour starts exclusively when the user clicks its button.
window.fwStartHubTour=start;
})();
