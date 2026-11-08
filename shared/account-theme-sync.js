/* Account-based cosmetic theme preference synchronization.
   Only preferences are synchronized here: wallet balances and purchase entitlements
   MUST be updated by a server-authoritative backend, never by browser writes. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,update,runTransaction,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const MAIN="fw-global-theme-v1",BULK="fw-project-themes-v1",ALLOWED=new Set(["haunted-night","sunset","forest","neon","galaxy","ocean","sakura","midnight","aurora","ember","cyber","royal","void","prismatic","echo","nova","void-premium","rift","comet","eclipse","quantum","celestial","singularity","overdrive","cosmic-infinity","cosmic-paradox","cosmic-omega","cosmic-eternity","cosmic-genesis","daynight","playtester-purple","playtester-red","playtester-blue","mint-breeze","rose-gold","retro-pixel","deep-sea","golden-hour","frost","volcanic","starlit-library","dreamscape","crystal-cave","solar-flare","event-horizon","level2-nebula-core","level2-nebula","level2-pulsar","level2-chrono","level2-abyss","level2-stellar","level2-prism","level2-supernova","level2-hyperion","level2-zenith","level2-omniverse","level2-paragon","level2-absolute","level2-eclipse-king","level2-aurora-prime","level2-void-emperor","level2-time-collapse","level2-celestial-core","level2-infinity-gate","level2-dimension-zero","level2-paradox-god","level2-quantum-throne","level2-transcendence","level2-origin-breaker","level2-final-singularity"]);
const clean=x=>{const projects={};if(x?.projects&&typeof x.projects==="object"){for(const [k,v] of Object.entries(x.projects).slice(0,250)){if(k.length>0&&k.length<=120&&ALLOWED.has(v))projects[k]=v;}}return {selected:ALLOWED.has(x?.selected)?x.selected:null,projects};};
const encodeKey=k=>encodeURIComponent(k).replace(/\./g,"%2E");
const decodeKey=k=>{try{return decodeURIComponent(k)}catch{return k}};
const fromRemote=x=>clean({...x,projects:Object.fromEntries(Object.entries(x?.projects||{}).map(([k,v])=>[decodeKey(k),v]))});
const toRemote=x=>({selected:x.selected,projects:Object.fromEntries(Object.entries(x.projects).map(([k,v])=>[encodeKey(k),v]))});
const local=()=>{try{return clean({selected:localStorage.getItem(MAIN),projects:JSON.parse(localStorage.getItem(BULK)||"{}")})}catch{return clean({})}};
let user=null,unsubscribe=null,loading=true,remoteValue=null,writeTimer=null,applying=false,session=0,pending={},writing=false,inFlight=null;
const status=state=>window.dispatchEvent(new CustomEvent("formwheel-account-theme-sync",{detail:{state}}));
function apply(data){const s=clean(data);applying=true;try{if(s.selected)localStorage.setItem(MAIN,s.selected);else localStorage.removeItem(MAIN);localStorage.setItem(BULK,JSON.stringify(s.projects));window.FormwheelTheme?.get?.();window.dispatchEvent(new Event("formwheel-theme-changed"));}finally{applying=false;}}
function changes(before,after){
 const patch={};if(before.selected!==after.selected)patch.selected=after.selected;
 for(const k of new Set([...Object.keys(before.projects),...Object.keys(after.projects)]))if(before.projects[k]!==after.projects[k])patch["projects/"+encodeKey(k)]=after.projects[k]||null;
 return patch;
}
function overlay(data,patch){
 const next=clean(data);
 for(const [k,v] of Object.entries(patch)){
  if(k==="selected")next.selected=v;
  else {const id=decodeKey(k.slice(9));if(v===null)delete next.projects[id];else next.projects[id]=v;}
 }
 return next;
}
async function write(){
 if(!user||loading||writing||!Object.keys(pending).length)return;
 const ticket=session,patch={...pending},target=ref(db,"formwheelV2/themePreferences/"+user.uid);
 writing=true;inFlight=patch;
 try{
  await update(target,patch);
  if(ticket!==session)return;
  remoteValue=overlay(remoteValue,patch);
  for(const [k,v] of Object.entries(patch))if(pending[k]===v)delete pending[k];
  status("saved");
 }catch(e){if(ticket===session){console.warn("Formwheel theme sync failed",e);status("error");}return;}
 finally{if(ticket===session){writing=false;inFlight=null;}}
 if(ticket===session&&Object.keys(pending).length)writeTimer=setTimeout(write,500);
}
function schedule(){if(applying||!user||loading)return;pending=changes(overlay(remoteValue||clean({}),inFlight||{}),local());clearTimeout(writeTimer);writeTimer=setTimeout(write,500);}
const originalSet=Storage.prototype.setItem,originalRemove=Storage.prototype.removeItem;
Storage.prototype.setItem=function(k,v){originalSet.call(this,k,v);if(this===localStorage&&(k===MAIN||k===BULK))schedule();};
Storage.prototype.removeItem=function(k){originalRemove.call(this,k);if(this===localStorage&&(k===MAIN||k===BULK))schedule();};
window.FormwheelAccountThemes={save:schedule,status:()=>({signedIn:!!user,loading})};
onAuthStateChanged(auth,async next=>{
 const ticket=++session;
 clearTimeout(writeTimer);unsubscribe?.();unsubscribe=null;user=next&&!next.isAnonymous?next:null;loading=true;remoteValue=null;pending={};writing=false;inFlight=null;
 if(!user){loading=false;status("guest");return;}
 const target=ref(db,"formwheelV2/themePreferences/"+next.uid);
 try{
  const first=await get(target);
  if(ticket!==session||auth.currentUser?.uid!==next.uid)return;
  if(first.exists())remoteValue=fromRemote(first.val());
  else {
   const initial=local();
   const result=await runTransaction(target,current=>current===null?toRemote(initial):undefined,{applyLocally:false});
   if(ticket!==session)return;
   remoteValue=fromRemote(result.snapshot.val());
  }
  apply(remoteValue);loading=false;status("ready");
  unsubscribe=onValue(target,snap=>{
   if(ticket!==session||auth.currentUser?.uid!==next.uid)return;
   remoteValue=fromRemote(snap.val());
   const merged=overlay(overlay(remoteValue,inFlight||{}),pending);
   if(JSON.stringify(merged)!==JSON.stringify(local()))apply(merged);
  },e=>{if(ticket!==session)return;console.warn("Theme realtime sync unavailable",e);status("error");});
 }catch(e){if(ticket!==session)return;loading=false;remoteValue=local();console.warn("Account themes unavailable",e);status("error");}
});
