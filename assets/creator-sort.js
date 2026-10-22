import "./id-core.js";
import {getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,set,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const app=getApps()[0],auth=getAuth(app),db=getDatabase(app);
const path=ref(db,"hubCreatorSort");
const projects=window.FormwheelHubProjects||[];
const names=projects.map(p=>p.name);
const baseline=["Cook","Battle","Reflex","Mix","Maze","Glitch","Quiz","Wheel","Clicker","Paint","Animation"];
const clean=arr=>[...new Set((Array.isArray(arr)?arr:[]).filter(name=>names.includes(name)))];
window.FormwheelCreatorSort={order:clean([...baseline,...names])};
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
function paint(){
 if(!editing)return;
 pending=clean([...pending,...names]);rows.replaceChildren();
 pending.forEach((name,i)=>{
  const row=document.createElement("div");row.style.cssText="display:flex;align-items:center;gap:7px;padding:5px;border-bottom:1px solid #ddd";
  const label=document.createElement("span");label.textContent=(i+1)+". "+name;label.style.flex="1";
  const button=(text,dir)=>{const b=document.createElement("button");b.type="button";b.textContent=text;b.disabled=i+dir<0||i+dir>=pending.length;b.onclick=()=>{const j=i+dir;[pending[i],pending[j]]=[pending[j],pending[i]];paint()};return b};
  row.append(label,button("↑",-1),button("↓",1));rows.append(row);
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
  editing=true;pending=[...window.FormwheelCreatorSort.order];editor.hidden=false;form.hidden=true;status.textContent="화살표로 순서를 조정한 다음 저장하세요.";paint();
 }catch(error){status.textContent="로그인 실패: "+(error.code||"알 수 없는 오류");}
};
save.onclick=async()=>{
 save.disabled=true;status.textContent="저장 중…";
 try{await set(path,{order:pending,updatedAt:serverTimestamp()});status.textContent="추천 순서 저장 완료!";}
 catch(error){status.textContent="저장 실패: "+(error.code||"Firebase 권한 오류")+" · 데이터베이스 규칙 배포 상태를 확인하세요.";}
 finally{save.disabled=false;}
};
