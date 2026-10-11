import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,set} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const icons=["🎡","🎮","🦊","🐱","🚀","🌟","🎲","👑"],guestKey="fw:profile:guest:v1";
const get=id=>document.getElementById(id),message=get("fw-profile-status");
const sanitize=p=>({nickname:typeof p?.nickname==="string"&&p.nickname.trim().length>=2?p.nickname.trim().slice(0,16):"게스트",icon:icons.includes(p?.icon)?p.icon:"🎡",color:/^#[0-9a-f]{6}$/i.test(p?.color||"")?p.color:"#6366f1"});
const guest=()=>{try{return sanitize(JSON.parse(localStorage.getItem(guestKey)))}catch{return sanitize({})}};
const path=uid=>ref(db,"formwheelV2/hubProfiles/"+uid);
function render(data,user){const p=sanitize(data);get("fw-profile-name").textContent=p.nickname;get("fw-profile-avatar").textContent=p.icon;get("fw-profile-avatar").style.backgroundColor=p.color;get("fw-profile-nickname").value=p.nickname==="게스트"?"":p.nickname;get("fw-profile-icon").value=p.icon;get("fw-profile-color").value=p.color;get("fw-profile-detail").textContent=user?"Firebase에 저장되는 계정 프로필":"이 기기에만 저장되는 게스트 프로필";}
const badgeDefinitions=[["base","🏅","40→50 Anniversary"],["day40","👑","DAY 40 · Original"],["master","🏆","40→50 Master"],["share","📣","40→50 SHARE"],["day50","✨","DAY 50 · Finale"]];
let badgeUnsubscribe=null;
function showBadges(values){
 const holder=get("fw-badges-grid");holder.replaceChildren();
 for(const [id,emoji,title] of badgeDefinitions){
  const earned=!!(values&&values[id]);
  const item=document.createElement("div");item.className="fw-badge"+(earned?"":" locked");
  const icon=document.createElement("span");icon.className="fw-badge-icon";icon.textContent=earned?emoji:"🔒";
  const info=document.createElement("div"),name=document.createElement("strong"),sub=document.createElement("small");
  name.textContent=title;sub.textContent=earned?"✓ 획득 완료 · 영구 소장":"미획득";
  info.append(name,sub);item.append(icon,info);holder.append(item);
 }
}
showBadges(null);
let unsubscribe=null,currentUser=null,authReady=false;
onAuthStateChanged(auth,user=>{authReady=true;currentUser=user&&!user.isAnonymous?user:null;if(unsubscribe){unsubscribe();unsubscribe=null}if(badgeUnsubscribe){badgeUnsubscribe();badgeUnsubscribe=null}
if(!currentUser){render(guest(),null);showBadges(null);get("fw-badges-status").textContent="로그인하면 계정의 획득 배지를 볼 수 있어요.";return}
badgeUnsubscribe=onValue(ref(db,"formwheelV2/anniversary4050/"+currentUser.uid+"/badges"),snap=>{showBadges(snap.val()||{});get("fw-badges-status").textContent="계정의 배지 기록을 불러왔어요.";},e=>{showBadges(null);get("fw-badges-status").textContent="배지 불러오기 실패: "+(e.code||e.message)+". Firebase Rules를 확인해 주세요."});unsubscribe=onValue(path(currentUser.uid),snapshot=>render(snapshot.val()||{nickname:currentUser.displayName||"게스트"},currentUser),e=>{message.textContent="프로필 불러오기 실패: "+e.code})});
get("fw-profile-form").addEventListener("submit",async event=>{event.preventDefault();if(!authReady){message.textContent="로그인 상태를 확인 중이에요.";return}const nickname=get("fw-profile-nickname").value.trim();if(nickname.length<2||nickname.length>16){message.textContent="닉네임은 2~16자로 입력해 주세요.";return}const profile=sanitize({nickname,icon:get("fw-profile-icon").value,color:get("fw-profile-color").value});try{if(currentUser){await set(path(currentUser.uid),profile);message.textContent="계정 프로필을 저장했어요."}else{localStorage.setItem(guestKey,JSON.stringify(profile));render(profile,null);message.textContent="게스트 프로필을 이 기기에 저장했어요."}}catch(e){message.textContent="저장 실패: "+(e.code||"네트워크 또는 권한 오류")}});
