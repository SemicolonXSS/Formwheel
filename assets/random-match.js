import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,set,remove,runTransaction,onValue,onDisconnect} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps()[0]||initializeApp(config),db=getDatabase(app),auth=getAuth(app);
const ROOT="formwheelV2/matchmaking",GAMES=[
["reflex","⚡ Reflex"],["battle","⚔️ Battle"],["territory","🎯 Territory"],["risk","🎲 Risk"],["gcrown","👑 GCrown"],["time","⏱️ Time"],["bomb","💣 Bomb"]];
const $=id=>document.getElementById(id),status=$("fw-match-status"),codeEl=$("fw-match-code");
const token=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now();
const localId=sessionStorage.fwMatchTabId||(sessionStorage.fwMatchTabId=token());
let active=null,unsubscribe=null,heartbeat=null,authUser=null,matched=false;
onAuthStateChanged(auth,u=>{authUser=u&&!u.isAnonymous?u:null});
function say(t){status.textContent=t}
function badge(kind){
 if(!authUser)return;
 const uid=authUser.uid,key=kind==="quick"?"quickMatch1":"friendRandom1";
 runTransaction(ref(db,"formwheelV2/achievementStats/"+uid+"/"+key),v=>v? v : 1,{applyLocally:false}).catch(e=>console.warn("매칭 배지 저장 실패",e));
}
function url(game){return "https://semicolonxss.github.io/Formwheel_"+({reflex:"Reflex",battle:"Battle",territory:"Territory",risk:"Risk",gcrown:"GCrown",time:"Time",bomb:"Bomb"}[game])+"/"}
function renderMatch(d){
 if(!d)return;
 if(d.status==="matched"){
 matched=true;clearInterval(heartbeat);heartbeat=null;onDisconnect(ref(db,ROOT+"/"+active.kind+"/"+active.code)).cancel().catch(()=>{});
 const g=GAMES.find(x=>x[0]===d.game);
 say("🎉 매칭 완료! "+(g?.[1]||d.game)+" 대전이 선택됐어요.");
 $("fw-match-launch").hidden=false;$("fw-match-launch").href=url(d.game)+"?fwMatch="+encodeURIComponent(active.code)+"&fwKind="+active.kind+"&fwSide="+(d.owner===localId?"owner":"guest");
 badge(active.kind);
 }else{
 say(active.kind==="quick"?"다른 플레이어를 찾는 중이에요…":"친구가 코드를 입력할 때까지 기다리는 중이에요.");
 }
}
function watch(kind,code){
 if(unsubscribe)unsubscribe(); active={kind,code};matched=false;
 $("fw-match-launch").hidden=true;
 codeEl.textContent=kind==="friend"?code:"자동 매칭 중";
 $("fw-match-panel").hidden=false;$("fw-match-actions").hidden=true;
 unsubscribe=onValue(ref(db,ROOT+"/"+kind+"/"+code),s=>{
  if(!s.exists()){if(!matched)say("대기실이 종료됐어요.");return}
  renderMatch(s.val());
 },e=>say("실시간 연결 오류: "+e.message));
 heartbeat=setInterval(async()=>{
  if(!active||matched)return;
  const r=ref(db,ROOT+"/"+kind+"/"+code);
  try{await runTransaction(r,v=>{if(!v||v.status!=="waiting")return; if(v.owner===localId){v.updatedAt=Date.now();return v}}, {applyLocally:false})}catch(e){say("연결 재시도 중: "+e.message)}
 },15000);
}
async function stop(){
 const prev=active;
 active=null;if(unsubscribe){unsubscribe();unsubscribe=null}clearInterval(heartbeat);heartbeat=null;
 $("fw-match-panel").hidden=true;$("fw-match-actions").hidden=false;
 if(prev&&!matched)try{
 const r=ref(db,ROOT+"/"+prev.kind+"/"+prev.code);
 await runTransaction(r,v=>{
  if(!v||v.status!=="waiting")return;
  if(v.owner===localId||v.guest===localId)return null;
 },{applyLocally:false});
 }catch(e){console.warn("대기실 취소 실패",e)}
 matched=false;
}
$("fw-match-stop").onclick=stop;
$("fw-match-quick").onclick=async()=>{
 if(active)await stop();
 $("fw-match-actions").hidden=true;say("공개 대기열 검색 중…");
 try{
  const list=(await get(ref(db,ROOT+"/quick"))).val()||{};
  const now=Date.now();
  for(const [key,item] of Object.entries(list)){
   if(item?.status!=="waiting"||now-item.updatedAt>45000||item.owner===localId)continue;
   const claim=await runTransaction(ref(db,ROOT+"/quick/"+key),v=>{
    if(!v||v.status!=="waiting"||Date.now()-v.updatedAt>45000||v.owner===localId)return;
    v.guest=localId;v.game=GAMES[Math.floor(Math.random()*GAMES.length)][0];v.status="matched";return v;
   },{applyLocally:false});
   if(claim.committed){watch("quick",key);return}
  }
  const code=token().replace(/-/g,"").slice(0,15);
  await set(ref(db,ROOT+"/quick/"+code),{owner:localId,status:"waiting",createdAt:now,updatedAt:now});
  // Keep matched lobby available when a player navigates to the game.
  watch("quick",code);
 }catch(e){$("fw-match-actions").hidden=false;say("매칭 시작 실패: "+e.message)}
};
$("fw-match-friend").onclick=async()=>{
 if(active)await stop();
 try{
  let code="",r;
  for(let i=0;i<10;i++){code=String(Math.floor(100000+Math.random()*900000));r=ref(db,ROOT+"/friend/"+code);if(!(await get(r)).exists())break;}
  if((await get(r)).exists())throw Error("코드 발급 실패");
  await set(r,{owner:localId,status:"waiting",createdAt:Date.now(),updatedAt:Date.now()});
  // The room is expired through timestamp checks instead of disconnect deletion.
  watch("friend",code);
 }catch(e){say("코드 생성 실패: "+e.message)}
};
$("fw-match-friend-join").onclick=async()=>{
 const code=$("fw-match-input").value.trim();
 if(!/^\d{6}$/.test(code)){say("6자리 코드를 입력해 주세요.");return}
 try{
  if(active)await stop();
  const r=ref(db,ROOT+"/friend/"+code);
  const result=await runTransaction(r,v=>{
   if(!v||v.status!=="waiting"||Date.now()-v.updatedAt>45000||v.owner===localId)return;
   v.guest=localId;v.game=GAMES[Math.floor(Math.random()*GAMES.length)][0];v.status="matched";return v;
  },{applyLocally:false});
  if(!result.committed){say("없는 코드이거나 이미 매칭이 완료된 방이에요.");return}
  watch("friend",code);
 }catch(e){say("코드 참가 실패: "+e.message)}
};
$("fw-match-copy").onclick=()=>navigator.clipboard.writeText(codeEl.textContent).then(()=>say("코드를 복사했어요."));
