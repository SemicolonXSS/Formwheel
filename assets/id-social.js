import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,set,update,push,serverTimestamp,onValue,query,orderByChild,limitToLast} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config),auth=getAuth(app),db=getDatabase(app),root="formwheelV2/socialFree";
const el=id=>document.getElementById(id),path=p=>ref(db,root+"/"+p),read=async p=>(await get(path(p))).val();
const games={Spy:"Spy",Battle:"Battle",GCrown:"GCrown","Dice Duel":"DiceDuel",Risk:"Risk"};
let me=null,initialized=false,generation=0,searchGeneration=0,stops=[],renderTimer=null,toastTimer=null;
let inbox={},sent={},invites={},blocks={},outgoing={},handle=null,ready=new Set();
const outbound=new Map(),friendNames=new Map(),seenInvites=new Set();
const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n};
const msg=text=>{if(el("social-status"))el("social-status").textContent=text};
function requireUser(){if(!me)throw Error("정식 계정으로 로그인해 주세요.");return me.uid;}
function button(title,fn){
 const b=node("button",title);b.type="button";
 b.addEventListener("click",async()=>{b.disabled=true;const ticket=generation;try{requireUser();await fn();}catch(e){if(ticket===generation)msg("작업 실패: "+(e.code||e.message));}finally{b.disabled=false;}});
 return b;
}
const fill=(id,rows,empty,render)=>{const box=el(id);if(!box)return;box.replaceChildren();if(!rows.length)box.append(node("p",empty));else rows.forEach(row=>box.append(render(row)))};
function scheduleRender(){clearTimeout(renderTimer);renderTimer=setTimeout(renderState,40);}
async function resolveFriend(uid){
 if(friendNames.has(uid))return friendNames.get(uid);
 const pending=(async()=>{
  try{const value=await read("handleByUid/"+uid);if(typeof value==="string"&&/^[a-z0-9_]{3,20}$/.test(value))return "@"+value;}catch{}
  try{const p=(await get(ref(db,"formwheelV2/hubProfiles/"+uid))).val();if(typeof p?.nickname==="string"&&p.nickname.trim())return "#"+p.nickname.trim().slice(0,16);}catch{}
  return "이름 없는 사용자";
 })();
 friendNames.set(uid,pending);
 return pending;
}
function validInvite(i){return i&&Object.hasOwn(games,i.game)&&i.status==="pending"&&Date.now()<i.expiresAt&&!blocks[i.from];}
function gameLink(game){const a=node("a","게임 열기 ↗");a.href="https://semicolonxss.github.io/Formwheel_"+games[game]+"/";a.target="_blank";a.rel="noopener noreferrer";return a;}
async function respondInvite(i,status){
 const uid=requireUser();if(!validInvite(i))throw Error("만료되었거나 이미 처리한 초대입니다.");
 await set(path("invites/"+uid+"/"+i.id+"/status"),status);
 msg(status==="accepted"?"초대를 수락했어요. 게임을 연 뒤 친구와 방 코드를 공유해 주세요.":"초대를 거절했어요.");
}
function showInvite(i,name){
 if(el("fw-invite-toast"))return;
 const toast=node("div","🎮 "+name+"님이 "+i.game+" 게임에 초대했어요!");toast.id="fw-invite-toast";toast.setAttribute("role","alert");
 toast.style.cssText="position:fixed;z-index:999999;top:12px;left:50%;transform:translateX(-50%);width:min(420px,calc(100vw - 24px));box-sizing:border-box;background:white;color:#242347;border:2px solid #a78bfa;border-radius:16px;box-shadow:0 10px 35px #2224;padding:16px";
 const ticket=generation;
 const close=()=>{toast.remove();clearTimeout(toastTimer);if(ticket===generation)scheduleRender();};
 toast.append(node("p","수락 후 게임을 열고 방 코드를 공유해 주세요."));
 toast.append(button("수락",async()=>{await respondInvite(i,"accepted");close();}),button("거절",async()=>{await respondInvite(i,"declined");close();}));
 const dismiss=node("button","닫기");dismiss.type="button";dismiss.onclick=close;toast.append(dismiss);document.body.append(toast);
 seenInvites.add(i.id);
 try{sessionStorage.setItem("fw:social:seen:"+me.uid,JSON.stringify([...seenInvites].slice(-100)));}catch{}
 toastTimer=setTimeout(close,8000);
}
async function removeFriend(uid){
 const self=requireUser();
 await update(path(""),{["requests/"+self+"/"+uid]:null,["requests/"+uid+"/"+self]:null,["sent/"+self+"/"+uid]:null});
 msg("친구를 삭제했어요.");
}
async function blockFriend(uid){const self=requireUser();await set(path("blocks/"+self+"/"+uid),true);el("fw-invite-toast")?.remove();msg("차단했어요. 요청과 초대가 숨겨지고 새 요청을 받지 않아요.");}
async function renderState(){
 if(!me||!["inbox","sent","invites","blocks","handle"].every(k=>ready.has(k)))return;
 const ticket=generation;
 const pending=Object.keys(inbox).filter(uid=>inbox[uid]?.status==="pending"&&!blocks[uid]);
 const friends=[...new Set([...Object.keys(inbox).filter(uid=>inbox[uid]?.status==="accepted"),...Object.keys(outgoing).filter(uid=>outgoing[uid]?.status==="accepted")])].filter(uid=>!blocks[uid]);
 const recent=Object.entries(invites).map(([id,v])=>({id,...v})).filter(i=>!blocks[i.from]&&Object.hasOwn(games,i.game)).sort((a,b)=>b.createdAt-a.createdAt).slice(0,40);
 const ids=[...new Set([...pending,...friends,...Object.keys(blocks),...recent.map(i=>i.from)])];
 const names=new Map(await Promise.all(ids.map(async uid=>[uid,await resolveFriend(uid)])));
 if(ticket!==generation||!me)return;
 if(el("my-handle"))el("my-handle").textContent=handle?"@"+handle:"아직 공개 ID가 없습니다.";
 fill("friend-inbox",pending,"받은 친구 요청이 없어요.",uid=>{
  const line=node("div","친구 요청 · "+names.get(uid)+" ");
  line.append(button("수락",()=>set(path("requests/"+requireUser()+"/"+uid+"/status"),"accepted")),button("거절",()=>set(path("requests/"+requireUser()+"/"+uid+"/status"),"declined")),button("차단",()=>blockFriend(uid)));return line;
 });
 fill("friend-list",friends,"등록된 친구가 없어요.",uid=>{
  const line=node("div","친구 · "+names.get(uid)+" ");line.style.margin="10px 0";
  line.append(button("초대",async()=>{
   const self=requireUser(),game=el("invite-game").value,minutes=Number(el("invite-minutes").value);
   if(!Object.hasOwn(games,game)||![5,10,15,30].includes(minutes))throw Error("초대 설정을 확인해 주세요.");
   const item=push(path("invites/"+uid));await set(item,{from:self,game,status:"pending",createdAt:serverTimestamp(),expiresAt:Date.now()+minutes*60000,reserve:false});
   msg("초대를 보냈어요. 게임 방 코드는 친구와 따로 공유해 주세요.");
  }),button("친구 삭제",()=>removeFriend(uid)),button("차단",()=>blockFriend(uid)));return line;
 });
 fill("friend-blocked",Object.keys(blocks).filter(uid=>blocks[uid]===true),"차단한 사용자가 없어요.",uid=>{const line=node("div",names.get(uid)+" ");line.append(button("차단 해제",()=>set(path("blocks/"+requireUser()+"/"+uid),null)));return line;});
 fill("invite-list",recent,"받은 게임 초대가 없어요.",i=>{
  const status=i.status==="pending"?(validInvite(i)?"대기 중":"만료됨"):({accepted:"수락됨",declined:"거절됨"}[i.status]||i.status);
  const line=node("div",names.get(i.from)+" · "+i.game+" · "+status+" ");
  if(validInvite(i))line.append(button("수락",()=>respondInvite(i,"accepted")),button("거절",()=>respondInvite(i,"declined")));
  if(i.status==="accepted")line.append(gameLink(i.game));
  if(!validInvite(i))line.append(button("지우기",()=>set(path("invites/"+requireUser()+"/"+i.id),null)));
  return line;
 });
 const fresh=recent.find(i=>validInvite(i)&&!seenInvites.has(i.id));
 if(fresh&&document.visibilityState==="visible")showInvite(fresh,names.get(fresh.from));
}
function watchOutbound(uid,ticket){
 const wanted=new Set(Object.keys(sent).filter(id=>sent[id]===true));
 for(const [id,off] of outbound)if(!wanted.has(id)){off();outbound.delete(id);delete outgoing[id];}
 for(const id of wanted)if(!outbound.has(id))outbound.set(id,onValue(path("requests/"+id+"/"+uid),snap=>{if(ticket!==generation)return;outgoing[id]=snap.val();scheduleRender();},e=>{if(ticket===generation)msg("보낸 요청 조회 실패: "+e.code);}));
}
function connect(user){
 const ticket=++generation;searchGeneration++;
 stops.forEach(off=>off());stops=[];outbound.forEach(off=>off());outbound.clear();
 clearTimeout(renderTimer);clearTimeout(toastTimer);el("fw-invite-toast")?.remove();friendNames.clear();seenInvites.clear();
 me=user&&!user.isAnonymous?user:null;inbox={};sent={};invites={};blocks={};outgoing={};handle=null;ready=new Set();
 ["friend-search-result","fw-public-badges"].forEach(id=>el(id)?.replaceChildren());
 if(!me){msg("Google 또는 이메일 계정으로 로그인해 주세요.");if(el("my-handle"))el("my-handle").textContent="로그인 후 이용 가능";["friend-inbox","friend-list","friend-blocked","invite-list"].forEach(id=>{if(el(id))el(id).textContent="정식 계정 로그인 후 이용 가능";});return;}
 const uid=me.uid;
 try{for(const id of JSON.parse(sessionStorage.getItem("fw:social:seen:"+uid)||"[]"))seenInvites.add(id);}catch{}
 msg("친구와 초대를 실시간으로 확인하고 있어요.");
 for(const [key,source,assign] of [
  ["handle",path("handleByUid/"+uid),v=>{handle=v;}],
  ["inbox",path("requests/"+uid),v=>{inbox=v||{};}],
  ["sent",path("sent/"+uid),v=>{sent=v||{};watchOutbound(uid,ticket);}],
  ["blocks",path("blocks/"+uid),v=>{blocks=v||{};}],
  ["invites",query(path("invites/"+uid),orderByChild("createdAt"),limitToLast(40)),v=>{invites=v||{};}]
 ])stops.push(onValue(source,snap=>{if(ticket!==generation)return;assign(snap.val());ready.add(key);scheduleRender();},e=>{if(ticket!==generation)return;ready.add(key);msg("일부 친구 기능 조회 실패: "+e.code+" · 최신 Firebase Rules 적용을 확인해 주세요.");scheduleRender();}));
}
el("handle-button")?.addEventListener("click",async()=>{
 const ticket=generation;
 try{const uid=requireUser(),value=el("claim-handle").value.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(value))throw Error("ID는 영문 소문자·숫자·_ 3~20자입니다.");
 const existing=await read("handleByUid/"+uid);if(ticket!==generation)return;if(existing)throw Error("이미 등록한 ID: @"+existing);
 await update(path(""),{["handles/"+value]:uid,["handleByUid/"+uid]:value});if(ticket===generation)msg("공개 ID를 등록했어요.");
 }catch(e){if(ticket===generation)msg("ID 등록 실패: "+(e.code||e.message));}
});
el("friend-find")?.addEventListener("click",async()=>{
 const ticket=generation,searchTicket=++searchGeneration,result=el("friend-search-result");result.replaceChildren();el("fw-public-badges")?.replaceChildren();
 try{const self=requireUser(),value=el("friend-query").value.trim().replace(/^[@#]/,"").toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(value))throw Error("올바른 ID를 입력해 주세요.");
 const uid=await read("handles/"+value);if(ticket!==generation||searchTicket!==searchGeneration)return;if(!uid||uid===self){result.textContent="검색 결과가 없어요.";return;}
 if(blocks[uid]){result.textContent="차단한 사용자예요. 차단 목록에서 해제할 수 있어요.";return;}
 const name=await resolveFriend(uid);if(ticket!==generation||searchTicket!==searchGeneration)return;
 window.dispatchEvent(new CustomEvent("fw:friend-found",{detail:{uid,nickname:name}}));
 result.append(node("span",name+" "),button("친구 신청",async()=>{
  const from=requireUser();await update(path(""),{["requests/"+uid+"/"+from]:{from,to:uid,status:"pending",at:serverTimestamp()},["sent/"+from+"/"+uid]:true});msg("친구 요청을 보냈어요.");
 }));
 }catch(e){if(ticket===generation&&searchTicket===searchGeneration)result.textContent="검색 실패: "+(e.code||e.message);}
});
el("social-refresh")?.addEventListener("click",()=>{if(me){friendNames.clear();scheduleRender();msg("실시간 목록을 새로 표시했어요.");}});
// Refresh expiry labels only; database changes arrive through onValue subscriptions.
setInterval(()=>{if(me&&document.visibilityState==="visible")scheduleRender();},30000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")scheduleRender();});
onAuthStateChanged(auth,user=>{initialized=true;connect(user);},e=>{initialized=true;msg("로그인 확인 실패: "+(e.code||e.message));});
setTimeout(()=>{if(!initialized)msg("로그인 상태 확인 지연: 네트워크를 확인해 주세요.");},15000);
