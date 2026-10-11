/* Formwheel Hub live presence. One user is counted once across multiple tabs. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,onDisconnect,set,remove,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const label=document.getElementById("fw-live-count"),note=document.getElementById("fw-live-note");
const base="formwheelV2/liveHubSessions";
const sessionId=crypto.randomUUID().replace(/-/g,"");
const sessionKey=()=>auth.currentUser?.uid;
let registered=null,disconnect=null,connection=true,generation=0;
const say=(message)=>{if(note)note.textContent=message};
onValue(ref(db,base),snapshot=>{
 const val=snapshot.val()||{},unique=new Set();
 Object.entries(val).forEach(([uid,sessions])=>{if(sessions&&typeof sessions==="object"&&Object.keys(sessions).length)unique.add(uid)});
 label.textContent=unique.size.toLocaleString("ko-KR")+"명";
 say("현재 Hub에 접속 중 · 로그인/게스트 포함");
},error=>{label.textContent="조회 불가";say("Firebase 읽기 권한을 확인해 주세요 · "+(error.code||"연결 오류"))});
onValue(ref(db,".info/connected"),snapshot=>{connection=snapshot.val()===true;if(connection)start(auth.currentUser);else say("연결 재시도 중…")});
async function clear(){const old=registered,d=disconnect;registered=null;disconnect=null;if(d)try{await d.cancel()}catch{}if(old)try{await remove(old)}catch{}}
async function start(user){
 const token=++generation;await clear();
 if(token!==generation||!user||!connection)return;
 const node=ref(db,base+"/"+user.uid+"/"+sessionId);
 try{
  const guard=onDisconnect(node);await guard.remove();
  if(token!==generation){await guard.cancel();return}
  await set(node,{joinedAt:serverTimestamp()});
  if(token!==generation){await guard.cancel();await remove(node);return}
  registered=node;disconnect=guard;
 }catch(error){say("접속자 등록 실패 · Firebase Rules 확인 ("+(error.code||"연결 오류")+")")}
}
onAuthStateChanged(auth,async user=>{
 if(user){start(user);return}
 // Guests count only when anonymous Firebase sign-in is enabled.
 try{await signInAnonymously(auth)}catch(error){say("게스트 집계 비활성 · 익명 인증 설정 확인 ("+(error.code||"인증 실패")+")")}
});
window.addEventListener("pagehide",()=>{if(registered)remove(registered).catch(()=>{})});
