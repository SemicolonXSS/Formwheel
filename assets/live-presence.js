/* Formwheel Hub live presence. One user is counted once across multiple tabs. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,onDisconnect,set,remove,serverTimestamp,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const label=document.getElementById("fw-live-count"),note=document.getElementById("fw-live-note");
const base="formwheelV2/liveHubSessions";
let latestSessions={};
let latestVisitors={};
const visitorBase="formwheelV2/visitorStats/uniqueVisitors";
const visitorCount=document.getElementById("fw-total-visitor-count");
const visitorNote=document.getElementById("fw-total-visitor-note");
let recordedVisitorUid=null;
let durationTimer=null;
let durationBusy=false;
const DURATION_INTERVAL=15000;
let lastActiveTick=Date.now();
const projectStatsKey='Hub';
const DURATION_MAX_GAP=45000;
const formatDuration=ms=>{
 if(!Number.isFinite(ms)||ms<=0)return "0분";
 const minutes=Math.floor(ms/60000),seconds=Math.floor(ms/1000)%60;
 const hours=Math.floor(minutes/60),days=Math.floor(hours/24);
 return (days?days+"일 ":"")+(hours%24?hours%24+"시간 ":"")+(minutes%60?minutes%60+"분":!days&&!hours?"0분":"")+(minutes<1?" "+seconds+"초":"");
};
async function accumulateDuration(uid,{allowHidden=false}={}){
  if(!uid||auth.currentUser?.uid!==uid||!connection||durationBusy)return;
  const now=Date.now();
  const elapsed=Math.min(DURATION_MAX_GAP,Math.max(0,now-lastActiveTick));
  lastActiveTick=now;
  if(!allowHidden&&document.visibilityState!=="visible")return;
  if(elapsed<=0)return;
  durationBusy=true;
  try{
    await runTransaction(ref(db,visitorBase+"/"+uid),current=>{
      if(!current||typeof current!=="object")return;
      const projectMs={...(current.projectMs||{})};
      projectMs[projectStatsKey]=(Number(projectMs[projectStatsKey])||0)+elapsed;
      return {...current,totalMs:(Number(current.totalMs)||0)+elapsed,projectMs,
        lastCountedAt:now,lastVisitAt:now};
    },{applyLocally:false});
  }catch(error){console.warn("방문 시간 누적 실패",error.code||error)}
  finally{durationBusy=false}
}
function visitorEntries(){return Object.entries(latestVisitors).filter(([,v])=>v&&typeof v==="object");}
onValue(ref(db,visitorBase),snapshot=>{
 latestVisitors=snapshot.val()||{};
 if(visitorCount)visitorCount.textContent=visitorEntries().length.toLocaleString("ko-KR")+"명";
 if(visitorNote)visitorNote.textContent="집계 시작 이후 · UID당 1명";
 if(adminUnlocked)renderAdmin();
},error=>{if(visitorCount)visitorCount.textContent="조회 불가";if(visitorNote)visitorNote.textContent="Firebase 읽기 권한 확인 ("+(error.code||"오류")+")";});
async function recordVisitor(user){
 if(!user||recordedVisitorUid===user.uid)return;
 const uid=user.uid,now=Date.now();
 try{
  const node=ref(db,visitorBase+"/"+uid);
  await runTransaction(node,current=>current===null?{
   firstSeen:now,accountType:user.isAnonymous?"guest":"account",
   totalMs:0,projectMs:{},visitCount:1,lastCountedAt:now,lastVisitAt:now
  }:current&&typeof current==="object"?{
   ...current,totalMs:Number(current.totalMs)||0,
   visitCount:(Number(current.visitCount)||1)+(now-(Number(current.lastVisitAt)||0)>30*60*1000?1:0),
   lastCountedAt:now,lastVisitAt:now
  }:undefined,{applyLocally:false});
  recordedVisitorUid=uid;lastActiveTick=Date.now();
  if(durationTimer)clearInterval(durationTimer);
  durationTimer=setInterval(()=>accumulateDuration(uid),DURATION_INTERVAL);
 }catch(error){if(visitorNote)visitorNote.textContent="방문 기록 저장 실패 · Rules 확인 ("+(error.code||"오류")+")";}
}
const sessionId=crypto.randomUUID().replace(/-/g,"");
const rawProject=(location.pathname.split("/").filter(Boolean)[0]||"Formwheel");
const project=(rawProject==="Formwheel"?"Hub":rawProject.replace(/^Formwheel_/i,"")).slice(0,60);
const sessionKey=()=>auth.currentUser?.uid;
let registered=null,disconnect=null,connection=true,generation=0,heartbeatTimer=null;
const STALE_MS=5*60*1000;
const isFresh=v=>v&&typeof v.lastSeen==="number"&&Date.now()-v.lastSeen<STALE_MS;
const stateOf=v=>!v||typeof v!=="object"?"unknown":typeof v.lastSeen!=="number"?"legacy":Date.now()-v.lastSeen>=STALE_MS?"stale":"fresh";
const sessionEntries=s=>Object.values(s||{}).filter(v=>v&&typeof v==="object");
const activeEntries=s=>sessionEntries(s).filter(isFresh);
const say=(message)=>{if(note)note.textContent=message};
onValue(ref(db,base),snapshot=>{
 const val=snapshot.val()||{},unique=new Set();
 latestSessions=val;
 if(adminUnlocked)renderAdmin();
 Object.entries(val).forEach(([uid,sessions])=>{if(activeEntries(sessions).length)unique.add(uid)});
 if(label)label.textContent=unique.size.toLocaleString("ko-KR")+"명";
 say("최근 5분 내 접속 확인 · 공통 게임 포함");
},error=>{if(label)label.textContent="조회 불가";say("Firebase 읽기 권한을 확인해 주세요 · "+(error.code||"연결 오류"))});
onValue(ref(db,".info/connected"),snapshot=>{connection=snapshot.val()===true;if(connection)start(auth.currentUser);else say("연결 재시도 중…")});
async function clear(){if(heartbeatTimer)clearInterval(heartbeatTimer);heartbeatTimer=null;const old=registered,d=disconnect;registered=null;disconnect=null;if(d)try{await d.cancel()}catch{}if(old)try{await remove(old)}catch{}}
async function start(user){
 const token=++generation;await clear();
 if(token!==generation||!user||!connection)return;
 const node=ref(db,base+"/"+user.uid+"/"+sessionId);
 try{
  const guard=onDisconnect(node);await guard.remove();
  if(token!==generation){await guard.cancel();return}
  await set(node,{joinedAt:serverTimestamp(),lastSeen:serverTimestamp(),project,accountType:user.isAnonymous?"guest":"account"});
  if(token!==generation){await guard.cancel();await remove(node);return}
  registered=node;disconnect=guard;
  heartbeatTimer=setInterval(()=>{if(registered===node&&connection)set(ref(db,base+"/"+user.uid+"/"+sessionId+"/lastSeen"),serverTimestamp()).catch(()=>{});},60000);
 }catch(error){say("접속자 등록 실패 · Firebase Rules 확인 ("+(error.code||"연결 오류")+")")}
}
onAuthStateChanged(auth,async user=>{
 if(user){start(user);recordVisitor(user);return}
 if(durationTimer)clearInterval(durationTimer);
 durationTimer=null;recordedVisitorUid=null;
 // Guests count only when anonymous Firebase sign-in is enabled.
 try{await signInAnonymously(auth)}catch(error){say("게스트 집계 비활성 · 익명 인증 설정 확인 ("+(error.code||"인증 실패")+")")}
});
document.addEventListener("visibilitychange",()=>{
 const uid=auth.currentUser?.uid;
 if(document.visibilityState==="hidden")accumulateDuration(uid,{allowHidden:true});
 else lastActiveTick=Date.now();
});
window.addEventListener("pagehide",()=>{
 if(registered)remove(registered).catch(()=>{});
 accumulateDuration(auth.currentUser?.uid,{allowHidden:true});
});

/* Administrator presence inspector: UI gate only, not a Firebase security boundary. */
const presenceRoot=document.getElementById("fw-live-presence");
let adminUnlocked=false,profileCache=new Map(),profileLoad=0;
setInterval(()=>{if(adminUnlocked)renderAdmin();},30000);
if(presenceRoot){
 const trigger=document.createElement("button");
 trigger.type="button";trigger.textContent="확인";trigger.title="접속자와 누적 방문 통계 확인";trigger.setAttribute("aria-label","접속자와 누적 방문 통계 확인");
 trigger.style.cssText="border:0;background:#eef0ff;color:#3439bd;border-radius:999px;padding:3px 6px;font:inherit;font-size:10px;line-height:1.3;font-weight:650;cursor:pointer;white-space:nowrap";
 presenceRoot.appendChild(trigger);
 const panel=document.createElement("section");panel.hidden=true;
 panel.style.cssText="position:fixed;z-index:10002;top:10vh;left:50%;transform:translateX(-50%);width:min(92vw,540px);max-height:80vh;overflow:auto;padding:22px;background:white;color:#242842;border:1px solid #dce1ee;border-radius:20px;box-shadow:0 20px 75px #15204055;text-align:left";
 panel.innerHTML='<button type="button" id="presence-close" style="float:right;border:0;background:transparent;font-size:23px;cursor:pointer" aria-label="닫기">×</button><h2 style="margin:0 0 10px">📊 접속 통계</h2><form id="presence-code-form"><label for="presence-code">확인 코드</label><input id="presence-code" type="password" autocomplete="off" required style="display:block;margin:8px 0;padding:12px;width:100%;box-sizing:border-box;border:1px solid #ccd2e2;border-radius:10px"><button type="submit" style="background:#3439bd;color:white;border:0;border-radius:10px;padding:10px 18px;cursor:pointer">확인</button></form><p id="presence-message" role="status" style="font-size:13px;color:#64708a"></p><div id="presence-list" hidden></div><div id="visitor-list" hidden></div><p style="font-size:11px;color:#687388">공통 접속 기록이 활성화된 게임 기준 · 계정에 여러 세션이 있으면 각 위치가 표시됩니다.</p>';
 document.body.appendChild(panel);
 const codeForm=panel.querySelector("#presence-code-form"),message=panel.querySelector("#presence-message"),list=panel.querySelector("#presence-list");
 trigger.addEventListener("click",()=>{panel.hidden=false;if(adminUnlocked)renderAdmin();else panel.querySelector("#presence-code").focus()});
 panel.querySelector("#presence-close").addEventListener("click",()=>{panel.hidden=true;adminUnlocked=false;codeForm.hidden=false;list.hidden=true;panel.querySelector("#visitor-list").hidden=true;panel.querySelector("#presence-code").value="";profileLoad++});
 codeForm.addEventListener("submit",event=>{
  event.preventDefault();
  if(panel.querySelector("#presence-code").value!=="asdf1340"){message.textContent="확인 코드가 올바르지 않습니다.";return}
  adminUnlocked=true;codeForm.hidden=true;list.hidden=false;panel.querySelector("#visitor-list").hidden=false;message.textContent="현재 접속 및 누적 방문 통계 · 화면 종료 시 잠금";
  renderAdmin();
 });
}
function renderAdmin(){
 if(!adminUnlocked||!presenceRoot)return;
 const list=document.getElementById("presence-list");if(!list)return;
 const entries=Object.entries(latestSessions).filter(([,sessions])=>sessionEntries(sessions).length);
 list.replaceChildren();
 const header=document.createElement("p");header.style.fontWeight="700";const gameCounts={};for(const [,sessions] of entries){for(const game of new Set(activeEntries(sessions).map(v=>typeof v?.project==="string"?(v.project==="Formwheel"?"Hub":v.project.replace(/^Formwheel_/i,"")):"알 수 없음"))){gameCounts[game]=(gameCounts[game]||0)+1}}header.textContent="최근 5분 접속 확인 "+entries.filter(([,s])=>activeEntries(s).length).length+"명 · 위치별 "+Object.entries(gameCounts).map(([k,v])=>k+" "+v+"명").join(" / ");list.appendChild(header);
 renderVisitorAdmin();
 if(!entries.length){const empty=document.createElement("p");empty.textContent="현재 기록된 접속자가 없습니다.";list.appendChild(empty);return}
 entries.slice(0,200).forEach(([uid,sessions])=>{
  const values=sessionEntries(sessions);
  const line=document.createElement("div");line.style.cssText="padding:12px 0;border-top:1px solid #e7eaf1";
  const name=document.createElement("strong");
  const label=profileCache.get(uid);
  const kind=values.some(x=>x.accountType==="account")?"로그인 기록":values.some(x=>x.accountType==="guest")?"익명 게스트": "계정 유형 기록 없음";
  const self=auth.currentUser?.uid===uid?" · 내 현재 계정":"";
  name.textContent="👤 "+(label||"닉네임 확인 안 됨")+" ("+kind+self+")";line.appendChild(name);
  const detail=document.createElement("div");detail.style.cssText="font-size:12px;color:#6b7280;margin-top:5px";
  const joined=values.map(x=>typeof x.joinedAt==="number"?x.joinedAt:null).filter(Boolean);
  const first=joined.length?new Date(Math.min(...joined)).toLocaleString("ko-KR"):"확인 불가";
  const locations=[...new Set(values.map(x=>typeof x.project==="string"?(x.project==="Formwheel"?"Hub":x.project.replace(/^Formwheel_/i,"")):"알 수 없음"))];
  const fresh=values.filter(isFresh).length;
  const legacy=values.filter(v=>stateOf(v)==="legacy").length;
  const stale=values.filter(v=>stateOf(v)==="stale").length;
  const last=Math.max(0,...values.map(v=>typeof v.lastSeen==="number"?v.lastSeen:0));
  const status=fresh?"🟢 최근 접속 확인":stale?"⚪ 5분 이상 갱신 없음": "❔ 이전 버전 기록 · 상태 불명";
  detail.textContent=status+" | 📍 "+locations.join(" · ")+" | "+values.length+"개 세션 (활성 "+fresh+", 오래됨 "+stale+", 미확인 "+legacy+") · 최초 접속 "+first+(last?" · 마지막 확인 "+new Date(last).toLocaleString("ko-KR"):"");line.appendChild(detail);list.appendChild(line);
  if(!profileCache.has(uid)&&values.some(v=>v.accountType==="account"||!v.accountType))loadName(uid);
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

function renderVisitorAdmin(){
 const root=document.getElementById("visitor-list");if(!root||!adminUnlocked)return;
 root.replaceChildren();
 const items=visitorEntries().sort((a,b)=>(b[1].firstSeen||0)-(a[1].firstSeen||0));
 const title=document.createElement("h3");title.textContent="📈 누적 고유 방문자 "+items.length.toLocaleString("ko-KR")+"명";root.appendChild(title);
 const subtitle=document.createElement("p");subtitle.style.cssText="font-size:12px;color:#687388";subtitle.textContent="집계 기능 적용 이후 기준 · 접속 시간은 계측 적용 후부터 합산(15초 간격) · 일부 프로젝트는 적용 전 기록 제외 · 과거 시간 복원 불가 · UID당 1명";root.appendChild(subtitle);
 const guests=items.filter(([,v])=>v.accountType==="guest").length;
 const summary=document.createElement("p");summary.textContent="로그인/기타 "+(items.length-guests)+"명 · 게스트 "+guests+"명";root.appendChild(summary);
 if(!items.length){const empty=document.createElement("p");empty.textContent="아직 수집된 누적 방문 기록이 없습니다.";root.appendChild(empty);return}
 items.slice(0,100).forEach(([uid,v],index)=>{
  const p=document.createElement("div");p.style.cssText="padding:8px 0;border-top:1px solid #e7eaf1;font-size:12px";
  const when=Number.isFinite(v.firstSeen)?new Date(v.firstSeen).toLocaleString("ko-KR"):"날짜 미확인";
  const duration=Number.isFinite(v.totalMs)?" · ⏱ 누적 접속 "+formatDuration(v.totalMs):" · ⏱ 누적 접속 미집계";
   const repeat=" · 재방문 "+Math.max(0,(Number(v.visitCount)||1)-1)+"회";
   const breakdown=Object.entries(v.projectMs||{}).filter(([,ms])=>Number(ms)>0).sort((a,b)=>b[1]-a[1]).map(([name,ms])=>name+" "+formatDuration(Number(ms))).join(" / ");
  p.textContent=(index+1)+". "+(v.accountType==="guest"?"게스트":"로그인/기타")+" · 최초 방문 "+when+duration+repeat+(breakdown?" · 📍 "+breakdown:"")+(uid===auth.currentUser?.uid?" · 내 계정":"");root.appendChild(p);
 });
 if(items.length>100){const rest=document.createElement("p");rest.textContent="최근 방문 100명만 표시합니다.";root.appendChild(rest)}
}
