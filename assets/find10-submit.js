import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,push,set,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const app=getApps()[0]||initializeApp({apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"});
const auth=getAuth(app),db=getDatabase(app);
const KEY="fw-find10-pending";
const status=document.getElementById("find10-send-status");
const retry=document.getElementById("find10-retry");
export async function submitFind10(result){
 const u=auth.currentUser||(await signInAnonymously(auth)).user;
 const slug=String(result.slug||"unknown").slice(0,40);
 const elapsed=Math.min(120,Math.max(0,Number(result.elapsed)||0));
 const ageGroup=["10대 미만","10대","20대","30대","40대","50대","60대 이상"].includes(result.ageGroup)?result.ageGroup:"";
 const selectedSlug=String(result.selectedSlug||"").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,40);
 const outcome=result.success?"성공":result.timeout?"시간 초과":"다른 프로젝트 선택";
 await set(push(ref(db,"formwheelFeedback/items")),{uid:u.uid,project:"Hub",subject:"[10초 챌린지] "+slug,body:"목표 프로젝트: "+slug+"\n결과: "+outcome+"\n소요 시간: "+elapsed.toFixed(2)+"초\n선택한 프로젝트: "+(selectedSlug||"미기록")+"\n연령대: "+(ageGroup||"미응답")+"\n자동 수집된 UX 테스트 결과 (닉네임 없음)",createdAt:serverTimestamp()});
}
let busy=false;
async function send(){
 if(busy)return;
 let result;
 try{result=JSON.parse(sessionStorage.getItem(KEY)||"null")}catch{}
 if(!result)return;
 busy=true;if(retry)retry.hidden=true;
 if(status)status.textContent="⏳ 챌린지 결과 전송 중…";
 try{
  await submitFind10(result);
  sessionStorage.removeItem(KEY);
  if(status)status.textContent="✅ 챌린지 결과가 운영자에게 제출됐어요!";
 }catch(err){
  if(status)status.textContent="⚠️ 결과 전송 실패 ("+(err.code||"연결/권한 오류")+"). 다시 전송해 주세요.";
  if(retry)retry.hidden=false;
 }finally{busy=false}
}
if(retry)retry.addEventListener("click",send);
if(status)send();
