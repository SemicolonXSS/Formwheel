"use strict";
const {onCall,HttpsError}=require("firebase-functions/v2/https");
const admin=require("firebase-admin");
admin.initializeApp();
const db=admin.database(), now=()=>Date.now();
const root="formwheelV2/social";
const uidOf=req=>{if(!req.auth||req.auth.token.firebase?.sign_in_provider==="anonymous")throw new HttpsError("unauthenticated","정식 Formwheel 계정으로 로그인해 주세요.");return req.auth.uid};
const fail=(code,msg)=>{throw new HttpsError(code,msg)};
const safeId=x=>typeof x==="string"&&/^[a-zA-Z0-9_-]{1,128}$/.test(x);
const text=x=>typeof x==="string"?x.trim():"";
async function blocked(a,b){const s=await db.ref(root+"/blocks").child(a).child(b).get(),t=await db.ref(root+"/blocks").child(b).child(a).get();return s.exists()||t.exists()}
async function friends(a,b){const s=await db.ref(root+"/friends").child(a).child(b).get();return s.val()===true}
exports.claimHandle=onCall(async req=>{const uid=uidOf(req),handle=text(req.data?.handle).toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(handle))fail("invalid-argument","ID는 영문 소문자, 숫자, _ 3~20자입니다.");
const own=await db.ref(root+"/handlesByUid/"+uid).get();if(own.exists()&&own.val()!==handle)fail("failed-precondition","v1에서는 공개 ID 변경을 지원하지 않습니다.");
const r=await db.ref(root+"/handles/"+handle).transaction(v=>v&&v!==uid?undefined:uid);if(!r.committed)fail("already-exists","이미 사용 중인 ID예요.");
await db.ref(root+"/handlesByUid/"+uid).set(handle);return {handle};});
exports.findFriend=onCall(async req=>{const me=uidOf(req),handle=text(req.data?.handle).replace(/^@/,"").toLowerCase(),snap=await db.ref(root+"/handles/"+handle).get();const other=snap.val();if(!other||other===me||await blocked(me,other))return {found:false};const profile=(await db.ref("formwheelV2/hubProfiles/"+other).get()).val()||{};return {found:true,uid:other,handle,nickname:text(profile.nickname).slice(0,16)||handle,icon:text(profile.icon).slice(0,4)||"🎡"};});
exports.friendAction=onCall(async req=>{const me=uidOf(req),other=req.data?.uid,action=req.data?.action;
if(!safeId(other)||other===me)fail("invalid-argument","사용자 ID 오류");
if(!["request","accept","decline","remove","block","unblock","cancel"].includes(action))fail("invalid-argument","작업 오류");
const base=db.ref(root);if(action==="unblock"){await base.child("blocks/"+me+"/"+other).remove();return {ok:true};}
if(action==="block"){await base.update({["blocks/"+me+"/"+other]:true,["friends/"+me+"/"+other]:null,["friends/"+other+"/"+me]:null,["requests/"+me+"/"+other]:null,["requests/"+other+"/"+me]:null,["requestInbox/"+me+"/"+other]:null,["requestInbox/"+other+"/"+me]:null});return {ok:true};}
if(await blocked(me,other))fail("permission-denied","차단 관계입니다.");
if(action==="request"){if(await friends(me,other))return {ok:true};const snap=await base.child("requests/"+other+"/"+me).get();if(snap.exists())fail("already-exists","상대의 신청을 먼저 확인해 주세요.");const path="requests/"+me+"/"+other;const r=await base.child(path).transaction(v=>v||{at:now()});if(!r.committed)fail("aborted","신청 실패");await base.child("requestInbox/"+other+"/"+me).set({at:now()});return {ok:true};}
if(action==="accept"){const incoming=await base.child("requests/"+other+"/"+me).get();if(!incoming.exists())fail("failed-precondition","받은 신청이 없습니다.");if(await blocked(me,other))fail("permission-denied","차단 관계입니다.");await base.update({["requests/"+other+"/"+me]:null,["requests/"+me+"/"+other]:null,["requestInbox/"+me+"/"+other]:null,["requestInbox/"+other+"/"+me]:null,["friends/"+me+"/"+other]:true,["friends/"+other+"/"+me]:true});return {ok:true};}
if(action==="cancel"||action==="decline"){await base.update({["requests/"+(action==="cancel"?me:other)+"/"+(action==="cancel"?other:me)]:null,["requestInbox/"+(action==="cancel"?other:me)+"/"+(action==="cancel"?me:other)]:null});return {ok:true};}
if(action==="remove"){await base.update({["friends/"+me+"/"+other]:null,["friends/"+other+"/"+me]:null});return {ok:true};}});
const validGames=new Set(["Spy","Battle","GCrown","Dice Duel","Risk"]);
const capacities={"Spy":6,"Battle":2,"GCrown":4,"Dice Duel":2,"Risk":4};
exports.createInviteRoom=onCall(async req=>{const me=uidOf(req),game=req.data?.game;if(!validGames.has(game))fail("invalid-argument","지원하지 않는 게임입니다.");
const id=db.ref(root+"/inviteRooms").push().key;await db.ref(root+"/inviteRooms/"+id).set({game,host:me,capacity:capacities[game],participants:{[me]:true},reserveEnabled:!!req.data?.reserve,createdAt:now(),status:"waiting",reservations:{}});return {roomId:id};});
exports.sendInvite=onCall(async req=>{const me=uidOf(req),to=req.data?.toUid,roomId=req.data?.roomId,minutes=Number(req.data?.minutes);if(!safeId(to)||!safeId(roomId)||![5,10,15,30].includes(minutes))fail("invalid-argument","초대 정보 오류");
if(!(await friends(me,to))||await blocked(me,to))fail("permission-denied","친구에게만 초대할 수 있어요.");
const roomRef=db.ref(root+"/inviteRooms/"+roomId),room=(await roomRef.get()).val();if(!room||room.host!==me||room.status!=="waiting")fail("failed-precondition","방장이 대기 중인 방만 초대할 수 있어요.");
const id=db.ref(root+"/invites").push().key,created=now();
const r=await roomRef.transaction(x=>{if(!x||x.host!==me||x.status!=="waiting"||Object.keys(x.participants||{}).length>=x.capacity)return;
x.reservations=x.reservations||{};for(const [k,v] of Object.entries(x.reservations))if(v.until<=created)delete x.reservations[k];
if(x.reserveEnabled && !x.participants[to] && !x.reservations[to] && Object.keys(x.participants||{}).length+Object.keys(x.reservations).length<x.capacity)x.reservations[to]={until:created+120000,inviteId:id};
return x;});if(!r.committed)fail("resource-exhausted","방이 가득 찼거나 참가 불가 상태입니다.");
await db.ref(root+"/invites/"+id).set({from:me,to,roomId,game:room.game,createdAt:created,expiresAt:created+minutes*60000,status:"pending"});return {inviteId:id};});
exports.respondInvite=onCall(async req=>{const me=uidOf(req),id=req.data?.inviteId,action=req.data?.action;if(!safeId(id)||!["accept","decline"].includes(action))fail("invalid-argument","요청 오류");const ir=db.ref(root+"/invites/"+id),snap=await ir.get(),invite=snap.val();if(!invite||invite.to!==me)fail("permission-denied","본인의 초대가 아닙니다.");if(invite.status!=="pending")fail("failed-precondition","이미 처리한 초대입니다.");if(action==="decline"){await ir.child("status").set("declined");return {status:"declined"};}
if(invite.expiresAt<=now()||await blocked(me,invite.from)||!(await friends(me,invite.from)))fail("failed-precondition","만료 또는 권한 변경으로 참가할 수 없습니다.");
const rr=db.ref(root+"/inviteRooms/"+invite.roomId);const time=now();const result=await rr.transaction(room=>{if(!room||room.status!=="waiting")return;
room.participants=room.participants||{};room.reservations=room.reservations||{};
for(const [k,v] of Object.entries(room.reservations))if(v.until<=time)delete room.reservations[k];
if(room.participants[me])return room;
const reserved=!!room.reservations[me];const total=Object.keys(room.participants).length+Object.keys(room.reservations).length;
if((reserved?total>room.capacity:total>=room.capacity))return;
delete room.reservations[me];room.participants[me]=true;return room;});
if(!result.committed)fail("resource-exhausted","게임이 시작했거나 방이 가득 찼습니다.");
await ir.child("status").set("joined");return {status:"joined",roomId:invite.roomId,game:invite.game,note:"Formwheel 초대 대기실 참가 완료. 개별 게임 방 자동 입장은 게임별 어댑터가 필요합니다."};});
exports.awardVerifiedAchievement=onCall(async req=>{uidOf(req);fail("failed-precondition","경쟁 업적은 게임 서버 검증 연동 후 발급됩니다.");});
exports.mergeGuestPreview=onCall(async req=>{uidOf(req);const guest=req.data?.guest;if(!guest||typeof guest!=="object")fail("invalid-argument","병합 자료가 없습니다.");
return {previewOnly:true,notice:"기기 내 즐겨찾기와 설정은 기존 계정 우선으로 검토할 수 있습니다. 검증되지 않은 게스트 점수나 업적은 공식 기록으로 이전할 수 없습니다."};});

