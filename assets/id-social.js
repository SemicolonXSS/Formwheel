import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFunctions,httpsCallable} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
const cfg={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(cfg),auth=getAuth(app),fn=getFunctions(app);
const el=id=>document.getElementById(id),call=(name,data)=>httpsCallable(fn,name,{timeout:12000})(data||{}).then(r=>r.data);
let me=null,selected=null,view=null;
const msg=s=>{const target=el("social-status");if(target)target.textContent=s};
const showUnavailable=message=>{msg(message);const handle=el("my-handle");if(handle)handle.textContent="공개 ID를 확인할 수 없습니다.";["friend-inbox","friend-list","invite-list"].forEach(id=>{const target=el(id);if(target)target.textContent="현재 목록을 불러올 수 없습니다. 새로고침을 눌러 다시 시도해 주세요."})};
const node=(tag,text)=>{const x=document.createElement(tag);x.textContent=text;return x};
const btn=(label,handler)=>{const x=node("button",label);x.addEventListener("click",async()=>{x.disabled=true;try{await handler();await refresh()}catch(e){msg("요청 실패: "+(e.message||e.code||"서버 연결 확인 필요"))}finally{x.disabled=false}});return x};
function fill(container,items,empty,render){container.replaceChildren();if(!items.length){container.append(node("p",empty));return}items.forEach(x=>container.append(render(x)))}
async function refresh(){if(!me){msg("정식 계정으로 로그인해야 친구 및 초대 기능을 사용할 수 있습니다.");return}
try{view=await call("socialOverview");el("my-handle").textContent=view.handle?"@"+view.handle:"아직 공개 ID가 없습니다.";msg("Firebase 소셜 서비스 연결됨");
fill(el("friend-inbox"),view.requests||[],"받은 친구 신청이 없어요.",r=>{const line=node("div","친구 요청 · "+r.uid.slice(0,12)+"… ");line.append(btn("수락",()=>call("friendAction",{uid:r.uid,action:"accept"})),btn("거절",()=>call("friendAction",{uid:r.uid,action:"decline"})));return line});
fill(el("friend-list"),view.friends||[],"등록된 친구가 없어요.",f=>{const line=node("div",f.nickname+" · "+f.uid.slice(0,10)+"… ");line.style.margin="10px 0";line.append(btn("초대",async()=>{const game=el("invite-game").value,minutes=Number(el("invite-minutes").value);const room=await call("createInviteRoom",{game,reserve:el("reserve").checked});await call("sendInvite",{toUid:f.uid,roomId:room.roomId,minutes});msg("Formwheel Invite 대기실 초대를 보냈습니다. 실제 게임 방 연동은 별도입니다.")}),btn("차단",()=>call("friendAction",{uid:f.uid,action:"block"})),btn("친구 삭제",()=>call("friendAction",{uid:f.uid,action:"remove"})));return line});
fill(el("invite-list"),view.invitations||[],"받은 초대가 없어요.",i=>{const line=node("div",i.game+" · "+(i.status==="pending"&&Date.now()<i.expiresAt?"대기 중":i.status)+" ");line.style.margin="10px 0";if(i.status==="pending"&&Date.now()<i.expiresAt)line.append(btn("수락",async()=>{const result=await call("respondInvite",{inviteId:i.id,action:"accept"});msg(result.note||"대기실 참가 완료")}),btn("거절",()=>call("respondInvite",{inviteId:i.id,action:"decline"})));return line});
}catch(e){showUnavailable("소셜 서버 연결 실패: "+(e.code||e.message||"Cloud Functions 미배포/권한 오류")+". 잠시 후 새로고침해 주세요.")}}
el("handle-button").addEventListener("click",async()=>{try{const r=await call("claimHandle",{handle:el("claim-handle").value});msg("공개 ID 등록됨: @"+r.handle);await refresh()}catch(e){msg("ID 등록 오류: "+(e.message||e.code))}});
el("friend-find").addEventListener("click",async()=>{const box=el("friend-search-result");box.replaceChildren();try{const r=await call("findFriend",{handle:el("friend-query").value});if(!r.found){box.textContent="검색 결과가 없어요.";document.getElementById("fw-public-badges")?.replaceChildren();return}window.dispatchEvent(new CustomEvent("fw:friend-found",{detail:{uid:r.uid,nickname:r.nickname,handle:r.handle}}));box.append(node("span",r.icon+" "+r.nickname+" (@"+r.handle+") "),btn("친구 신청",()=>call("friendAction",{uid:r.uid,action:"request"})))}catch(e){msg("검색 실패: "+(e.message||e.code))}});
el("social-refresh").addEventListener("click",refresh);
onAuthStateChanged(auth,u=>{me=u&&!u.isAnonymous?u:null;if(me)refresh();else{view=null;msg("정식 계정으로 로그인해 주세요. Hub 아래쪽에서 Google 로그인 가능.");["friend-inbox","friend-list","invite-list"].forEach(id=>el(id).textContent="정식 계정 로그인 후 이용 가능")};},e=>showUnavailable("Firebase 로그인 상태 확인 실패: "+(e.code||e.message||"알 수 없는 오류")));

// Authentication initialization watchdog: prevent indefinite loading if SDK/network stalls.
setTimeout(()=>{if(el("my-handle")?.textContent==="로그인 상태 확인 중…")showUnavailable("로그인 상태 확인이 지연되고 있습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.")},15000);
