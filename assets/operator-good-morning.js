/* Operator-only Good Morning Formwheel. Read-only and local to the current browser. */
import {getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
const APP=getApps().find(app=>app.name==="[DEFAULT]");
if(APP){
 const auth=getAuth(APP);
 let generation=0,observer=null;
 const kstParts=()=>{const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23"}).formatToParts(new Date());const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));return {date:v.year+"-"+v.month+"-"+v.day,hour:Number(v.hour)}};
 const currentTotal=()=>{const t=document.getElementById("fw-total-visitor-count")?.textContent||"";if(!/^\s*[\d,]+명?\s*$/.test(t))return null;const n=Number(t.replace(/[^\d]/g,""));return Number.isSafeInteger(n)&&n>0?n:null};
 const launch=(user,token)=>{
  if(observer)observer.disconnect();
  const key="fw:operator:morning:v1:"+user.uid;
  const refresh=()=>{
   if(auth.currentUser?.uid!==user.uid)return;
   const total=currentTotal();if(total===null)return;
   const now=Date.now(),kst=kstParts();
   let previous=null;
   try{previous=JSON.parse(localStorage.getItem(key)||"null")}catch{}
   const valid=previous&&Number.isSafeInteger(previous.count)&&Number.isFinite(previous.at);
   // A morning check after a long gap; do not confuse it with daily-new users.
   const awake=valid&&kst.hour>=5&&kst.hour<12&&now-previous.at>=6*3600000&&
    previous.date!==kst.date&&previous.count<=total;
   const gained=awake?total-previous.count:0;
   if(awake&&gained>0&&!sessionStorage.getItem(key+":"+kst.date)){
    sessionStorage.setItem(key+":"+kst.date,"1");
    document.getElementById("fw-operator-good-morning")?.remove();
    const card=document.createElement("aside");card.id="fw-operator-good-morning";card.setAttribute("role","status");
    card.style.cssText="position:fixed;z-index:10020;bottom:18px;right:14px;max-width:min(360px,calc(100vw - 28px));padding:15px 17px;border-radius:16px;border:1px solid #b9a9f4;background:#f5f0ff;color:#352461;box-shadow:0 10px 26px #25134a35;font:600 14px/1.55 system-ui";
    const title=document.createElement("strong");title.textContent="🌅 굿모닝 Formwheel!";title.style.fontSize="16px";
    const message=document.createElement("p");message.style.margin="7px 0";message.textContent="지난 확인 이후 방문자 +"+gained.toLocaleString("ko-KR")+"명! 🚀 누적 "+total.toLocaleString("ko-KR")+"명";
    const note=document.createElement("small");note.textContent=gained>=50?"🏆 자고 일어났더니 대박남 · 기념 업적 달성!":"🌙 운영자가 쉬는 동안에도 Formwheel은 성장 중!";
    const close=document.createElement("button");close.type="button";close.textContent="닫기";close.setAttribute("aria-label","굿모닝 알림 닫기");close.style.cssText="float:right;border:1px solid #b5a1e5;background:white;border-radius:8px;padding:3px 8px;cursor:pointer";close.onclick=()=>card.remove();
    card.append(close,title,message,note);document.body.append(card);
    if(gained>=50){try{localStorage.setItem("fw:operator:overnight50:v1:"+user.uid,JSON.stringify({earnedAt:now,from:previous.count,to:total,gained}))}catch{}}
   }
   // Save the observed public total for the next morning; don't overwrite it repeatedly in one session.
   if(!valid||previous.date!==kst.date||now-previous.at>30*60000){
    try{localStorage.setItem(key,JSON.stringify({at:now,count:total,date:kst.date}))}catch{}
   }
  };
  refresh();
  const counter=document.getElementById("fw-total-visitor-count");
  if(counter){observer=new MutationObserver(refresh);observer.observe(counter,{childList:true,subtree:true,characterData:true})}
 };
 onAuthStateChanged(auth,async user=>{
  const id=++generation;
  observer?.disconnect();observer=null;
  document.getElementById("fw-operator-good-morning")?.remove();
  if(!user||user.isAnonymous)return;
  try{
   const claims=(await user.getIdTokenResult()).claims;
   if(id!==generation||!claims||claims.admin!==true)return;
   launch(user);
  }catch(error){console.debug("Good morning: admin check unavailable",error?.code||error)}
 });
}