exports.socialOverview=onCall(async req=>{const me=uidOf(req);const base=db.ref(root);
const [handle,friendsSnap,outgoing,invitesSnap]=await Promise.all([base.child("handlesByUid/"+me).get(),base.child("friends/"+me).get(),base.child("requests/"+me).get(),base.child("invites").orderByChild("to").equalTo(me).limitToLast(60).get()]);
const friendIds=Object.keys(friendsSnap.val()||{}).filter(id=>friendsSnap.val()[id]===true),incoming=[];
for(const id of friendIds){const prof=(await db.ref("formwheelV2/hubProfiles/"+id).get()).val()||{};incoming.push({uid:id,nickname:text(prof.nickname).slice(0,16)||"친구"});}
const requests=[];const incomingSnap=await base.child("requestInbox/"+me).get();
incomingSnap.forEach(user=>{const data=user.val();if(data&&requests.length<50)requests.push({uid:user.key,at:data.at})});
const invites=[];invitesSnap.forEach(item=>{const v=item.val();if(v&&v.to===me)invites.push({id:item.key,game:v.game,from:v.from,status:v.status,expiresAt:v.expiresAt,roomId:v.roomId})});
return {handle:handle.val()||null,friends:incoming,requests,invitations:invites.reverse().slice(0,40),outgoing:Object.keys(outgoing.val()||{})};});
