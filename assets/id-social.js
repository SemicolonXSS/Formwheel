import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,set,runTransaction,push,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config),auth=getAuth(app),db=getDatabase(app),root="formwheelV2/socialFree";
const el=id=>document.getElementById(id),path=p=>ref(db,root+"/"+p),read=async p=>(await get(path(p))).val();
let me=null,initialized=false;
const msg=s=>{if(el("social-status"))el("social-status").textContent=s};
const node=(tag,value)=>{const n=document.createElement(tag);n.textContent=value;return n};
const button=(title,fn)=>{const b=node("button",title);b.type="button";b.addEventListener("click",async()=>{b.disabled=true;try{await fn();await refresh()}catch(e){msg("작업 실패: "+(e.code||e.message||"연결 확인 필요"))}finally{b.disabled=false}});return b};
const fill=(id,rows,empty,render)=>{const box=el(id);if(!box)return;box.replaceChildren();if(!rows.length)box.append(node("p",empty));else rows.forEach(row=>box.append(render(row)))};
function unavailable(reason){msg(reason);if(el("my-handle"))el("my-handle").textContent="현재 확인할 수 없습니다.";["friend-inbox","friend-list","invite-list"].forEach(id=>{if(el(id))el(id).textContent="목록을 불러올 수 없습니다. 새로고침을 눌러 주세요."})}
async function getFriends(){
 const [inbox,sent]=await Promise.all([read("requests/"+me.uid),read("sent/"+me.uid)]);
 const requests=Object.entries(inbox||{}).filter(([,v])=>v?.status==="pending").map(([uid])=>uid);
 const friends=new Set(Object.entries(inbox||{}).filter(([,v])=>v?.status==="accepted").map(([uid])=>uid));
 for(const uid of Object.keys(sent||{})){const r=await read("requests/"+uid+"/"+me.uid);if(r?.status==="accepted")friends.add(uid)}
 return {requests,friends:[...friends]};
}
async function refresh(){
 if(!me)return;
 msg("친구 목록 불러오는 중…");
 try{
 const [handle,data,invites]=await Promise.all([read("handleByUid/"+me.uid),getFriends(),read("invites/"+me.uid)]);
 el("my-handle").textContent=handle?"@"+handle:"아직 공개 ID가 없습니다.";
 const share=el("copy-friend-link");if(share){share.disabled=!handle;share.dataset.handle=handle||"";}
 fill("friend-inbox",data.requests,"받은 친구 요청이 없어요.",uid=>{const line=node("div","친구 요청 · "+uid.slice(0,12)+"… ");line.append(button("수락",()=>set(path("requests/"+me.uid+"/"+uid+"/status"),"accepted")),button("거절",()=>set(path("requests/"+me.uid+"/"+uid+"/status"),"declined")));return line});
 fill("friend-list",data.friends,"등록된 친구가 없어요.",uid=>{const line=node("div","친구 · "+uid.slice(0,12)+"… ");line.style.margin="10px 0";line.append(button("초대",async()=>{const game=el("invite-game").value,minutes=Number(el("invite-minutes").value),reserve=el("reserve").checked;const item=push(path("invites/"+uid));await set(item,{from:me.uid,game,status:"pending",createdAt:serverTimestamp(),expiresAt:Date.now()+minutes*60000,reserve});msg("게임 초대를 보냈어요. 게임 방 자동 입장은 아직 지원하지 않아요.")}));return line});
 fill("invite-list",Object.entries(invites||{}).map(([id,v])=>({id,...v})).sort((a,b)=>b.createdAt-a.createdAt).slice(0,40),"받은 게임 초대가 없어요.",i=>{const line=node("div",i.game+" · "+(i.status==="pending"&&Date.now()<i.expiresAt?"대기 중":i.status)+" ");if(i.status==="pending"&&Date.now()<i.expiresAt)line.append(button("수락",()=>set(path("invites/"+me.uid+"/"+i.id+"/status"),"accepted")),button("거절",()=>set(path("invites/"+me.uid+"/"+i.id+"/status"),"declined")));return line});
 msg("Firebase 무료 친구 시스템 연결됨");
 }catch(e){unavailable("친구 데이터 조회 실패: "+(e.code||e.message||"알 수 없는 오류")+". Firebase Rules 배포 여부를 확인해 주세요.")}
}
el("handle-button")?.addEventListener("click",async()=>{const handle=el("claim-handle").value.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(handle)){msg("ID는 영문 소문자·숫자·_ 3~20자입니다.");return}try{const existing=await read("handleByUid/"+me.uid);if(existing){msg("이미 등록한 ID: @"+existing);return}const result=await runTransaction(path("handles/"+handle),v=>v===null?me.uid:undefined,{applyLocally:false});if(!result.committed){msg("이미 사용 중인 ID입니다.");return}await set(path("handleByUid/"+me.uid),handle);await refresh()}catch(e){msg("ID 등록 실패: "+(e.code||e.message))}});
el("friend-find")?.addEventListener("click",async()=>{const result=el("friend-search-result");result.replaceChildren();const handle=el("friend-query").value.trim().replace(/^@/,"").toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(handle)){result.textContent="올바른 ID를 입력해 주세요.";return}try{const uid=await read("handles/"+handle);if(!uid||uid===me.uid){result.textContent="검색 결과가 없어요.";return}result.append(node("span","@"+handle+" "),button("친구 신청",async()=>{await set(path("requests/"+uid+"/"+me.uid),{from:me.uid,to:uid,status:"pending",at:serverTimestamp()});await set(path("sent/"+me.uid+"/"+uid),true);msg("친구 요청을 보냈어요.")}))}catch(e){msg("검색 실패: "+(e.code||e.message))}});
el("social-refresh")?.addEventListener("click",refresh);
el("copy-friend-link")?.addEventListener("click",async()=>{
 const button=el("copy-friend-link"),handle=button.dataset.handle,status=el("friend-link-status");
 if(!/^[a-z0-9_]{3,20}$/.test(handle||"")){status.textContent="공개 ID를 먼저 등록해 주세요.";return}
 const url=new URL("./id-center.html",location.href);url.searchParams.set("friend",handle);url.hash="fw-live-social";
 try{await navigator.clipboard.writeText(url.href);status.textContent="초대 링크가 복사됐어요. 받는 사람은 로그인 후 친구 신청을 선택해야 해요."}
 catch{status.textContent="링크 복사가 허용되지 않았어요: "+url.href}
});
try{const invited=new URL(location.href).searchParams.get("friend");if(invited&&/^[a-z0-9_]{3,20}$/.test(invited.toLowerCase())){el("friend-query").value=invited.toLowerCase();el("friend-search-result").textContent="초대 링크로 왔어요. 로그인한 뒤 '찾기'를 눌러 친구 신청을 진행해 주세요."}}catch{}
onAuthStateChanged(auth,u=>{initialized=true;me=u&&!u.isAnonymous?u:null;if(me)refresh();else{msg("Google 또는 이메일 계정으로 로그인해 주세요.");if(el("my-handle"))el("my-handle").textContent="로그인 후 이용 가능";["friend-inbox","friend-list","invite-list"].forEach(id=>{if(el(id))el(id).textContent="정식 계정 로그인 후 이용 가능"})}},e=>{initialized=true;unavailable("로그인 확인 실패: "+(e.code||e.message))});
setTimeout(()=>{if(!initialized)unavailable("로그인 상태 확인 지연: 네트워크를 확인해 주세요.")},15000);
