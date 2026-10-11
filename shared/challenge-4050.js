/* Formwheel 40→50 challenge client-side participation reporting.
 * These events are NOT authoritative achievements: server validation required.
 */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,runTransaction,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const cfg={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(cfg),auth=getAuth(app),db=getDatabase(app);
const start=Date.parse("2026-10-10T15:00:00Z"),end=Date.parse("2026-10-20T15:00:00Z");
const allowed=new Set(["cook","reflex","gcrown","time"]);
let user=null;
onAuthStateChanged(auth,u=>{user=u&&!u.isAnonymous?u:null});
window.Formwheel4050={
 async complete(gameId){
   if(!allowed.has(gameId))throw Error("게임을 인식하지 못했어요.");
   if(Date.now()<start||Date.now()>=end)return false;
   const u=user||auth.currentUser;
   if(!u||u.isAnonymous){console.info("[Formwheel 40→50] 로그인 후 기록할 수 있습니다.");return false}
   const path=ref(db,"formwheelV2/anniversary4050/"+u.uid+"/participation/"+gameId);
   const result=await runTransaction(path,current=>current===null?{completedAt:serverTimestamp(),source:"game-end",status:"unverified"}:undefined,{applyLocally:false});
   return result.committed||result.snapshot.exists();
 }
};
window.addEventListener("fw:4050:complete",e=>{const gameId=e.detail?.gameId;window.Formwheel4050.complete(gameId).catch(err=>console.warn("[Formwheel challenge]",err.code||err.message))});
