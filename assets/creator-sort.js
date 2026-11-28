import "./id-core.js";
import {getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,set,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const app=getApps()[0],auth=getAuth(app),db=getDatabase(app);
const path=ref(db,"hubCreatorSort");
const projects=window.FormwheelHubProjects||[];
const names=projects.map(p=>p.name);
// Editorial priorities; not measured popularity. Remaining projects retain their relative order.
const baseline=["PVP","Polyrhythm","Clicker","AFTERBEAT","Optical Chaos","Reflex","RULETORY","CITY TYCOON","LOOP","Battle","Party","Glitch","Maze","Sudoku","Paint"];
const optimize=arr=>clean([...baseline,...arr.filter(n=>n!=="Duck"),...names.filter(n=>n!=="Duck"),"Duck"]);
const clean=arr=>[...new Set((Array.isArray(arr)?arr:[]).filter(name=>names.includes(name)))];
window.FormwheelCreatorSort={order:optimize(names)};
const refresh=()=>window.dispatchEvent(new Event("formwheel-creator-sort-updated"));
let pending=[],editing=false;
const sort=document.getElementById("sort");
const section=document.createElement("section");section.style.cssText="margin:8px 0;font-size:13px";
const toggle=document.createElement("button");toggle.type="button";toggle.textContent="🔐 제작자 추천 순서 관리";toggle.style.cssText="cursor:pointer;border:0;background:transparent;color:#6250c7;text-decoration:underline;padding:5px";
const panel=document.createElement("div");panel.hidden=true;panel.style.cssText="padding:14px;background:#faf9ff;border:1px solid #dad4ee;border-radius:12px;max-width:440px";
const form=document.createElement("form");
const code=document.createElement("input");code.type="password";code.required=true;code.placeholder="확인 코드";code.autocomplete="off";code.style.cssText="padding:9px;border:1px solid #ccc;border-radius:8px";
const submit=document.createElement("button");submit.textContent="열기";submit.style.marginLeft="8px";
const status=document.createElement("p");status.setAttribute("role","status");
const editor=document.createElement("div");editor.hidden=true;
const rows=document.createElement("div");rows.style.cssText="max-height:380px;overflow:auto";
const save=document.createElement("button");save.type="button";save.textContent="추천 순서 저장";save.style.cssText="margin-top:12px;padding:10px;border:0;border-radius:9px;background:#6250c7;color:white";
form.append(code,submit);editor.append(rows,save);panel.append(form,status,editor);section.append(toggle,panel);sort?.insertAdjacentElement("afterend",section);
toggle.onclick=()=>{panel.hidden=!panel.hidden;};
const style=document.createElement("style");
style.textContent=`
.fw-sort-admin{--sort-accent:#7561d9;--sort-line:color-mix(in srgb,currentColor 15%,transparent);color:inherit}
.fw-sort-admin button{font:inherit;cursor:pointer}
.fw-sort-admin button:disabled{opacity:.35;cursor:default}
.fw-sort-admin .sort-row{display:flex;align-items:center;gap:8px;padding:8px;margin:5px 0;border:1px solid var(--sort-line);border-radius:12px;background:color-mix(in srgb,currentColor 4%,transparent)}
.fw-sort-admin .sort-row.is-moving{outline:2px solid var(--sort-accent);background:color-mix(in srgb,var(--sort-accent) 15%,transparent)}
.fw-sort-admin .sort-handle,.fw-sort-admin .sort-arrow{display:grid;place-items:center;min-width:36px;min-height:36px;border:1px solid var(--sort-line);border-radius:8px;background:transparent;color:inherit}
.fw-sort-admin .sort-handle{cursor:grab;touch-action:none;user-select:none;font-size:20px}
.fw-sort-admin .sort-handle:active{cursor:grabbing}
.fw-sort-admin .sort-rank{font-variant-numeric:tabular-nums;opacity:.65;min-width:2ch;text-align:center}
.fw-sort-admin .sort-name{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:600}
.fw-sort-admin .sort-help{font-size:12px;opacity:.8;margin:6px 0 10px}
`;
document.head.append(style);
section.classList.add("fw-sort-admin");
toggle.style.cssText="cursor:pointer;border:1px solid var(--sort-line);background:transparent;color:inherit;border-radius:10px;padding:9px 12px;font-weight:600";
toggle.setAttribute("aria-expanded","false");
toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute("aria-expanded",String(!panel.hidden));};
panel.style.cssText="padding:14px;border:1px solid var(--sort-line);border-radius:14px;max-width:480px;box-sizing:border-box;margin-top:8px;background:color-mix(in srgb,currentColor 3%,transparent)";
rows.style.cssText="max-height:min(55vh,440px);overflow:auto;overscroll-behavior:contain;padding:3px";
save.style.cssText="margin-top:12px;padding:12px;width:100%;border:0;border-radius:10px;background:#6250c7;color:white;font-weight:700";
const auto=document.createElement("button");auto.type="button";auto.textContent="✨ 추천 순서 자동 최적화";auto.style.cssText="width:100%;padding:10px;border:1px solid var(--sort-line);border-radius:10px;background:transparent;color:inherit;font-weight:700;margin-bottom:6px";
const undo=document.createElement("button");undo.type="button";undo.textContent="↶ 최적화 취소";undo.hidden=true;undo.style.cssText="padding:8px;border:1px solid var(--sort-line);border-radius:8px;background:transparent;color:inherit;margin-bottom:6px";
let beforeOptimize=null;
auto.onclick=()=>{if(!editing||save.disabled)return;beforeOptimize=[...pending];pending=optimize(pending);undo.hidden=false;paint();status.textContent="추천 순서 최적화 완료 · 확인 후 저장하세요."};
undo.onclick=()=>{if(!editing||save.disabled||!beforeOptimize)return;pending=beforeOptimize;beforeOptimize=null;undo.hidden=true;paint();status.textContent="최적화 전 순서로 복원했습니다."};
editor.prepend(auto,undo);
const help=document.createElement("p");help.className="sort-help";help.textContent="☰ 손잡이를 잡고 이동하거나 화살표로 순서를 변경하세요.";editor.prepend(help);
function paint(){
 if(!editing)return;
 pending=clean([...pending,...names]);rows.replaceChildren();
 pending.forEach((name,i)=>{
  const row=document.createElement("div");row.className="sort-row";row.dataset.name=name;
  const rank=document.createElement("span");rank.className="sort-rank";rank.textContent=i+1;
  const label=document.createElement("span");label.className="sort-name";label.textContent=name;
  const handle=document.createElement("button");handle.type="button";handle.className="sort-handle";handle.textContent="☰";handle.setAttribute("aria-label",name+" 순서 이동 손잡이");
  handle.onpointerdown=e=>{
   if(e.button!==0||!e.isPrimary||save.disabled)return;
   e.preventDefault();rows.setPointerCapture(e.pointerId);row.classList.add("is-moving");
   const original=[...pending];let frame=0,lastY=e.clientY;
   const move=()=>{
    const rect=rows.getBoundingClientRect();if(lastY<rect.top+35)rows.scrollTop-=10;else if(lastY>rect.bottom-35)rows.scrollTop+=10;
    const others=[...rows.children].filter(el=>el!==row);
    const target=others.find(el=>lastY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);
    if(target){if(row.nextElementSibling!==target)rows.insertBefore(row,target);}else if(rows.lastElementChild!==row)rows.append(row);
    pending=[...rows.children].map(el=>el.dataset.name);
    [...rows.children].forEach((el,j)=>el.querySelector(".sort-rank").textContent=j+1);
    frame=requestAnimationFrame(move);
   };
   const onmove=ev=>{lastY=ev.clientY;};
   const finish=ev=>{cancelAnimationFrame(frame);rows.removeEventListener("pointermove",onmove);rows.removeEventListener("pointerup",finish);rows.removeEventListener("pointercancel",finish);rows.removeEventListener("lostpointercapture",finish);if(ev.type!=="pointerup")pending=original;paint();};
   rows.addEventListener("pointermove",onmove);rows.addEventListener("pointerup",finish);rows.addEventListener("pointercancel",finish);rows.addEventListener("lostpointercapture",finish);frame=requestAnimationFrame(move);
  };
  const button=(symbol,dir)=>{const b=document.createElement("button");b.type="button";b.className="sort-arrow";b.textContent=symbol;b.setAttribute("aria-label",name+(dir<0?" 위로":" 아래로"));b.disabled=i+dir<0||i+dir>=pending.length;b.onclick=()=>{if(save.disabled)return;const j=i+dir;[pending[i],pending[j]]=[pending[j],pending[i]];paint();};return b};
  row.append(handle,rank,label,button("↑",-1),button("↓",1));rows.append(row);
 });
}
onValue(path,snapshot=>{const order=snapshot.val()?.order;if(Array.isArray(order)){window.FormwheelCreatorSort.order=clean([...order,...names]);refresh();if(!editing)pending=window.FormwheelCreatorSort.order;}},()=>{status.textContent="공유 추천 순서를 불러올 수 없어 기본값으로 표시합니다."});
form.onsubmit=async event=>{
 event.preventDefault();
 const input=new TextEncoder().encode(code.value);
 const digest=await crypto.subtle.digest("SHA-256",input);
 const hex=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
 code.value="";
 if(hex!=="6c8c626e6d2f42073863a898d5f147fce34e00f48b2adc0b2abc0368e2b2deaa"){status.textContent="확인 코드가 올바르지 않습니다.";return;}
 try{
  const user=auth.currentUser?.email?.toLowerCase()==="not404spam@gmail.com"?auth.currentUser:(await signInWithPopup(auth,new GoogleAuthProvider())).user;
  if(user.email?.toLowerCase()!=="not404spam@gmail.com"||!user.emailVerified){status.textContent="제작자 계정 인증이 필요합니다.";return;}
  editing=true;beforeOptimize=null;undo.hidden=true;pending=[...window.FormwheelCreatorSort.order];editor.hidden=false;form.hidden=true;status.textContent="손잡이 또는 화살표로 순서를 조정한 다음 저장하세요.";paint();
 }catch(error){status.textContent="로그인 실패: "+(error.code||"알 수 없는 오류");}
};
save.onclick=async()=>{
 save.disabled=true;status.textContent="저장 중…";
 try{await set(path,{order:pending,updatedAt:serverTimestamp()});beforeOptimize=null;undo.hidden=true;status.textContent="추천 순서 저장 완료!";}
 catch(error){status.textContent="저장 실패: "+(error.code||"Firebase 권한 오류")+" · 데이터베이스 규칙 배포 상태를 확인하세요.";}
 finally{save.disabled=false;}
};
