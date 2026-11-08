/* Visible-time analytics. A shared sampler avoids counting overlapping tabs twice. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import {claimVisibleTime} from "./visitor-time.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const root="formwheelV2/visitorStats/uniqueVisitors";
const raw=new URL(import.meta.url).searchParams.get("project")||location.pathname.split("/").filter(Boolean)[0]||"Hub";
const project=String(raw).replace(/^Formwheel_/i,"").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,50)||"Hub";
let uid=null,lastTick=Date.now(),busy=false,pendingMs=0,generation=0;
const visible=()=>document.visibilityState==="visible"&&!document.prerendering;
async function flush(force=false){
 const owner=uid;if(!owner||auth.currentUser?.uid!==owner)return;
 const now=Date.now(),elapsed=Math.min(45000,Math.max(0,now-lastTick));lastTick=now;
 if(force||visible()){
  const delta=await claimVisibleTime(owner,elapsed,now);
  if(owner!==uid)return;
  pendingMs=Math.min(300000,pendingMs+delta);
 }
 if(busy||pendingMs<1000)return;
 const batch=Math.floor(pendingMs/1000)*1000;pendingMs-=batch;busy=true;
 try{
  const result=await runTransaction(ref(db,root+"/"+owner),current=>{
   const value=current&&typeof current==="object"?current:{firstSeen:now,accountType:auth.currentUser?.isAnonymous?"guest":"account",totalMs:0,visitCount:1};
   const projectMs={...(value.projectMs||{})};projectMs[project]=(Number(projectMs[project])||0)+batch;
   return {...value,totalMs:(Number(value.totalMs)||0)+batch,projectMs,lastVisitAt:now,lastCountedAt:now};
  },{applyLocally:false});
  if(!result.committed)throw Error("duration_transaction_not_committed");
 }catch(e){if(uid===owner)pendingMs=Math.min(300000,pendingMs+batch);console.warn("Formwheel project analytics:",e.code||e.message);}
 finally{busy=false;}
}
async function register(user,ticket){
 const owner=user.uid,now=Date.now();
 try{
  const result=await runTransaction(ref(db,root+"/"+owner),current=>{
   if(current===null)return {firstSeen:now,accountType:user.isAnonymous?"guest":"account",totalMs:0,projectMs:{},visitCount:1,lastVisitAt:now,lastCountedAt:now};
   if(!current||typeof current!=="object")return;
   return {...current,visitCount:(Number(current.visitCount)||1)+(now-(Number(current.lastVisitAt)||0)>1800000?1:0),lastVisitAt:now,lastCountedAt:now};
  },{applyLocally:false});
  if(ticket!==generation||auth.currentUser?.uid!==owner)return;
  if(!result.committed)throw Error("visitor_transaction_not_committed");
  uid=owner;lastTick=Date.now();
 }catch(e){console.warn("Formwheel visitor registration:",e.code||e.message);}
}
onAuthStateChanged(auth,user=>{
 const ticket=++generation;uid=null;pendingMs=0;lastTick=Date.now();
 if(user)void register(user,ticket);
 else signInAnonymously(auth).catch(e=>console.warn("Formwheel guest analytics disabled",e.code||e.message));
});
setInterval(()=>flush(),15000);
document.addEventListener("visibilitychange",()=>{if(!visible())void flush(true);else lastTick=Date.now();});
window.addEventListener("pagehide",()=>flush(visible()));
