/* Account-based cosmetic theme preference synchronization.
   Only preferences are synchronized here: wallet balances and purchase entitlements
   MUST be updated by a server-authoritative backend, never by browser writes. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get,set,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const MAIN="fw-global-theme-v1",BULK="fw-project-themes-v1",ALLOWED=new Set(["sunset","forest","neon","galaxy","ocean","sakura","midnight","aurora","ember","cyber","royal","void","prismatic","echo","nova","void-premium","rift","comet","eclipse","quantum","celestial","singularity","overdrive"]);
const clean=x=>{const projects={};if(x?.projects&&typeof x.projects==="object"){for(const [k,v] of Object.entries(x.projects).slice(0,250)){if(k.length<=120&&ALLOWED.has(v))projects[k]=v;}}return {selected:ALLOWED.has(x?.selected)?x.selected:null,projects};};
const local=()=>{let projects={};try{projects=JSON.parse(localStorage.getItem(BULK)||"{}")}catch{}return clean({selected:localStorage.getItem(MAIN),projects});};
let user=null,unsubscribe=null,loading=true,remoteValue=null,writeTimer=null,applying=false;
const status=(state)=>window.dispatchEvent(new CustomEvent("formwheel-account-theme-sync",{detail:{state}}));
function apply(data){const s=clean(data);applying=true;try{if(s.selected)localStorage.setItem(MAIN,s.selected);else localStorage.removeItem(MAIN);localStorage.setItem(BULK,JSON.stringify(s.projects));window.FormwheelTheme?.get?.();window.dispatchEvent(new Event("formwheel-theme-changed"));}finally{applying=false;}}
async function write(){if(!user||loading)return;const target=ref(db,"formwheelV2/themePreferences/"+user.uid);try{await set(target,local());status("saved");}catch(e){console.warn("Formwheel theme sync failed",e);status("error");}}
function schedule(){if(applying||!user||loading)return;clearTimeout(writeTimer);writeTimer=setTimeout(write,500);}
const originalSet=Storage.prototype.setItem,originalRemove=Storage.prototype.removeItem;
Storage.prototype.setItem=function(k,v){originalSet.call(this,k,v);if(this===localStorage&&(k===MAIN||k===BULK))schedule();};
Storage.prototype.removeItem=function(k){originalRemove.call(this,k);if(this===localStorage&&(k===MAIN||k===BULK))schedule();};
window.FormwheelAccountThemes={save:schedule,status:()=>({signedIn:!!user,loading})};
onAuthStateChanged(auth,async next=>{
 clearTimeout(writeTimer);unsubscribe?.();unsubscribe=null;user=next;loading=true;remoteValue=null;
 if(!next||next.isAnonymous){loading=false;status("guest");return;}
 const target=ref(db,"formwheelV2/themePreferences/"+next.uid);
 try{
  const first=await get(target);
  if(auth.currentUser?.uid!==next.uid)return;
  if(first.exists()){remoteValue=clean(first.val());apply(remoteValue);}
  else {const initial=local();await set(target,initial);remoteValue=initial;}
  loading=false;status("ready");
  unsubscribe=onValue(target,snap=>{if(auth.currentUser?.uid!==next.uid||!snap.exists())return;const incoming=clean(snap.val());if(JSON.stringify(incoming)!==JSON.stringify(local()))apply(incoming);},e=>{console.warn("Theme realtime sync unavailable",e);status("error");});
 }catch(e){loading=false;console.warn("Account themes unavailable",e);status("error");}
});
