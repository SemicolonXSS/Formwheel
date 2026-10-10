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

const profileForm=document.getElementById("fw-profile-form"),profileName=document.getElementById("fw-profile-name"),profileAvatar=document.getElementById("fw-profile-avatar"),profileDetail=document.getElementById("fw-profile-detail"),profileMessage=document.getElementById("fw-profile-status");
const profileKey="fw:profile:guest:v1", allowedIcons=["🎡","🎮","🦊","🐱","🚀","🌟","🎲","👑"];
const defaultProfile={nickname:"게스트",icon:"🎡",color:"#6366f1"};
function sanitizeProfile(value){
 const nickname=typeof value?.nickname==="string"?value.nickname.trim().slice(0,16):"";
 return {nickname:nickname.length>=2?nickname:"게스트",icon:allowedIcons.includes(value?.icon)?value.icon:"🎡",color:/^#[0-9a-f]{6}$/i.test(value?.color||"")?value.color:"#6366f1"};
}
function guestProfile(){try{return sanitizeProfile(JSON.parse(localStorage.getItem(profileKey)))}catch{return {...defaultProfile}}}
function renderProfile(p){
 const value=sanitizeProfile(p);profileName.textContent=value.nickname;profileAvatar.textContent=value.icon;profileAvatar.style.backgroundColor=value.color;
 profileForm.elements["fw-profile-nickname"].value=value.nickname==="게스트"?"":value.nickname;
 document.getElementById("fw-profile-icon").value=value.icon;document.getElementById("fw-profile-color").value=value.color;
 profileDetail.textContent=auth.currentUser&&!auth.currentUser.isAnonymous?"계정에 저장되는 프로필":"현재 기기에만 저장되는 게스트 프로필";
}
function profilePath(userId){return ref(db,"formwheelV2/hubProfiles/"+userId)}
let profileUnsubscribe=null,profileGeneration=0;
function syncProfile(user){
 if(profileUnsubscribe){profileUnsubscribe();profileUnsubscribe=null}
 const generation=++profileGeneration;
 if(!user||user.isAnonymous){renderProfile(guestProfile());return}
 profileUnsubscribe=onValue(profilePath(user.uid),snapshot=>{
  if(generation!==profileGeneration)return;
  const cloud=snapshot.val();
  renderProfile(cloud||{nickname:user.displayName?.slice(0,16)||"게스트",icon:"🎡",color:"#6366f1"});
 },error=>{profileMessage.textContent="프로필 동기화 실패: "+(error.code||"연결 오류")});
}
profileForm?.addEventListener("submit",async e=>{
 e.preventDefault();
 const nickname=document.getElementById("fw-profile-nickname").value.trim();
 if(nickname.length<2||nickname.length>16){profileMessage.textContent="닉네임은 2~16자로 입력해 주세요.";return}
 const p=sanitizeProfile({nickname,icon:document.getElementById("fw-profile-icon").value,color:document.getElementById("fw-profile-color").value});
 try{
  const user=auth.currentUser;
  if(user&&!user.isAnonymous){await set(profilePath(user.uid),p);profileMessage.textContent="계정 프로필이 저장되었어요."}
  else{localStorage.setItem(profileKey,JSON.stringify(p));renderProfile(p);profileMessage.textContent="기기에 프로필이 저장되었어요."}
 }catch(error){profileMessage.textContent="프로필 저장 실패: "+(error.code||"연결 오류")}
});

onAuthStateChanged(auth,user=>{
 syncProfile(user);
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
