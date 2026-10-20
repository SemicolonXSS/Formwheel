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


/* Dashboard filters are kept outside render so live Firebase updates don't reset them. */
const visitorView={period:"all",sort:"newest",type:"all",query:"",page:0};
const VISITOR_PAGE_SIZE=25;
const kstDay=value=>{
 const n=Number(value);
 return Number.isFinite(n)&&n>0?new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(n)):"";
};
const safeNumber=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
const displayWhen=value=>Number.isFinite(Number(value))&&Number(value)>0?new Date(Number(value)).toLocaleString("ko-KR"):"기록 없음";
const metric=(label,value)=>{const item=document.createElement("div");item.style.cssText="padding:12px;border-radius:12px;background:#f4f6fd;min-width:0";const l=document.createElement("div");l.style.cssText="font-size:11px;color:#626c83";l.textContent=label;const v=document.createElement("strong");v.style.cssText="font-size:19px;display:block;margin-top:4px;overflow-wrap:anywhere";v.textContent=value;item.append(l,v);return item};
function renderVisitorAdmin(){
 const root=document.getElementById("visitor-list");if(!root||!adminUnlocked)return;
 root.replaceChildren();
 const now=Date.now(),today=kstDay(now);
 const all=visitorEntries().map(([uid,v])=>({uid,v,first:safeNumber(v.firstSeen),last:safeNumber(v.lastVisitAt),ms:safeNumber(v.totalMs),visits:Math.max(1,safeNumber(v.visitCount)),projects:v.projectMs&&typeof v.projectMs==="object"?v.projectMs:{}}));
 const start=visitorView.period==="7d"?now-7*86400000:visitorView.period==="30d"?now-30*86400000:visitorView.period==="today"?new Date(today+"T00:00:00+09:00").getTime():0;
 // Historical daily unique traffic cannot be reconstructed; firstSeen measures new visitors.
 const newPeriod=all.filter(x=>x.first>=start);
 const recentlySeen=all.filter(x=>x.last>=start);
 const returned=recentlySeen.filter(x=>x.first<start);
 const totalMs=all.reduce((s,x)=>s+x.ms,0);
 const title=document.createElement("h3");title.textContent="📊 방문자 분석 · "+all.length.toLocaleString("ko-KR")+"명";root.appendChild(title);
 const note=document.createElement("p");note.style.cssText="font-size:12px;color:#687388;line-height:1.65";note.textContent="한국 시간 기준 · 방문자는 Firebase UID 기준(기기 변경·게스트 재설치 시 달라질 수 있음). 30분 이상 간격을 새 세션으로 추정합니다. 기존에 수집하지 않은 접속·체류 기록은 복원할 수 없습니다.";root.appendChild(note);
 const toolbar=document.createElement("div");toolbar.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0";
 function selector(aria,options,current,key){const s=document.createElement("select");s.setAttribute("aria-label",aria);s.style.cssText="font:inherit;font-size:12px;padding:9px;border:1px solid #ccd2e2;border-radius:9px;max-width:100%";options.forEach(([value,label])=>{const o=document.createElement("option");o.value=value;o.textContent=label;s.appendChild(o)});s.value=current;s.onchange=()=>{visitorView[key]=s.value;visitorView.page=0;renderVisitorAdmin()};toolbar.appendChild(s);}
 selector("분석 기간",[["all","전체 기간"],["today","오늘"],["7d","최근 7일"],["30d","최근 30일"]],visitorView.period,"period");
 selector("방문자 구분",[["all","전체 유형"],["guest","게스트"],["account","로그인/기타"],["repeat","재방문 기록 있음"]],visitorView.type,"type");
 selector("정렬",[["newest","최근 최초 방문"],["recent","마지막 방문"],["duration","체류 시간"],["visits","방문 횟수"]],visitorView.sort,"sort");
 root.appendChild(toolbar);
 const selectedPeriod=visitorView.period==="all"?"전체 기록":visitorView.period==="today"?"오늘":visitorView.period==="7d"?"7일":"30일";
 const statsTable=document.createElement("table");statsTable.style.cssText="width:100%;border-collapse:collapse;font-size:12px;margin:6px 0 10px;table-layout:fixed";
 const rows=[
  [["누적 방문자",all.length.toLocaleString("ko-KR")+"명"],[selectedPeriod+" 신규",newPeriod.length+"명"]],
  [[selectedPeriod+" 최근 활동",recentlySeen.length+"명"],["기존 방문자 활동",visitorView.period==="all"?"—":returned.length+"명"]],
  [["평균 누적 체류",formatDuration(all.length?totalMs/all.length:0)],["재방문 기록",all.filter(x=>x.visits>1).length+"명"]],
  [["총 기록 세션",all.reduce((sum,x)=>sum+x.visits,0).toLocaleString("ko-KR")+"회"],["게스트",all.filter(x=>x.v.accountType==="guest").length+"명"]]
 ];
 rows.forEach((cells,i)=>{const tr=document.createElement("tr");cells.forEach(([name,value])=>{const td=document.createElement("td");td.style.cssText="padding:7px 8px;border-bottom:1px solid #e7eaf1;vertical-align:middle;width:50%";const nameEl=document.createElement("span");nameEl.style.cssText="font-size:11px;color:#687388;display:block";nameEl.textContent=name;const valueEl=document.createElement("strong");valueEl.style.cssText="font-size:14px;display:block;margin-top:2px";valueEl.textContent=value;td.append(nameEl,valueEl);tr.appendChild(td)});statsTable.appendChild(tr)});root.appendChild(statsTable);
 const goalPct=Math.min(100,all.length/300*100);
 const goalWrap=document.createElement("div");goalWrap.style.cssText="padding:10px 11px;background:#f4f6fd;border-radius:10px;margin:8px 0 16px";
 const goalHeader=document.createElement("div");goalHeader.style.cssText="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px;margin-bottom:7px";
 const goalLabel=document.createElement("strong");goalLabel.textContent="🎯 300명 방문자 목표";const goalValue=document.createElement("span");goalValue.textContent=all.length.toLocaleString("ko-KR")+" / 300명 · "+goalPct.toFixed(1)+"%";goalHeader.append(goalLabel,goalValue);
 const progressTrack=document.createElement("div");progressTrack.setAttribute("role","progressbar");progressTrack.setAttribute("aria-label","300명 방문자 목표 달성률");progressTrack.setAttribute("aria-valuemin","0");progressTrack.setAttribute("aria-valuemax","300");progressTrack.setAttribute("aria-valuenow",String(Math.min(300,all.length)));progressTrack.style.cssText="height:9px;background:#dce1f3;border-radius:999px;overflow:hidden";
 const progressFill=document.createElement("div");progressFill.style.cssText="height:100%;width:"+goalPct+"%;background:linear-gradient(90deg,#6069dc,#8b5cf6);border-radius:999px;transition:width .3s";progressTrack.appendChild(progressFill);goalWrap.append(goalHeader,progressTrack);root.appendChild(goalWrap);
 const chartTitle=document.createElement("strong");chartTitle.textContent="📈 신규 방문자 추이 (최근 14일)";root.appendChild(chartTitle);
 const buckets=[];for(let i=13;i>=0;i--){const d=new Date(now-i*86400000);buckets.push({day:kstDay(d.getTime()),count:0});}
 const byDay=new Map(buckets.map(x=>[x.day,x]));
 all.forEach(x=>{const b=byDay.get(kstDay(x.first));if(b)b.count++});
 const max=Math.max(1,...buckets.map(x=>x.count));
 const chart=document.createElement("div");chart.style.cssText="display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:3px;align-items:end;height:110px;margin:12px 0 5px;border-bottom:1px solid #c9cfdd";
 buckets.forEach(b=>{const cell=document.createElement("div");cell.title=b.day+" 신규 "+b.count+"명";cell.style.cssText="display:flex;flex-direction:column;align-items:center;justify-content:end;height:100%;min-width:0";const n=document.createElement("span");n.textContent=b.count||"";n.style.cssText="font-size:9px;color:#525b74";const bar=document.createElement("div");bar.style.cssText="width:100%;max-width:28px;border-radius:4px 4px 0 0;background:#6069dc;height:"+Math.max(2,Math.round(b.count/max*83))+"px";cell.append(n,bar);chart.appendChild(cell)});root.appendChild(chart);
 const axis=document.createElement("div");axis.style.cssText="display:flex;justify-content:space-between;font-size:11px;color:#697388;margin-bottom:16px";axis.textContent=buckets[0].day+" → "+buckets[13].day;root.appendChild(axis);
 const projectTotals=new Map();all.forEach(x=>Object.entries(x.projects).forEach(([name,ms])=>{const time=safeNumber(ms);if(time)projectTotals.set(name,(projectTotals.get(name)||0)+time)}));
 const ranking=[...projectTotals].sort((a,b)=>b[1]-a[1]).slice(0,8);
 const projectTitle=document.createElement("strong");projectTitle.textContent="🏆 프로젝트별 기록 체류 시간 TOP 8";root.appendChild(projectTitle);
 const rankingEl=document.createElement("div");rankingEl.style.cssText="margin:8px 0 16px;font-size:12px";
 if(!ranking.length){rankingEl.textContent="수집된 프로젝트 체류 시간이 없습니다."}
 ranking.forEach(([name,ms],i)=>{const line=document.createElement("div");line.style.cssText="padding:6px 0;border-bottom:1px solid #edf0f6";const bar=document.createElement("div");bar.style.cssText="height:5px;background:#e8eaf5;border-radius:5px;margin-top:4px;overflow:hidden";const fill=document.createElement("div");fill.style.cssText="height:100%;background:#6069dc;width:"+Math.max(1,ms/ranking[0][1]*100)+"%";bar.appendChild(fill);const caption=document.createElement("div");caption.textContent=(i+1)+". "+name+" · "+formatDuration(ms);line.append(caption,bar);rankingEl.appendChild(line)});root.appendChild(rankingEl);
 const header=document.createElement("strong");header.textContent="👥 개별 방문 기록";root.appendChild(header);
 const search=document.createElement("input");search.type="search";search.placeholder="UID 일부 검색 (관리용)";search.setAttribute("aria-label","방문자 검색");search.value=visitorView.query;search.style.cssText="display:block;box-sizing:border-box;width:100%;padding:10px;margin:9px 0;border:1px solid #ccd2e2;border-radius:10px;font:inherit;font-size:12px";search.onchange=()=>{visitorView.query=search.value.trim().toLowerCase();visitorView.page=0;renderVisitorAdmin()};root.appendChild(search);
 let filtered=all.filter(x=>visitorView.period==="all"||x.last>=start||x.first>=start).filter(x=>visitorView.type==="all"||(visitorView.type==="guest"?x.v.accountType==="guest":visitorView.type==="account"?x.v.accountType!=="guest":x.visits>1)).filter(x=>!visitorView.query||x.uid.toLowerCase().includes(visitorView.query));
 const order=visitorView.sort==="recent"?"last":visitorView.sort==="duration"?"ms":visitorView.sort==="visits"?"visits":"first";filtered.sort((a,b)=>b[order]-a[order]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/VISITOR_PAGE_SIZE));visitorView.page=Math.min(visitorView.page,pageCount-1);
 const summary=document.createElement("p");summary.style.cssText="font-size:11px;color:#687388";summary.textContent="조건에 맞는 방문자 "+filtered.length+"명 · "+(visitorView.page+1)+"/"+pageCount+" 페이지";root.appendChild(summary);
 for(const [index,x] of filtered.slice(visitorView.page*VISITOR_PAGE_SIZE,(visitorView.page+1)*VISITOR_PAGE_SIZE).entries()){
  const item=document.createElement("details");item.style.cssText="padding:9px 0;border-top:1px solid #e7eaf1;font-size:12px";
  const head=document.createElement("summary");head.style.cssText="cursor:pointer;line-height:1.7";head.textContent=(visitorView.page*VISITOR_PAGE_SIZE+index+1)+". "+(x.v.accountType==="guest"?"게스트":"로그인/기타")+(x.uid===auth.currentUser?.uid?" (내 계정)":"")+" · "+displayWhen(x.first)+" · "+formatDuration(x.ms);item.appendChild(head);
  const detail=document.createElement("div");detail.style.cssText="padding:7px 10px;line-height:1.8;color:#526079;overflow-wrap:anywhere";
  const projectList=Object.entries(x.projects).filter(([,ms])=>safeNumber(ms)>0).sort((a,b)=>safeNumber(b[1])-safeNumber(a[1])).map(([name,ms])=>name+" "+formatDuration(safeNumber(ms))).join(" / ");
  detail.textContent="마지막 방문: "+displayWhen(x.last)+" · 세션 추정 "+x.visits+"회 · 재방문 "+(x.visits-1)+"회 · 누적 접속 "+formatDuration(x.ms)+" · 프로젝트: "+(projectList||"기록 없음")+" · 식별자(일부): "+x.uid.slice(0,8)+"…";item.appendChild(detail);root.appendChild(item);
 }
 const pages=document.createElement("div");pages.style.cssText="display:flex;gap:8px;justify-content:center;margin:12px";
 for(const [label,delta] of [["← 이전",-1],["다음 →",1]]){const b=document.createElement("button");b.type="button";b.textContent=label;b.disabled=delta<0?visitorView.page===0:visitorView.page>=pageCount-1;b.style.cssText="padding:8px 12px;border-radius:9px;border:1px solid #ccd2e2;background:white;color:#3439bd;cursor:pointer";b.onclick=()=>{visitorView.page+=delta;renderVisitorAdmin()};pages.appendChild(b)}root.appendChild(pages);
 const caveat=document.createElement("p");caveat.style.cssText="font-size:11px;color:#7a8191;line-height:1.6";caveat.textContent="주의: 신규 방문 추이는 firstSeen 기준이며, 최근 활동 UID는 lastVisitAt 기준입니다. 과거 날짜별 전체 방문 횟수나 유입 경로는 현재 데이터만으로 알 수 없습니다. 관리자 확인 코드는 화면 표시용이며 데이터베이스 보안 권한을 대신하지 않습니다.";root.appendChild(caveat);
}
