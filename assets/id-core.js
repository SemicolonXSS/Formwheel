import {BADGES} from "./badge-catalog.js";
/* Formwheel ID/Core bridge for Hub. Firebase SDK v10 modules. */
import {initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,set,onValue,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app), db=getDatabase(app);
const home=window.FormwheelHubHome, status=document.getElementById("fw-id-status"), login=document.getElementById("fw-id-login"), logout=document.getElementById("fw-id-logout");
const show=t=>{if(status)status.textContent=t};
let uid=null,unsubscribe=null,applying=false,ready=false,previousUid=null,writeQueue=Promise.resolve();
const guestKey="fw:hub:guest:v1";
const readGuest=()=>{try{return JSON.parse(localStorage.getItem(guestKey))}catch{return null}};
const keepGuest=()=>{try{localStorage.setItem(guestKey,JSON.stringify(home.read()))}catch{}};
let activeAccount=false;
const clean=raw=>{
 const valid=new Set(homeIds());
 const ids=(list,max)=>[...new Set((Array.isArray(list)?list:[]).filter(x=>typeof x==="string"&&valid.has(x)))].slice(0,max);
 const visits={};Object.entries(raw?.visits||{}).forEach(([id,v])=>{if(!valid.has(id)||!v||typeof v!=="object")return;visits[id]={count:Math.max(0,Math.min(100000,Number(v.count)||0)),last:Math.max(0,Math.min(Date.now()+60000,Number(v.last)||0))}});
 return {version:1,pinned:ids(raw?.pinned,3),excluded:ids(raw?.excluded,100),visits};
};
function homeIds(){return (typeof projects==="undefined"?[]:projects).map(p=>p.name.toLowerCase())}
const path=userId=>ref(db,"formwheelV2/hubHomes/"+userId);
function merge(remote,local){
 const a=clean(remote),b=clean(local);
 const visits={...a.visits};
 for(const [id,v] of Object.entries(b.visits)){const old=visits[id];if(!old||v.last>old.last)visits[id]=v}
 return {version:1,pinned:a.pinned.length?a.pinned:b.pinned,excluded:[...new Set([...a.excluded,...b.excluded])],visits};
}
async function connect(user){
 if(!activeAccount)keepGuest();activeAccount=true;
 uid=user.uid;ready=false;
 login.hidden=true;logout.hidden=false;show("Formwheel ID 연결 중…");
 const thisUid=uid;
 try{
  const remote=(await get(path(uid))).val();
  if(thisUid!==uid)return;
  const local=home.read();
  // Existing account settings take precedence. Merge only when no cloud settings exist.
  const resolved=remote?clean(remote):clean(local);
  applying=true;home.apply(resolved);applying=false;
  if(!remote)await set(path(uid),resolved);
  if(thisUid!==uid)return;
  unsubscribe=onValue(path(uid),snapshot=>{
   if(thisUid!==uid)return;
   const next=snapshot.val();if(!next||applying)return;
   const remoteState=clean(next);
   if(JSON.stringify(home.read())!==JSON.stringify(remoteState)){applying=true;home.apply(remoteState);applying=false}
  },err=>show("동기화 읽기 오류: "+err.code));
  ready=true;show("Formwheel ID 로그인됨 · 홈 설정 동기화 활성");
 }catch(error){applying=false;show("로그인은 되었지만 설정 동기화 실패: "+(error.code||"네트워크 또는 Rules 오류"))}
}
window.addEventListener("fw:hub:changed",event=>{
 if(!ready||!uid||applying)return;
 const id=uid,next=clean(event.detail.state);
 writeQueue=writeQueue.then(async()=>{if(id!==uid)return;await set(path(id),next)}).catch(err=>show("저장 실패 · 로컬 설정은 유지됨: "+(err.code||"연결 오류")));
});

const headerAvatar=document.getElementById("fw-header-avatar");
const FRAME_STYLES={기본:"none",브론즈:"3px solid #b77b49",실버:"3px solid #a8b2c6",골드:"3px solid #e5b845",다이아:"3px solid #63c9e7"};
function syncAvatarFrame(user=auth.currentUser){
 if(!headerAvatar)return;
 const key="fw:badge:frame:"+(user&&!user.isAnonymous?user.uid:"guest");
 let chosen="기본";
 try{chosen=localStorage.getItem(key)||"기본"}catch{}
 headerAvatar.style.setProperty("border",FRAME_STYLES[chosen]||"none","important");
 headerAvatar.style.setProperty("outline",chosen==="기본"?"none":"2px solid transparent","important");
 headerAvatar.style.setProperty("background-clip","padding-box","important");
 headerAvatar.style.boxSizing="border-box";
 headerAvatar.dataset.badgeFrame=chosen in FRAME_STYLES?chosen:"기본";
}
window.addEventListener("pageshow",()=>syncAvatarFrame());
window.addEventListener("focus",()=>syncAvatarFrame());
window.addEventListener("fw:badge:frame-changed",()=>syncAvatarFrame());
document.addEventListener("visibilitychange",()=>{if(!document.hidden)syncAvatarFrame()});
window.addEventListener("storage",event=>{if(event.key?.startsWith("fw:badge:frame:"))syncAvatarFrame()});

