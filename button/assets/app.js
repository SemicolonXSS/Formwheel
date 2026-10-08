import {initializeApp} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {getDatabase,ref,set,onValue,update,remove,onDisconnect,get,runTransaction} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import {getAuth,signInAnonymously,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig={
 apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",
 authDomain:"formwheel.firebaseapp.com",
 databaseURL:"https://formwheel-default-rtdb.firebaseio.com",
 projectId:"formwheel",
 storageBucket:"formwheel.firebasestorage.app",
 messagingSenderId:"431583088241",
 appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0",
 measurementId:"G-T372YXDF8D"
};
const app=initializeApp(firebaseConfig),db=getDatabase(app),auth=getAuth(app);
let uid=null,room="",mode="solo",host=false,playerName="",round=0,score=0,totalRounds=12;
let timerId=null,roundStart=0,answered=false,current=null,roomUnsub=null,gameUnsub=null,lastRoundData=null;
const root="buttonRooms";

const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function setStatus(t,ok=false){$("setupStatus").textContent=t;$("setupStatus").className="status "+(ok?"ok":"")}
function cleanName(){return ($("nickname").value||"Player").trim().slice(0,12)||"Player"}
function randomCode(){return String(Math.floor(1000+Math.random()*9000))}
function roomRef(){return ref(db,`${root}/${room}`)}
function nowSec(){return (performance.now()-roundStart)/1000}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

signInAnonymously(auth).catch(e=>setStatus("Firebase 인증 실패: "+e.message));
onAuthStateChanged(auth,u=>{
 uid=u?.uid||null;
 if(uid) setStatus("Firebase 연결 성공 · 익명 인증 완료",true);
 else setStatus("Firebase 인증 실패");
 checkUrlRoom();
});

window.show=show;
window.openSetup=(m)=>{mode=m;$("setupTitle").textContent=m==="solo"?"🎮 솔로 설정":"👥 같이 하기";$("multiSetup").classList.toggle("hidden",m!=="multi");$("soloSetup").classList.toggle("hidden",m!=="solo");show("setup")};

async function checkUrlRoom(){
 const p=new URLSearchParams(location.search),r=p.get("room")||p.get("");
 if(r&&/^\d{4}$/.test(r)){mode="multi";$("roomInput").value=r;openSetup("multi");$("setupStatus").textContent="공유받은 방 코드가 입력되었습니다."}
}
window.startSolo=()=>{playerName=cleanName();if(!playerName)return;mode="solo";round=0;score=0;show("game");startRoundLocal()};
window.createRoom=async()=>{
 if(!uid){setStatus("Firebase 인증 중입니다. 잠시 후 다시 눌러주세요.");return}
 playerName=cleanName();if(!playerName){setStatus("닉네임을 입력해주세요.");return}
 room=randomCode();host=true;
 await set(roomRef(),{status:"lobby",host:uid,createdAt:Date.now(),players:{[uid]:{name:playerName,score:0,joinedAt:Date.now()}}});
 watchLobby();history.replaceState({}, "", location.pathname+"?room="+room);show("lobby");
};
window.joinRoom=async()=>{
 if(!uid){setStatus("Firebase 인증 중입니다. 잠시 후 다시 눌러주세요.");return}
 playerName=cleanName();let r=($("roomInput").value||"").trim();
 if(!/^\d{4}$/.test(r)){setStatus("4자리 방 코드를 입력해주세요.");return}
 const snap=await get(ref(db,`${root}/${r}`));if(!snap.exists()){setStatus("방을 찾을 수 없습니다.");return}
 room=r;host=false;
 await update(ref(db,`${root}/${room}/players/${uid}`),{name:playerName,score:0,joinedAt:Date.now()});
 watchLobby();history.replaceState({}, "", location.pathname+"?room="+room);show("lobby");
};
function watchLobby(){
 if(roomUnsub)roomUnsub();
 roomUnsub=onValue(roomRef(),snap=>{
  const d=snap.val();if(!d)return;
  $("roomCode").textContent=room;
  $("shareUrl").textContent=location.origin+location.pathname+"?room="+room;
  const ps=Object.entries(d.players||{});
  $("lobbyPlayers").innerHTML=ps.map(([id,p])=>`<div class="player">${id===d.host?"👑 ":""}${escapeHtml(p.name||"Player")}</div>`).join("");
  $("hostStart").classList.toggle("hidden",d.host!==uid);
  if(d.status==="playing"&&Number(d.round)>round){
   show("game");if(round===0)score=0;round=Number(d.round)-1;startRoundLocal();
  }
  if(d.status==="playing"&&host&&answered)nextMulti();
  if(d.status==="result")finishMulti(d.results||{});
 });
 onDisconnect(ref(db,`${root}/${room}/players/${uid}`)).remove();
}
window.hostStartGame=async()=>{await update(roomRef(),{status:"playing",round:1,startedAt:Date.now(),roundData:null,answers:null});};
window.leaveRoom=async()=>{if(room&&uid)await remove(ref(db,`${root}/${room}/players/${uid}`));room="";show("home");history.replaceState({}, "", location.pathname)};
window.copyRoomLink=async()=>{await navigator.clipboard.writeText(location.origin+location.pathname+"?room="+room);toast("방 주소를 복사했어요!")};

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

const rules=[
 {id:"late",text:"타이머가 정확히 2.50초를 지난 뒤에만 버튼을 누르세요.",kind:"press",min:2.50,max:5},
 {id:"micro",text:"3.70초와 4.10초 사이의 단 0.40초 동안만 버튼을 누르세요.",kind:"press",min:3.70,max:4.10},
 {id:"micro2",text:"4.45초와 4.80초 사이의 단 0.35초 동안만 버튼을 누르세요.",kind:"press",min:4.45,max:4.80},
 {id:"last",text:"마지막 0.20초 안에서만 버튼을 누르세요.",kind:"press",min:4.80,max:5},
 {id:"wait",text:"처음 5초 동안은 절대로 누르지 말고, 그 이후에 누르세요.",kind:"press",min:3,max:5},
 {id:"exact",text:"가능한 한 정확하게 3.33초에 버튼을 누르세요.",kind:"press",min:3.23,max:3.43},
 {id:"dont",text:"이번 라운드에서는 버튼을 절대로 누르지 마세요.",kind:"dont"},
 {id:"dontLate",text:"마지막 1초에 버튼이 보여도 누르지 마세요. 끝까지 기다리세요.",kind:"dont"},
 {id:"dontMiddle",text:"타이머가 2초에서 4초 사이일 때 버튼을 누르지 마세요.",kind:"dont"},
 {id:"memoryPosition",text:"버튼의 위치를 기억하세요. 같은 위치에 다시 나타났을 때 누르세요.",kind:"memoryPosition"},
 {id:"twoStep",text:"버튼이 처음 나타난 위치에서는 누르지 말고, 두 번째 위치에서만 누르세요.",kind:"twoStep",min:3,max:5},
 {id:"disappear",text:"버튼이 깜빡여도 바로 누르지 마세요. 마지막에 다시 나타났을 때 누르세요.",kind:"disappear",min:4,max:5},
 {id:"moving",text:"움직이는 버튼이 멈춘 뒤 정확히 0.50초 안에 누르세요.",kind:"moving",min:3.8,max:4.3},
 {id:"sequence",text:"버튼이 두 번 나타납니다. 첫 번째는 무시하고 두 번째만 누르세요.",kind:"sequence"},
 {id:"count",text:"버튼이 세 번째 위치로 이동한 뒤에만 누르세요.",kind:"count"},
 {id:"center",text:"버튼이 중앙 근처에 나타났을 때만 누르세요.",kind:"center"},
 {id:"edge",text:"버튼이 네모 영역의 가장자리 근처에 나타났을 때만 누르세요.",kind:"edge"},
 {id:"delay",text:"버튼이 나타난 후 최소 2초가 지나야 누를 수 있습니다.",kind:"delay",min:2,max:5},
 {id:"randomWait",text:"버튼이 나타난 순간을 무시하고, 타이머가 4초를 넘긴 뒤 누르세요.",kind:"press",min:4,max:5},
 {id:"notHalf",text:"절반이 되자마자 누르지 마세요. 절반을 지난 뒤 1초 이상 기다리세요.",kind:"press",min:3.5,max:5},
 {id:"nearEnd",text:"5초가 끝나기 직전, 가능한 한 늦게 버튼을 누르세요.",kind:"press",min:4.90,max:5}
];

function makeRound(){
 let pool=shuffle([...rules]);
 let r=pool.find(x=>!lastRoundData||x.id!==lastRoundData.id)||pool[0];
 return {...r,buttonText:r.kind==="dont"||r.id==="dontLate"||r.id==="dontMiddle"?"DON'T PRESS":"PRESS",
         spawnX:rand(5,70),spawnY:rand(5,70),secondX:rand(5,70),secondY:rand(5,70)};
}
function startRoundLocal(){
 clearInterval(timerId);
 round++;
 if(round>totalRounds){finishSolo();return}
 answered=false;current=makeRound();roundStart=performance.now();
 $("roundLabel").textContent=`ROUND ${round} / ${totalRounds}`;
 $("scoreLabel").textContent=`점수 ${score}`;
 $("modeBadge").textContent=mode==="solo"?"SOLO":"MULTI";
 $("feedback").textContent="";$("feedback").className="feedback";
 $("buttonZone").innerHTML=`<button class="chaos-button red" id="chaosBtn">${current.buttonText}</button>`;
 $("extraInfo").textContent="";
 positionButton();
 $("ruleText").textContent=current.text;
 $("gameHint").textContent=mode==="multi"?"모두 같은 라운드":"정확한 순간을 노리세요";
 $("chaosBtn").onclick=()=>answer(true);
 $("chaosBtn").disabled=mode==="multi";
 if(mode==="multi") syncMultiRound();
 else timerId=setInterval(tick,50);
}
function positionButton(useSecond=false){
 const b=$("chaosBtn"),z=$("buttonZone");
 if(!b||!z)return;
 const maxX=Math.max(5,z.clientWidth-155),maxY=Math.max(5,z.clientHeight-95);
 if(current?.spawnX!=null){
   const px=useSecond?current.secondX:current.spawnX;
   const py=useSecond?current.secondY:current.spawnY;
   b.style.left=Math.min(maxX,Math.max(5,px/100*z.clientWidth))+"px";
   b.style.top=Math.min(maxY,Math.max(5,py/100*z.clientHeight))+"px";
 }else{
   b.style.left=rand(5,maxX)+"px"; b.style.top=rand(5,maxY)+"px";
 }
}
function tick(){
 let elapsed=nowSec(),remain=Math.max(0,5-elapsed);
 $("timer").textContent=remain.toFixed(1);
 $("timer").className="timer "+(remain<=1?"danger":remain<=2.5?"warn":"");
 if(current?.kind==="moving"){
   const phase=Math.floor(elapsed*2);
   if(phase!==Math.floor(Math.max(0,elapsed-.05)*2))positionButton();
 }
 if(current?.kind==="twoStep"&&elapsed>=3.0&&!current._secondMoved){
   current._secondMoved=true;positionButton(true);
 }
 if(current?.kind==="sequence"&&elapsed>=2.5&&!current._secondMoved){
   current._secondMoved=true;positionButton(true);
 }
 if(current?.kind==="count"&&elapsed>=3.2&&!current._secondMoved){
   current._secondMoved=true;positionButton(true);
 }
 if(current?.kind==="disappear"&&elapsed>=2.8&&!current._secondMoved){
   current._secondMoved=true;
   const b=$("chaosBtn"); if(b){b.classList.add("hidden");setTimeout(()=>{b.classList.remove("hidden");positionButton(true)},500)}
 }
 if(remain<=0){clearInterval(timerId);if(!answered)answer(false,true)}
}
async function answer(pressed,timedOut=false){
 if(answered)return;answered=true;clearInterval(timerId);
 let t=Math.min(5,nowSec()),correct=false,points=0;
 const k=current.kind;
 if(k==="dont") correct=!pressed;
 else if(k==="delay"||k==="press"||k==="moving") correct=pressed&&t>=current.min&&t<=current.max;
 else if(k==="dontLate") correct=!pressed;
 else if(k==="dontMiddle") correct=!pressed || t<2 || t>4;
 else if(k==="twoStep"||k==="sequence"||k==="count") correct=pressed&&current._secondMoved===true;
 else if(k==="disappear") correct=pressed&&current._secondMoved===true&&t>=4;
 else if(k==="memoryPosition") correct=pressed&&current._secondMoved===true;
 else if(k==="center"){
   const b=$("chaosBtn"),z=$("buttonZone");
   const bx=parseFloat(b?.style.left||0)+65,by=parseFloat(b?.style.top||0)+38;
   correct=pressed&&Math.abs(bx-z.clientWidth/2)<100&&Math.abs(by-z.clientHeight/2)<80;
 }
 else if(k==="edge"){
   const b=$("chaosBtn"),z=$("buttonZone");
   const bx=parseFloat(b?.style.left||0),by=parseFloat(b?.style.top||0);
   correct=pressed&&(bx<90||by<70||bx>z.clientWidth-245||by>z.clientHeight-165);
 }
 if(correct){
   points=100+Math.max(0,Math.round((5-Math.abs(4.5-t))*20));
   score+=points;
   $("feedback").textContent=`✅ 성공! +${points}점`;
   $("feedback").className="feedback good";
 }else{
   $("feedback").textContent=timedOut?"⏰ 시간 초과!":"❌ 실패!";
   $("feedback").className="feedback bad";
   score=Math.max(0,score-50);
 }
 $("scoreLabel").textContent=`점수 ${score}`;
 if(mode==="multi"){await submitMultiAnswer(pressed,t,correct,points);setTimeout(()=>nextMulti(),1100)}
 else setTimeout(()=>{lastRoundData={...current,pressed};startRoundLocal()},1100);
}
async function syncMultiRound(){
 let appliedRound = null;
 if(gameUnsub)gameUnsub();
 gameUnsub=onValue(ref(db,`${root}/${room}/roundData`),snap=>{
  const d=snap.val();if(!d||d.round!==round||appliedRound===d.round)return;
  appliedRound=d.round;
  const base=rules.find(x=>x.id===d.rule);if(!base)return;
  current={...base,buttonText:base.kind==="dont"||base.id==="dontLate"||base.id==="dontMiddle"?"DON'T PRESS":"PRESS",spawnX:d.spawnX,spawnY:d.spawnY,secondX:d.secondX,secondY:d.secondY};
  $("ruleText").textContent=current.text;
  $("extraInfo").textContent="";

  if(!answered){
   roundStart=performance.now();
   clearInterval(timerId);timerId=setInterval(tick,50);
   const btn=$("chaosBtn");
   if(btn){btn.disabled=false;btn.textContent=current.buttonText||"PRESS";btn.classList.remove("hidden");positionButton();}
  }
 });
 if(host){
  await update(ref(db,`${root}/${room}/roundData`),{
   round,rule:current.id,text:current.text,startedAt:Date.now(),
   spawnX:current.spawnX,spawnY:current.spawnY,secondX:current.secondX,secondY:current.secondY
  });
 }
}
async function submitMultiAnswer(pressed,t,correct=false,points=0){
 if(!room||!uid)return;
 await update(ref(db,`${root}/${room}/answers/${round}/${uid}`),{name:playerName,pressed,time:t,correct,points,at:Date.now()});
}
function calculateResults(players, answers){
 const out={};
 Object.entries(players||{}).forEach(([id,p])=>out[id]={name:p.name,score:0});
 Object.entries(answers||{}).sort(([a],[b])=>Number(a)-Number(b)).forEach(([,rd])=>{
  Object.entries(rd||{}).forEach(([id,a])=>{if(out[id])out[id].score=Math.max(0,out[id].score+(a.correct?Number(a.points)||0:-50));});
 });
 return out;
}
async function nextMulti(){
 if(!host||!room)return;
 const expectedRound=round;
 try{await runTransaction(roomRef(),d=>{
  if(!d||d.status!=="playing"||Number(d.round)!==expectedRound)return;
  const ids=Object.keys(d.players||{}),answers=d.answers?.[expectedRound]||{};
  if(!ids.length||!ids.every(id=>answers[id]))return;
  if(expectedRound>=totalRounds){d.status="result";d.results=calculateResults(d.players,d.answers);}
  else {d.round=expectedRound+1;d.roundData=null;}
  return d;
 },{applyLocally:false});}catch(e){toast("라운드 진행 실패: "+e.message);}
}
async function getResults(){
 const d=(await get(roomRef())).val()||{};
 return calculateResults(d.players,d.answers);
}
async function finishSolo(){
 show("result");$("resultSummary").textContent=`총 ${totalRounds}라운드 · 최종 ${score}점`;
 $("resultList").innerHTML=`<div class="result-row"><b>🏆</b><b>${escapeHtml(playerName)}</b><strong>${score}점</strong></div>`;
}
function finishMulti(results){
 clearInterval(timerId);show("result");let arr=Object.values(results||{}).sort((a,b)=>(b.score||0)-(a.score||0));
 $("resultSummary").textContent=`${arr.length}명 · ${totalRounds}라운드`;
 $("resultList").innerHTML=arr.map((p,i)=>`<div class="result-row"><b>${i+1}</b><b>${escapeHtml(p.name||"Player")}</b><strong>${p.score||0}점</strong></div>`).join("");
}
window.restartSame=()=>{location.href=location.pathname+(mode==="multi"&&room?`?room=${room}`:"")};

window.addEventListener("beforeunload",()=>{if(room&&uid)remove(ref(db,`${root}/${room}/players/${uid}`))});
