/* Formwheel shared visitor analytics (opt-in project pages).
   Tracks visible time by Firebase UID without storing IPs or page-specific identifiers. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const root="formwheelV2/visitorStats/uniqueVisitors";
const raw=document.currentScript?.dataset?.project||location.pathname.split("/").filter(Boolean)[0]||"Hub";
const project=String(raw).replace(/^Formwheel_/i,"").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,50)||"Hub";
let uid=null,lastTick=Date.now(),busy=false,connected=true;
function visible(){return document.visibilityState==="visible"&&!document.prerendering}
async function flush(force=false){
 if(!uid||busy||!connected)return;
 const now=Date.now(),delta=Math.min(45000,Math.max(0,now-lastTick));
 lastTick=now;
 if(!force&&!visible()||delta<=0)return;
 busy=true;
 try{
  await runTransaction(ref(db,root+"/"+uid),v=>{
   if(!v||typeof v!=="object")return;
   const projectMs={...(v.projectMs||{})};
   projectMs[project]=(Number(projectMs[project])||0)+delta;
   return {...v,totalMs:(Number(v.totalMs)||0)+delta,projectMs,lastVisitAt:now,lastCountedAt:now};
  },{applyLocally:false});
 }catch(e){console.warn("Formwheel project analytics:",e.code||e)}
 finally{busy=false}
}
async function register(user){
 if(!user||user.uid===uid)return;
 uid=user.uid;lastTick=Date.now();const now=Date.now();
 try{
  await runTransaction(ref(db,root+"/"+uid),v=>v===null?{
   firstSeen:now,accountType:user.isAnonymous?"guest":"account",totalMs:0,
   projectMs:{},visitCount:1,lastVisitAt:now,lastCountedAt:now
  }:{...v,visitCount:(Number(v.visitCount)||1)+(now-(Number(v.lastVisitAt)||0)>1800000?1:0),lastVisitAt:now},{applyLocally:false});
 }catch(e){console.warn("Formwheel visitor registration:",e.code||e)}
}
onAuthStateChanged(auth,user=>{
 if(user)register(user);
 else signInAnonymously(auth).catch(e=>console.warn("Formwheel guest analytics disabled",e.code||e));
});
setInterval(()=>flush(),15000);
document.addEventListener("visibilitychange",()=>{if(!visible())flush(true);else lastTick=Date.now()});
window.addEventListener("pagehide",()=>flush(true));
