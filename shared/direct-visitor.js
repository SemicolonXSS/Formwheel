/* Shared direct-entry visitor counter. Preserves existing UID records. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const project=(location.pathname.split("/").filter(Boolean)[0]||"Formwheel").replace(/^Formwheel_/i,"")||"Hub";
const key="formwheelV2/visitorStats/uniqueVisitors/";
const sessionKey="fw:visitor:last-counted:"+project;
let processing=false,recordedUid="";
onAuthStateChanged(auth,async user=>{
 if(!user){try{await signInAnonymously(auth)}catch(e){console.warn("Visitor authentication unavailable",e.code||e)}return}
 if(processing||recordedUid===user.uid)return;
 processing=true;
 try{
  const now=Date.now();
  const result=await runTransaction(ref(db,key+user.uid),old=>{
   if(old!==null&&(!old||typeof old!=="object"))return;
   const previous=old||{};
   const last=Number(previous.lastVisitAt)||0;
   const nextVisit=!last||now-last>30*60*1000;
   const projectVisits={...(previous.projectVisits||{})};
   projectVisits[project]=(Number(projectVisits[project])||0)+(nextVisit?1:0);
   return {...previous,firstSeen:previous.firstSeen||now,accountType:previous.accountType||(user.isAnonymous?"guest":"account"),totalMs:Number(previous.totalMs)||0,projectMs:previous.projectMs||{},visitCount:(Number(previous.visitCount)||0)+(nextVisit?1:0),lastCountedAt:now,lastVisitAt:now,projectVisits};
  },{applyLocally:false});
  if(result.committed)recordedUid=user.uid;
 }catch(e){console.warn("Direct project visit count unavailable; check Firebase Rules",e.code||e)}
 finally{processing=false}
});
