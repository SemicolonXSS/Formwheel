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
let unsubscribe=null,currentUser=null,authReady=false;
onAuthStateChanged(auth,user=>{authReady=true;currentUser=user&&!user.isAnonymous?user:null;if(unsubscribe){unsubscribe();unsubscribe=null}if(!currentUser){render(guest(),null);return}unsubscribe=onValue(path(currentUser.uid),snapshot=>render(snapshot.val()||{nickname:currentUser.displayName||"게스트"},currentUser),e=>{message.textContent="프로필 불러오기 실패: "+e.code})});
get("fw-profile-form").addEventListener("submit",async event=>{event.preventDefault();if(!authReady){message.textContent="로그인 상태를 확인 중이에요.";return}const nickname=get("fw-profile-nickname").value.trim();if(nickname.length<2||nickname.length>16){message.textContent="닉네임은 2~16자로 입력해 주세요.";return}const profile=sanitize({nickname,icon:get("fw-profile-icon").value,color:get("fw-profile-color").value});try{if(currentUser){await set(path(currentUser.uid),profile);message.textContent="계정 프로필을 저장했어요."}else{localStorage.setItem(guestKey,JSON.stringify(profile));render(profile,null);message.textContent="게스트 프로필을 이 기기에 저장했어요."}}catch(e){message.textContent="저장 실패: "+(e.code||"네트워크 또는 권한 오류")}});
