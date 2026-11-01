/* ROAD TO 300 celebration: read-only visitor counter, no changes to Firebase totals. */
(()=>{
"use strict";
const KEY="fw:road300:celebrated:v1";
const style=document.createElement("style");
style.textContent=`
#fw-road300{box-sizing:border-box;max-width:850px;margin:14px auto;padding:14px 16px;border-radius:16px;border:1px solid #cfbaff;background:linear-gradient(125deg,#f4ebff,#fff8e6);color:#35265c;box-shadow:0 7px 22px #6351a21b}
#fw-road300 strong{font-size:16px}#fw-road300 p{margin:6px 0;font-size:13px}#fw-road300-progress{height:10px;border-radius:30px;background:#ddd5f1;overflow:hidden;margin:9px 0}#fw-road300-fill{height:100%;width:0;background:linear-gradient(90deg,#8559e5,#ffae47);transition:width .5s}
#fw-road300[hidden]{display:none!important}#fw-road300-message{font-weight:700}#fw-road300-close{float:right;border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer}
@media(max-width:600px){#fw-road300{margin:12px 10px;padding:12px}}
`;
document.head.append(style);
const root=document.createElement("section");root.id="fw-road300";root.hidden=true;
root.setAttribute("aria-label","Formwheel 300명 기념 행사");
root.innerHTML='<button id="fw-road300-close" type="button" aria-label="기념 카드 닫기">×</button><strong id="fw-road300-title">🚀 ROAD TO 300</strong><p id="fw-road300-message"></p><div id="fw-road300-progress" role="progressbar" aria-label="300명 목표 달성률" aria-valuemin="0" aria-valuemax="300"><div id="fw-road300-fill"></div></div><p id="fw-road300-stats"></p><p id="fw-road300-award" hidden>🏅 한정 기념 업적 · ROAD TO 300 달성 목격자 (이 브라우저에 보관)</p>';
let dismissed=false,wasComplete=false;
root.querySelector("#fw-road300-close").onclick=()=>{dismissed=true;root.hidden=true};
function mount(){
 const counter=document.getElementById("fw-total-visitor-count");
 if(!counter)return false;
 const anchor=document.getElementById("fw-live-presence");
 if(anchor)anchor.insertAdjacentElement("afterend",root);
 else (document.querySelector("main")||document.body).prepend(root);
 let last=-1;
 const update=()=>{
  const raw=(counter.textContent||"").replace(/,/g,"");
  const match=raw.match(/\d+/);if(!match)return;
  const total=Number(match[0]);if(!Number.isSafeInteger(total)||total<0||total===last)return;last=total;
  const complete=total>=300;
  if(complete&&!wasComplete){
    try{localStorage.setItem(KEY,JSON.stringify({observedAt:new Date().toISOString(),threshold:300}))}catch{}
  }
  wasComplete=complete;
  root.hidden=dismissed&&!complete;
  if(complete&&dismissed)return;
  root.querySelector("#fw-road300-title").textContent=complete?"🎉 FORMWHEEL 300명 달성!":"🚀 ROAD TO 300 · 카운트다운";
  root.querySelector("#fw-road300-message").textContent=complete?"300명 달성! 함께해 준 모든 방문자에게 감사합니다!":"300명 달성까지 "+(300-total)+"명 남았어요!";
  root.querySelector("#fw-road300-stats").textContent="📈 누적 방문자 "+total.toLocaleString("ko-KR")+"명 · 달성률 "+Math.min(100,total/3).toFixed(1)+"%";
  root.querySelector("#fw-road300-fill").style.width=Math.min(100,total/3)+"%";
  root.querySelector("#fw-road300-progress").setAttribute("aria-valuenow",String(Math.min(300,total)));
  root.querySelector("#fw-road300-award").hidden=!complete;
 };
 new MutationObserver(update).observe(counter,{childList:true,subtree:true,characterData:true});
 update();return true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{if(!mount()){const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect()});watcher.observe(document.body,{subtree:true,childList:true})}},{once:true});
else mount();
})();