const guestProfile=()=>{try{return JSON.parse(localStorage.getItem("fw:profile:guest:v1"))||{}}catch{return {}}};
let profileUnsubscribe=null,featuredUnsubscribe=null;
const headerFeatured=document.getElementById("fw-header-featured");
const aqsBadges={welcome:{icon:"👋",title:"첫 발걸음"},daily:{icon:"📅",title:"꾸준한 탐험가"},explorer:{icon:"🧭",title:"프로젝트 여행자"},secret:{icon:"🔮",title:"메아리의 발견"}};
let aqsFeaturedUnsubscribe=null,legacyFeaturedId="",aqsFeaturedId="";
function paintFeatured(){
 if(!headerFeatured)return;
 const legacy=BADGES.find(b=>b.id===legacyFeaturedId);
 const aqs=aqsBadges[aqsFeaturedId];
 const selected=aqs||legacy;
 headerFeatured.hidden=!selected;
 headerFeatured.textContent=selected?.icon||"";
 headerFeatured.title=selected?"대표 업적 · "+selected.title:"";
}
function syncFeatured(user){
 if(featuredUnsubscribe){featuredUnsubscribe();featuredUnsubscribe=null}
 if(aqsFeaturedUnsubscribe){aqsFeaturedUnsubscribe();aqsFeaturedUnsubscribe=null}
 legacyFeaturedId="";aqsFeaturedId="";
 if(!headerFeatured)return;
 const local=(()=>{try{return JSON.parse(localStorage.getItem("formwheel.aqs.v1"))}catch{return null}})();
 if(!user||user.isAnonymous){aqsFeaturedId=local?.unlocked?.[local?.featuredId]?local.featuredId:"";paintFeatured();return}
 paintFeatured();
 featuredUnsubscribe=onValue(ref(db,"formwheelV2/featuredBadges/"+user.uid),snap=>{legacyFeaturedId=snap.val()||"";paintFeatured()},()=>{legacyFeaturedId="";paintFeatured()});
 aqsFeaturedUnsubscribe=onValue(ref(db,"aqs/v1/users/"+user.uid),snap=>{
  const data=snap.val();
  aqsFeaturedId=data?.unlocked?.[data.featuredId]?data.featuredId:"";
  paintFeatured();
 },()=>{aqsFeaturedId=local?.unlocked?.[local?.featuredId]?local.featuredId:"";paintFeatured()});
}
window.addEventListener("storage",event=>{if(event.key!=="formwheel.aqs.v1")return;if(auth.currentUser&&!auth.currentUser.isAnonymous)return;syncFeatured(auth.currentUser)});

function syncProfile(user){
 if(profileUnsubscribe){profileUnsubscribe();profileUnsubscribe=null}
 const display=p=>{if(!headerAvatar)return;const icon=["🎡","🎮","🦊","🐱","🚀","🌟","🎲","👑"].includes(p?.icon)?p.icon:"🎡";const color=/^#[0-9a-f]{6}$/i.test(p?.color||"")?p.color:"#6366f1";headerAvatar.textContent=icon;headerAvatar.style.backgroundColor=color;};
 if(!user||user.isAnonymous){display(guestProfile());return}
 profileUnsubscribe=onValue(ref(db,"formwheelV2/hubProfiles/"+user.uid),snap=>display(snap.val()),()=>display({}));
}
onAuthStateChanged(auth,user=>{
 syncProfile(user);
 syncFeatured(user);
 syncAvatarFrame(user);
 if(unsubscribe){unsubscribe();unsubscribe=null}ready=false;uid=null;
 if(!user||user.isAnonymous){if(activeAccount){applying=true;home.apply(readGuest()||{pinned:[],excluded:[],visits:{}});applying=false;activeAccount=false}login.hidden=false;logout.hidden=true;show(user?.isAnonymous?"게스트 모드 · 기기에만 저장":"로그인하면 다른 기기와 홈 설정이 동기화돼요.");return}
 connect(user);
});
login?.addEventListener("click",async()=>{
 try{await signInWithPopup(auth,new GoogleAuthProvider())}
 catch(e){
  if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment"].includes(e.code)){show("로그인 페이지로 이동합니다.");await signInWithRedirect(auth,new GoogleAuthProvider())}
  else show("로그인 실패: "+(e.code||"다시 시도해 주세요"));
 }
});
logout?.addEventListener("click",async()=>{
 try{await signOut(auth);show("로그아웃했어요.")}catch(e){show("로그아웃 실패: "+e.code)}
});
getRedirectResult(auth).catch(e=>show("로그인 돌아오기 실패: "+e.code));
window.FormwheelCore=Object.freeze({
 version:1,
 getUser:()=>auth.currentUser?{uid:auth.currentUser.uid,anonymous:auth.currentUser.isAnonymous}:null,
 readHome:()=>home.read(),
 recordProjectOpen:(projectId)=>window.dispatchEvent(new CustomEvent("fw:project-open",{detail:{projectId}}))
});
