/* Formwheel Board — Firebase RTDB casual online rooms.
   Only 2 authenticated participants may update a room. All actions are replayed
   using the existing game's local rules; no money, ratings, or rewards.
   Server-side adjudication is needed before adding competitive rankings. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,onValue,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig={
 apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",
 authDomain:"formwheel.firebaseapp.com",
 databaseURL:"https://formwheel-default-rtdb.firebaseio.com",
 projectId:"formwheel",
 storageBucket:"formwheel.firebasestorage.app",
 messagingSenderId:"431583088241",
 appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"
};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(firebaseConfig);
const auth=getAuth(app),database=getDatabase(app);
const bridge=window.FormwheelBoardBridge;
const el=id=>document.getElementById(id);
const createBtn=el("online-create"),joinBtn=el("online-join"),leaveBtn=el("online-leave");
const codeInput=el("online-code"),roomInfo=el("online-room"),status=el("online-status");
const shareBtn=el("online-copy"),onlinePanel=el("online-active"),offlinePanel=el("online-setup");
const controls=el("game-tabs"),newBtn=el("new-game"),undoBtn=el("undo"),size=el("board-size");
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",codePattern=/^[A-HJ-NP-Z2-9]{8}$/;
const sessionKey="fw:board:online:session:v1";
let roomCode="",room=null,roomListener=null,busy=false,connection=false,corrupt=false,latestMoveCount=0,uid="";
const say=t=>{status.textContent=t;};
const errorText=err=>{
 const code=String(err?.code||err?.message||"unknown");
 if(/permission|denied/i.test(code))return "Firebase Database Rules에서 Board 접근을 거부했어요. boardRooms 규칙의 배포 상태를 확인해 주세요.";
 if(/auth\/operation-not-allowed/i.test(code))return "Firebase에서 익명 로그인이 꺼져 있어요. Authentication의 익명 제공업체를 활성화하거나 Hub에서 Google 로그인하세요.";
 if(/network|unavailable|disconnect/i.test(code))return "연결이 불안정해요. 인터넷 연결을 확인해 주세요.";
 return "온라인 오류: "+code;
};
const toCode=value=>String(value||"").toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,"").slice(0,8);
function randomCode(){
 const nums=new Uint32Array(8);crypto.getRandomValues(nums);
 return Array.from(nums,n=>alphabet[n%alphabet.length]).join("");
}
const roomRef=code=>ref(database,"boardRooms/"+code);
const member=r=>!!uid&&(r?.hostUid===uid||r?.guestUid===uid);
function actionsOf(r){
 const raw=r?.actions||{};
 if(typeof raw!=="object")throw Error("invalid actions container");
 const ids=Object.keys(raw);
 if(ids.length>1200)throw Error("too many moves");
 const actions=[];
 for(let i=0;i<ids.length;i++){
  if(!Object.prototype.hasOwnProperty.call(raw,String(i)))throw Error("non-sequential move index");
  actions.push(raw[String(i)]);
 }
 return actions;
}
function toggleUI(){
 const active=!!roomCode;
 onlinePanel.hidden=!active;offlinePanel.hidden=active;
 controls.querySelectorAll("button").forEach(btn=>{btn.disabled=active;});
 newBtn.hidden=active;undoBtn.hidden=active;
 size.disabled=active;
 leaveBtn.disabled=!active;shareBtn.disabled=!active;
 bridge?.render();
}
function persist(){
 try{
  if(roomCode)localStorage.setItem(sessionKey,JSON.stringify({code:roomCode,uid}));
  else localStorage.removeItem(sessionKey);
 }catch(_){}
}
function updateUrl(){
 const url=new URL(location.href);
 if(roomCode)url.searchParams.set("room",roomCode);
 else url.searchParams.delete("room");
 history.replaceState(null,"",url.pathname+url.search+url.hash);
}
function dismissListener(){
 if(roomListener){roomListener();roomListener=null;}
}
function resetToLocal(){
 dismissListener();roomCode="";room=null;busy=false;corrupt=false;latestMoveCount=0;
 persist();updateUrl();toggleUI();
 bridge.resetLocal();
 say(connection?"로컬 대전 모드입니다.":"오프라인 상태 · 로컬 대전은 계속 가능합니다.");
}
function readRoom(r){
 if(!r||!member(r)){say("이 방의 참가자가 아니에요.");return;}
 try{
  const actions=actionsOf(r);
  if(!bridge.load(r.game,r.size,actions,r.hostUid,r.guestUid)){
   corrupt=true;say("⚠️ 방의 수순에 오류가 있어 새 수를 둘 수 없습니다.");toggleUI();return;
  }
  corrupt=false;latestMoveCount=actions.length;
  const result=bridge.getStatus();
  const side=r.hostUid===uid?"선공 (백/흑)":"후공 (흑/백)";
  roomInfo.textContent="방 코드 "+roomCode+" · "+side+" · "+(r.status==="waiting"?"상대방 대기 중":"2명 참가");
  if(r.status==="waiting")say("방을 만들었어요! 코드를 공유해 친구가 참가하면 시작됩니다.");
  else if(result.done)say("대국이 끝났어요. 상대방과 함께 결과를 확인하세요.");
  else if(!connection)say("Firebase 연결이 끊어졌어요. 연결되면 수를 둘 수 있습니다.");
  else say(canMove()?"🟢 내 차례입니다. 수를 선택하세요!":"상대방 차례입니다. 수를 기다리는 중…");
  toggleUI();
 }catch(e){corrupt=true;say("⚠️ 수순 동기화 문제: "+String(e.message||e));toggleUI();}
}
function listen(code){
 dismissListener();
 roomListener=onValue(roomRef(code),snap=>{
  if(roomCode!==code)return;
  const next=snap.val();
  if(!next){say("방을 찾을 수 없어요.");return;}
  room=next;readRoom(room);
 },err=>{if(roomCode===code)say(errorText(err));});
}
async function signIn(){
 if(auth.currentUser){uid=auth.currentUser.uid;return uid;}
 try{
  const credentials=await signInAnonymously(auth);
  uid=credentials.user.uid;return uid;
 }catch(err){say(errorText(err));throw err;}
}
function setBusy(flag){
 busy=flag;createBtn.disabled=flag;joinBtn.disabled=flag;
 if(roomCode)bridge?.render();
}
async function createRoom(){
 if(busy||roomCode)return;
 if(!["chess","go","omok","othello"].includes(bridge.getStatus().game)){say("이 게임은 로컬·봇 대전 전용입니다. 기존 4종에서 온라인 방을 이용해 주세요.");return;}
 setBusy(true);say("방을 만드는 중…");
 try{
  await signIn();
  const g=bridge.getStatus();
  let code=null;
  for(let i=0;i<5&&!code;i++){
   const candidate=randomCode();
   const now=Date.now();
   const result=await runTransaction(roomRef(candidate),old=>{
    if(old!==null)return;
    return {version:1,game:g.game,size:g.size,hostUid:uid,guestUid:"",status:"waiting",createdAt:now,updatedAt:now};
   },{applyLocally:false});
   if(result.committed)code=candidate;
  }
  if(!code)throw Error("방 코드를 만들지 못했어요. 다시 시도해 주세요.");
  roomCode=code;room=null;latestMoveCount=0;persist();updateUrl();toggleUI();listen(roomCode);
 }catch(err){say(errorText(err));}finally{setBusy(false);}
}
async function joinRoom(){
 if(busy||roomCode)return;
 const code=toCode(codeInput.value);codeInput.value=code;
 if(!codePattern.test(code)){say("방 코드를 8자리 입력해 주세요.");return;}
 setBusy(true);say("방에 참가하는 중…");
 try{
  await signIn();
  const existing=(await get(roomRef(code))).val();
  if(!existing){say("존재하지 않는 방 코드예요.");return;}
  if(!["chess","go","omok","othello"].includes(existing.game)){say("지원하지 않는 온라인 게임입니다.");return;}
  if(existing.hostUid!==uid&&existing.guestUid!==uid){
   if(existing.guestUid){say("이미 2명이 참가한 방이에요.");return;}
   const now=Date.now();
   const res=await runTransaction(roomRef(code),r=>{
    if(!r||r.status!=="waiting"||r.guestUid||r.hostUid===uid)return;
    return {...r,guestUid:uid,status:"playing",updatedAt:now};
   },{applyLocally:false});
   if(!res.committed){say("참가할 수 없어요. 방이 이미 가득 찼을 수 있습니다.");return;}
  }
  roomCode=code;room=existing;latestMoveCount=0;persist();updateUrl();toggleUI();listen(code);
 }catch(err){say(errorText(err));}finally{setBusy(false);}
}
function canMove(){
 if(!roomCode||!room||busy||!connection||corrupt||room.status!=="playing"||!member(room))return false;
 if(bridge.getStatus().done)return false;
 return bridge.getTurn()===1?uid===room.hostUid:uid===room.guestUid;
}
const validAction=action=>{
 if(!action||typeof action!=="object")return false;
 const g=room?.game;
 if(action.kind==="place")return g!=="chess"&&Number.isInteger(action.index)&&action.index>=0&&action.index<(g==="go"?room.size*room.size:g==="omok"?225:64);
 if(action.kind==="chess")return g==="chess"&&Number.isInteger(action.from)&&Number.isInteger(action.to)&&action.from>=0&&action.from<128&&action.to>=0&&action.to<128&&/^(|q|r|b|n)$/.test(action.promotion||"");
 return action.kind==="pass"&&g==="go"||action.kind==="claim"&&g==="chess";
};
async function submit(action){
 if(!canMove()||!validAction(action)){say("내 차례가 아니거나 허용되지 않은 행동이에요.");return;}
 const code=roomCode,expected=latestMoveCount,who=uid;
 setBusy(true);say("수를 전송하고 있어요…");
 try{
  const now=Date.now();
  const tx=await runTransaction(roomRef(code),r=>{
   if(!r||r.status!=="playing"||r.hostUid!==room.hostUid||r.guestUid!==room.guestUid)return;
   const existing=r.actions||{};
   if(Object.keys(existing).length!==expected||expected>=1200)return;
   if((bridge.getTurn()===1?r.hostUid:r.guestUid)!==who)return;
   return {...r,updatedAt:now,actions:{...existing,[String(expected)]:{...action,uid:who}}};
  },{applyLocally:false});
  if(!tx.committed){
   say("수순이 먼저 바뀌었어요. 최신 판을 확인하고 다시 둬 주세요.");
   const fresh=(await get(roomRef(code))).val();
   if(roomCode===code&&fresh){room=fresh;readRoom(fresh);}
  }
 }catch(err){say(errorText(err));}
 finally{setBusy(false);if(roomCode===code&&room&&!corrupt)readRoom(room);}
}
function copyInvite(){
 if(!roomCode)return;
 const url=new URL(location.href);url.searchParams.set("room",roomCode);
 const link=url.href;
 if(navigator.clipboard?.writeText){
  navigator.clipboard.writeText(link).then(()=>say("초대 링크를 복사했어요!")).catch(()=>say("초대 코드: "+roomCode));
 }else say("초대 코드: "+roomCode);
}
window.FormwheelBoardOnline=Object.freeze({isOnline:()=>!!roomCode,canMove,submit});
createBtn.addEventListener("click",createRoom);
joinBtn.addEventListener("click",joinRoom);
leaveBtn.addEventListener("click",resetToLocal);
shareBtn.addEventListener("click",copyInvite);
codeInput.addEventListener("input",()=>{codeInput.value=toCode(codeInput.value);});
codeInput.addEventListener("keydown",e=>{if(e.key==="Enter")joinRoom();});
onAuthStateChanged(auth,user=>{
 const previous=uid;uid=user?.uid||"";
 if(roomCode&&previous&&previous!==uid){
  say("로그인 계정이 변경되어 온라인 방을 나왔어요. 이전 계정으로 돌아오면 참가할 수 있어요.");
  resetToLocal();
 }
});
onValue(ref(database,".info/connected"),snap=>{
 connection=snap.val()===true;
 if(roomCode&&room&&!corrupt)readRoom(room);
 else if(!roomCode)say(connection?"온라인 준비 완료 · 방을 만들거나 코드를 입력하세요.":"Firebase 연결 중… 로컬 대전은 계속 가능합니다.");
},err=>say(errorText(err)));
const invited=new URLSearchParams(location.search).get("room");
if(invited&&codePattern.test(toCode(invited))){codeInput.value=toCode(invited);say("초대 링크를 열었어요. '코드로 참가'를 눌러 주세요.");}
else{
 try{
  const prev=JSON.parse(localStorage.getItem(sessionKey)||"null");
  if(prev?.code&&codePattern.test(prev.code))codeInput.value=prev.code;
 }catch(_){}
}
toggleUI();
