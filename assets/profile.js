import {BADGES,earnedBadge,legacyBadgeIds} from "./badge-catalog.js?v=20261108-healthcheck1";
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue,set} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const icons=["🎡","🎮","🦊","🐱","🚀","🌟","🎲","👑"],guestKey="fw:profile:guest:v1";
const get=id=>document.getElementById(id),message=get("fw-profile-status");
const sanitize=p=>({nickname:typeof p?.nickname==="string"&&p.nickname.trim().length>=2?p.nickname.trim().slice(0,16):"게스트",icon:icons.includes(p?.icon)?p.icon:"🎡",color:/^#[0-9a-f]{6}$/i.test(p?.color||"")?p.color:"#6366f1"});
const guest=()=>{try{return sanitize(JSON.parse(localStorage.getItem(guestKey)))}catch{return sanitize({})}};
const path=uid=>ref(db,"formwheelV2/hubProfiles/"+uid);
let profileDirty=false,profileEditVersion=0;
get("fw-profile-form").addEventListener("input",()=>{profileDirty=true;profileEditVersion++;});
function render(data,user){
 const p=sanitize(data);
 get("fw-profile-name").textContent=p.nickname;get("fw-profile-avatar").textContent=p.icon;get("fw-profile-avatar").style.backgroundColor=p.color;
 if(!profileDirty){get("fw-profile-nickname").value=p.nickname==="게스트"?"":p.nickname;get("fw-profile-icon").value=p.icon;get("fw-profile-color").value=p.color;}
 get("fw-profile-detail").textContent=user?"Firebase에 저장되는 계정 프로필":"이 기기에만 저장되는 게스트 프로필";
}
let unsubscribe=null,currentUser=null,authReady=false,profileGeneration=0,featuredDraft=null,lastBadgeSignature="",friendLookup=0;
let badgeUnsubscribe=null,homeUnsubscribe=null,awards={},homeData=null,profileData=null,expanded=false,filter="all",stats=null,featuredId="",statsUnsubscribe=null,featuredUnsubscribe=null,visitorUnsubscribe=null;
let visitorData=null,communityPeak=null;
const badgeStats=()=>({...stats,communityLivePeak:communityPeak?.count??stats?.communityLivePeak,visitCount:visitorData?.visitCount,firstSeen:visitorData?.firstSeen});
function showBadges(){
 const earned=BADGES.filter(b=>earnedBadge(b,awards,homeData,profileData,badgeStats()));
 const earnedIds=new Set(earned.map(b=>b.id));
 let frame=null;try{frame=localStorage.getItem("fw:badge:frame:"+(currentUser?.uid||"guest"))}catch{}
 const signature=JSON.stringify([filter,expanded,[...earnedIds],featuredId,featuredDraft,currentUser?.uid,frame]);
 if(signature===lastBadgeSignature)return;
 lastBadgeSignature=signature;
 const holder=get("fw-badges-grid");holder.replaceChildren();
 const items=BADGES.filter(b=>filter==="all"||b.category===filter);
 const visible=expanded?items:items.slice(0,6);
 for(const b of visible){
  const earned=earnedBadge(b,awards,homeData,profileData,badgeStats());
  const item=document.createElement("div");item.className="fw-badge"+(earned?"":" locked");
  const icon=document.createElement("span");icon.className="fw-badge-icon";icon.textContent=earned?b.icon:"🔒";
  const info=document.createElement("div"),name=document.createElement("strong"),sub=document.createElement("small");
  name.textContent=b.title;sub.textContent=earned?"✓ 획득 완료":"미획득 · "+b.category;
  info.append(name,sub);item.append(icon,info);holder.append(item);
 }
 get("fw-badge-toggle").hidden=items.length<=6;
 get("fw-badge-toggle").textContent=expanded?"▲ 배지 줄이기":"▼ 배지 늘이기 ("+(items.length-6)+"개 더보기)";
 const select=get("fw-featured-select");select.replaceChildren();
 const none=document.createElement("option");none.value="";none.textContent="대표 업적 없음";select.append(none);
 for(const b of earned){const option=document.createElement("option");option.value=b.id;option.textContent=b.icon+" "+b.title;select.append(option)}
 select.value=featuredDraft===null?featuredId:featuredDraft;
 if(select.selectedIndex<0)select.value="";
 const featured=BADGES.find(b=>b.id===featuredId&&earnedBadge(b,awards,homeData,profileData,badgeStats()));
 get("fw-featured-display").textContent=featured?featured.icon+" "+featured.title:"선택한 배지가 없습니다.";
 const pictured=get("fw-profile-featured");pictured.hidden=!featured;pictured.textContent=featured?.icon||"";pictured.title=featured?.title||"";
 const total=earned.length;
 const levels=[{n:0,name:"기본",border:"none"},{n:3,name:"브론즈",border:"3px solid #b77b49"},{n:10,name:"실버",border:"3px solid #a8b2c6"},{n:20,name:"골드",border:"3px solid #e5b845"},{n:40,name:"다이아",border:"3px solid #63c9e7"}];
 const available=levels.filter(l=>total>=l.n),next=levels.find(l=>total<l.n);
 let stored=null;try{stored=localStorage.getItem("fw:badge:frame:"+(currentUser?.uid||"guest"))}catch{}
 const level=available.find(l=>l.name===stored)||available[available.length-1];
 get("fw-profile-avatar").style.border=level.border;
 get("fw-badge-perk-level").textContent="현재 "+total+"개 획득 · "+level.name+" 테두리";
 get("fw-badge-perk-bar").style.width=next?Math.round((total-available[available.length-1].n)/(next.n-available[available.length-1].n)*100)+"%":"100%";
 get("fw-badge-perk-next").textContent=next?"다음 "+next.name+" 테두리까지 "+(next.n-total)+"개":"모든 프로필 테두리 해금 완료!";
 const opts=get("fw-badge-perk-options");opts.replaceChildren();
 const label=document.createElement("label");label.textContent="프로필 테두리 선택 ";
 const choice=document.createElement("select");
 available.forEach(l=>{const option=document.createElement("option");option.value=l.name;option.textContent=l.name;choice.append(option)});
 choice.value=level.name;
 choice.addEventListener("change",()=>{try{localStorage.setItem("fw:badge:frame:"+(currentUser?.uid||"guest"),choice.value)}catch{}window.dispatchEvent(new Event("fw:badge:frame-changed"));showBadges()});
 label.append(choice);opts.append(label);
 get("fw-badge-count").textContent=total+" / "+BADGES.length+"개 획득";
}
get("fw-featured-select").addEventListener("change",e=>{featuredDraft=e.target.value;});
get("fw-badge-toggle").addEventListener("click",()=>{expanded=!expanded;showBadges()});
get("fw-badge-filter").addEventListener("change",e=>{filter=e.target.value;expanded=false;showBadges()});
showBadges();
onValue(ref(db,"formwheelV2/visitorStats/livePeak"),snap=>{communityPeak=snap.val();showBadges()},()=>{});
onAuthStateChanged(auth,user=>{
 const ticket=++profileGeneration;
 authReady=true;currentUser=user&&!user.isAnonymous?user:null;
 for(const off of [unsubscribe,badgeUnsubscribe,homeUnsubscribe,statsUnsubscribe,featuredUnsubscribe,visitorUnsubscribe])off?.();
 unsubscribe=badgeUnsubscribe=homeUnsubscribe=statsUnsubscribe=featuredUnsubscribe=visitorUnsubscribe=null;
 awards={};homeData=null;profileData=null;stats=null;visitorData=null;featuredId="";featuredDraft=null;profileDirty=false;profileEditVersion++;
 friendLookup++;get("fw-public-badges")?.replaceChildren();
 for(const id of ["fw-profile-status","fw-featured-status","fw-public-badges-status"])get(id).textContent="";
 const watch=(target,receive,error=()=>{})=>onValue(target,snap=>{if(ticket===profileGeneration)receive(snap)},e=>{if(ticket===profileGeneration)error(e)});
 showBadges();
 if(user)visitorUnsubscribe=watch(ref(db,"formwheelV2/visitorStats/uniqueVisitors/"+user.uid),snap=>{visitorData=snap.val();showBadges();});
 if(!currentUser){
  try{homeData=JSON.parse(localStorage.getItem("fw:hub:home:v1"))}catch{}
  profileData=guest();render(profileData,null);showBadges();get("fw-badges-status").textContent="로그인하면 계정의 획득 배지를 볼 수 있어요.";return;
 }
 const owner=currentUser;
 render({nickname:owner.displayName||"게스트"},owner);
 badgeUnsubscribe=watch(ref(db,"formwheelV2/anniversary4050/"+owner.uid+"/badges"),snap=>{awards=snap.val()||{};showBadges();get("fw-badges-status").textContent="계정의 배지 기록을 불러왔어요.";},e=>{get("fw-badges-status").textContent="배지 불러오기 실패: "+(e.code||e.message);});
 statsUnsubscribe=watch(ref(db,"formwheelV2/achievementStats/"+owner.uid),snap=>{stats=snap.val()||{};showBadges();},e=>{get("fw-badges-status").textContent="게임 통계 조회 실패: "+(e.code||"권한 오류");});
 featuredUnsubscribe=watch(ref(db,"formwheelV2/featuredBadges/"+owner.uid),snap=>{featuredId=typeof snap.val()==="string"?snap.val():"";showBadges();},e=>{get("fw-featured-status").textContent="대표 업적 조회 실패: "+(e.code||"권한 오류");});
 homeUnsubscribe=watch(ref(db,"formwheelV2/hubHomes/"+owner.uid),snap=>{homeData=snap.val();showBadges();});
 unsubscribe=watch(path(owner.uid),snap=>{profileData=snap.val()||{nickname:owner.displayName||"게스트"};render(profileData,owner);showBadges();},e=>{message.textContent="프로필 불러오기 실패: "+e.code;});
});
get("fw-profile-form").addEventListener("submit",async event=>{
 event.preventDefault();if(!authReady){message.textContent="로그인 상태를 확인 중이에요.";return;}
 const nickname=get("fw-profile-nickname").value.trim();
 if(nickname.length<2||nickname.length>16){message.textContent="닉네임은 2~16자로 입력해 주세요.";return;}
 const profile=sanitize({nickname,icon:get("fw-profile-icon").value,color:get("fw-profile-color").value});
 const owner=currentUser,ticket=profileGeneration,edit=profileEditVersion;
 try{
  if(owner)await set(path(owner.uid),profile);else localStorage.setItem(guestKey,JSON.stringify(profile));
  if(ticket!==profileGeneration)return;
  profileData=profile;if(edit===profileEditVersion)profileDirty=false;
  render(profile,owner);showBadges();message.textContent=owner?"계정 프로필을 저장했어요.":"게스트 프로필을 이 기기에 저장했어요.";
 }catch(e){if(ticket===profileGeneration)message.textContent="저장 실패: "+(e.code||"네트워크 또는 권한 오류");}
});

/* Only explicit, badge-ID-only public snapshots are exposed by friend search. */
get("friend-query")?.addEventListener("input",()=>{friendLookup++;get("fw-public-badges")?.replaceChildren();});
window.addEventListener("fw:friend-found",async event=>{
 const target=event.detail||{},view=get("fw-public-badges"),ticket=++friendLookup;
 if(!view||!target.uid)return;
 view.replaceChildren();const heading=document.createElement("strong");heading.textContent=(target.nickname||"사용자")+"님의 공개 이벤트 배지";view.append(heading);
 const state=document.createElement("p");state.textContent="공개 배지를 확인하는 중…";view.append(state);
 try{
  const {get:read}=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js");
  const snap=await read(ref(db,"formwheelV2/publicEventBadges/"+target.uid));
  if(ticket!==friendLookup)return;
  const data=snap.val()||{},owned=BADGES.filter(b=>legacyBadgeIds.has(b.id)&&data[b.id]===true);
  state.textContent=owned.length?owned.length+"개 공개 이벤트 배지":"공개한 이벤트 배지가 없어요.";
  const grid=document.createElement("div");grid.className="fw-badges-grid";
  for(const badge of owned){const tile=document.createElement("div");tile.className="fw-badge";tile.textContent=badge.icon+" "+badge.title;grid.append(tile);}
  view.append(grid);
 }catch(e){if(ticket===friendLookup)state.textContent="공개 배지 조회 불가 · 연결 또는 공개 배지 Rules를 확인해 주세요. ("+(e.code||"연결 오류")+")";}
});
get("fw-public-badges-publish")?.addEventListener("click",async()=>{
 const status=get("fw-public-badges-status"),user=currentUser,ticket=profileGeneration;
 if(!user){status.textContent="로그인 후 공개할 수 있어요.";return;}
 const publicBadges=Object.fromEntries([...legacyBadgeIds].filter(id=>awards[id]).map(id=>[id,true]));
 if(!Object.keys(publicBadges).length){status.textContent="공개할 이벤트 배지가 없어요.";return;}
 try{await set(ref(db,"formwheelV2/publicEventBadges/"+user.uid),publicBadges);if(ticket===profileGeneration&&currentUser?.uid===user.uid)status.textContent="이벤트 배지 목록을 공개했어요. 획득 시각과 다른 계정 기록은 공유하지 않아요.";}
 catch(e){if(ticket!==profileGeneration)return;status.textContent="공개 저장 실패: "+(e.code||"연결 오류");}
});
get("fw-public-badges-hide")?.addEventListener("click",async()=>{
 const status=get("fw-public-badges-status"),user=currentUser,ticket=profileGeneration;
 if(!user){status.textContent="로그인 후 변경할 수 있어요.";return;}
 try{await set(ref(db,"formwheelV2/publicEventBadges/"+user.uid),null);if(ticket===profileGeneration&&currentUser?.uid===user.uid)status.textContent="공개 배지 목록을 삭제했어요.";}
 catch(e){if(ticket!==profileGeneration)return;status.textContent="공개 해제 실패: "+(e.code||"연결 오류");}
});

get("fw-featured-save").addEventListener("click",async()=>{
 const status=get("fw-featured-status"),id=get("fw-featured-select").value;
 if(!currentUser){status.textContent="대표 업적 설정은 로그인 후 이용할 수 있어요.";return}
 const badge=BADGES.find(b=>b.id===id);
 if(id&&(!badge||!earnedBadge(badge,awards,homeData,profileData,badgeStats()))){status.textContent="획득한 배지만 대표 업적으로 설정할 수 있어요.";return}
 const uid=currentUser.uid,ticket=profileGeneration;
 try{await set(ref(db,"formwheelV2/featuredBadges/"+uid),id||null);if(ticket!==profileGeneration)return;featuredId=id;if(featuredDraft===id)featuredDraft=null;showBadges();status.textContent="대표 업적을 저장했어요.";}
 catch(e){if(ticket===profileGeneration)status.textContent="저장 실패: "+(e.code||"Firebase 권한 또는 네트워크 오류");}
});
