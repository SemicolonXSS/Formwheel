/* ROAD TO 300 celebration: read-only visitor counter, no changes to Firebase totals. */
(()=>{
"use strict";
const KEY="fw:road300:celebrated:v1";
const style=document.createElement("style");
style.textContent=`
#fw-road300{box-sizing:border-box;max-width:760px;margin:12px auto;padding:11px 14px;border-radius:16px;border:1px solid #cfbaff;background:linear-gradient(125deg,#f4ebff,#fff8e6);color:#35265c;box-shadow:0 7px 22px #6351a21b}
#fw-road300 strong{font-size:14px}#fw-road300 p{margin:5px 0;font-size:12px;line-height:1.5}#fw-road300-progress{height:10px;border-radius:30px;background:#ddd5f1;overflow:hidden;margin:9px 0}#fw-road300-fill{height:100%;width:0;background:linear-gradient(90deg,#8559e5,#ffae47);transition:width .5s}
#fw-road300[hidden]{display:none!important}#fw-road300-message{font-weight:700}#fw-road300-close{float:right;border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer}
@media(max-width:600px){#fw-road300{margin:10px 12px;padding:10px 12px}#fw-road300 strong{font-size:13px}}
#fw-road300-trip{margin-top:9px;padding-top:9px;border-top:1px solid #d9cdea}#fw-road300-trip-track{height:9px;border-radius:20px;background:#ded8ed;overflow:hidden;margin:6px 0}#fw-road300-trip-fill{height:100%;width:0;background:linear-gradient(90deg,#6843d9,#aa8cff);transition:width .4s}
`;
document.head.append(style);
const root=document.createElement("section");root.id="fw-road300";root.hidden=true;
root.setAttribute("aria-label","Formwheel 300명 기념 행사");
root.innerHTML='<button id="fw-road300-close" type="button" aria-label="기념 카드 닫기">×</button><strong id="fw-road300-title">🏆 ROAD TO 300 · COMPLETED</strong><p id="fw-road300-message"></p><p id="fw-road300-stats"></p><div id="fw-road300-progress" role="progressbar" aria-label="300명 달성 진행도" aria-valuemin="0" aria-valuemax="300"><div id="fw-road300-fill"></div></div><p id="fw-road300-award" hidden>🏅 300명 달성 목격 기록 보관 중</p><div id="fw-road300-trip"><strong>🚀 TRIP 2 1000</strong><p id="fw-trip-stats"></p><div id="fw-road300-trip-track" role="progressbar" aria-label="1000명 여행 진행도" aria-valuemin="0" aria-valuemax="1000"><div id="fw-road300-trip-fill"></div></div><p id="fw-trip-next"></p></div>';
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
  root.hidden=dismissed;
  if(dismissed)return;
  root.querySelector("#fw-road300-title").textContent=complete?"🏆 ROAD TO 300 · COMPLETED":"🚀 ROAD TO 300";
  root.querySelector("#fw-road300-message").textContent=complete?"🎉 300명 달성! 함께해 주셔서 감사합니다.":"목표까지 "+(300-total)+"명!";
  root.querySelector("#fw-road300-stats").textContent="📈 누적 방문자 "+total.toLocaleString("ko-KR")+"명 · 달성률 "+(total/3).toFixed(1)+"%";
  root.querySelector("#fw-road300-fill").style.width=Math.min(100,total/3)+"%";
  root.querySelector("#fw-road300-progress").setAttribute("aria-valuenow",String(Math.min(300,total)));
  root.querySelector("#fw-road300-award").hidden=!complete;
  root.querySelector("#fw-trip-stats").textContent=total.toLocaleString("ko-KR")+" / 1,000명 · "+(total/10).toFixed(1)+"%";
  root.querySelector("#fw-road300-trip-fill").style.width=Math.min(100,total/10)+"%";
  root.querySelector("#fw-road300-trip-track").setAttribute("aria-valuenow",String(Math.min(1000,total)));
  const next=[500,750,1000].find(n=>total<n);
  root.querySelector("#fw-trip-next").textContent=next?"🪐 다음 목적지 "+next.toLocaleString("ko-KR")+"명 · "+(next-total)+"명 남음":"👑 TRIP 2 1000 목표 달성!";
 };
 new MutationObserver(update).observe(counter,{childList:true,subtree:true,characterData:true});
 update();return true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{if(!mount()){const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect()});watcher.observe(document.body,{subtree:true,childList:true})}},{once:true});
else mount();
})();
