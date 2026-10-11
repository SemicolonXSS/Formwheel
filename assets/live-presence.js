/* Formwheel Hub live presence. One user is counted once across multiple tabs. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,onDisconnect,set,remove,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const label=document.getElementById("fw-live-count"),note=document.getElementById("fw-live-note");
const base="formwheelV2/liveHubSessions";
let latestSessions={};
const sessionId=crypto.randomUUID().replace(/-/g,"");
const rawProject=(location.pathname.split("/").filter(Boolean)[0]||"Formwheel");
const project=(rawProject==="Formwheel"?"Hub":rawProject.replace(/^Formwheel_/i,"")).slice(0,60);
const sessionKey=()=>auth.currentUser?.uid;
let registered=null,disconnect=null,connection=true,generation=0;
const say=(message)=>{if(note)note.textContent=message};
onValue(ref(db,base),snapshot=>{
 const val=snapshot.val()||{},unique=new Set();
 latestSessions=val;
 if(adminUnlocked)renderAdmin();
 Object.entries(val).forEach(([uid,sessions])=>{if(sessions&&typeof sessions==="object"&&Object.keys(sessions).length)unique.add(uid)});
 if(label)label.textContent=unique.size.toLocaleString("ko-KR")+"명";
 say("공통 접속 기록 · 지원 게임 포함 · 로그인/게스트");
},error=>{if(label)label.textContent="조회 불가";say("Firebase 읽기 권한을 확인해 주세요 · "+(error.code||"연결 오류"))});
onValue(ref(db,".info/connected"),snapshot=>{connection=snapshot.val()===true;if(connection)start(auth.currentUser);else say("연결 재시도 중…")});
async function clear(){const old=registered,d=disconnect;registered=null;disconnect=null;if(d)try{await d.cancel()}catch{}if(old)try{await remove(old)}catch{}}
async function start(user){
 const token=++generation;await clear();
 if(token!==generation||!user||!connection)return;
 const node=ref(db,base+"/"+user.uid+"/"+sessionId);
 try{
  const guard=onDisconnect(node);await guard.remove();
  if(token!==generation){await guard.cancel();return}
  await set(node,{joinedAt:serverTimestamp(),project});
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

/* Administrator presence inspector: UI gate only, not a Firebase security boundary. */
const presenceRoot=document.getElementById("fw-live-presence");
let adminUnlocked=false,profileCache=new Map(),profileLoad=0;
if(presenceRoot){
 const trigger=document.createElement("button");
 trigger.type="button";trigger.textContent="접속자 확인";
 trigger.style.cssText="border:0;background:#eef0ff;color:#3439bd;border-radius:999px;padding:6px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer";
 presenceRoot.appendChild(trigger);
 const panel=document.createElement("section");panel.hidden=true;
 panel.style.cssText="position:fixed;z-index:10002;top:10vh;left:50%;transform:translateX(-50%);width:min(92vw,540px);max-height:80vh;overflow:auto;padding:22px;background:white;color:#242842;border:1px solid #dce1ee;border-radius:20px;box-shadow:0 20px 75px #15204055;text-align:left";
 panel.innerHTML='<button type="button" id="presence-close" style="float:right;border:0;background:transparent;font-size:23px;cursor:pointer" aria-label="닫기">×</button><h2 style="margin:0 0 10px">🟢 현재 접속자</h2><form id="presence-code-form"><label for="presence-code">확인 코드</label><input id="presence-code" type="password" autocomplete="off" required style="display:block;margin:8px 0;padding:12px;width:100%;box-sizing:border-box;border:1px solid #ccd2e2;border-radius:10px"><button type="submit" style="background:#3439bd;color:white;border:0;border-radius:10px;padding:10px 18px;cursor:pointer">확인</button></form><p id="presence-message" role="status" style="font-size:13px;color:#64708a"></p><div id="presence-list" hidden></div><p style="font-size:11px;color:#687388">공통 접속 기록이 활성화된 게임 기준 · 계정에 여러 세션이 있으면 각 위치가 표시됩니다.</p>';
 document.body.appendChild(panel);
 const codeForm=panel.querySelector("#presence-code-form"),message=panel.querySelector("#presence-message"),list=panel.querySelector("#presence-list");
 trigger.addEventListener("click",()=>{panel.hidden=false;if(adminUnlocked)renderAdmin();else panel.querySelector("#presence-code").focus()});
 panel.querySelector("#presence-close").addEventListener("click",()=>{panel.hidden=true;adminUnlocked=false;codeForm.hidden=false;list.hidden=true;panel.querySelector("#presence-code").value="";profileLoad++});
 codeForm.addEventListener("submit",event=>{
  event.preventDefault();
  if(panel.querySelector("#presence-code").value!=="asdf1340"){message.textContent="확인 코드가 올바르지 않습니다.";return}
  adminUnlocked=true;codeForm.hidden=true;list.hidden=false;message.textContent="실시간 접속자 목록 · 화면 종료 시 잠금";
  renderAdmin();
 });
}
function renderAdmin(){
 if(!adminUnlocked||!presenceRoot)return;
 const list=document.getElementById("presence-list");if(!list)return;
 const entries=Object.entries(latestSessions).filter(([,sessions])=>sessions&&typeof sessions==="object"&&Object.keys(sessions).length);
 list.replaceChildren();
 const header=document.createElement("p");header.style.fontWeight="700";const gameCounts={};for(const [,sessions] of entries){for(const game of new Set(Object.values(sessions).map(v=>typeof v?.project==="string"?(v.project==="Formwheel"?"Hub":v.project.replace(/^Formwheel_/i,"")):"알 수 없음"))){gameCounts[game]=(gameCounts[game]||0)+1}}header.textContent="현재 "+entries.length+"명 · 위치별 "+Object.entries(gameCounts).map(([k,v])=>k+" "+v+"명").join(" / ");list.appendChild(header);
 if(!entries.length){const empty=document.createElement("p");empty.textContent="현재 기록된 접속자가 없습니다.";list.appendChild(empty);return}
 entries.slice(0,200).forEach(([uid,sessions])=>{
  const values=Object.values(sessions).filter(x=>x&&typeof x==="object");
  const line=document.createElement("div");line.style.cssText="padding:12px 0;border-top:1px solid #e7eaf1";
  const name=document.createElement("strong");name.textContent="👤 "+(profileCache.get(uid)||"게스트 / 비공개 사용자");line.appendChild(name);
  const detail=document.createElement("div");detail.style.cssText="font-size:12px;color:#6b7280;margin-top:5px";
  const joined=values.map(x=>typeof x.joinedAt==="number"?x.joinedAt:null).filter(Boolean);
  const first=joined.length?new Date(Math.min(...joined)).toLocaleString("ko-KR"):"확인 불가";
  const locations=[...new Set(values.map(x=>typeof x.project==="string"?(x.project==="Formwheel"?"Hub":x.project.replace(/^Formwheel_/i,"")):"알 수 없음"))];
  detail.textContent="📍 "+locations.join(" · ")+" | "+values.length+"개 세션 · 최초 접속 "+first;line.appendChild(detail);list.appendChild(line);
  if(!profileCache.has(uid))loadName(uid);
 });
}
async function loadName(uid){
 if(profileCache.has(uid))return;
 profileCache.set(uid,"게스트 / 비공개 사용자");
 try{
  const snap=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js").then(m=>m.get(ref(db,"formwheelV2/hubProfiles/"+uid)));
  const data=snap.val();
  const display=typeof data?.nickname==="string"?data.nickname:typeof data?.displayName==="string"?data.displayName:typeof data?.name==="string"?data.name:"";
  if(display)profileCache.set(uid,display.slice(0,40));
 }catch{}
 if(adminUnlocked)renderAdmin();
}
