/* Formwheel Rapid beta wallet sync: highest existing balance wins at sign-in.
   Client-authoritative beta only. Server-side validation is required before using Rapid
   for trusted economy/leaderboards. Never combines balances by addition. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,runTransaction} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const KEY="formwheel_clicker_rapid_beta_v1";
const digits=value=>{
 const v=typeof value==="string"?value:(Number.isSafeInteger(value)&&value>=0?String(value):null);
 return v!==null && /^\d{1,500}$/.test(v)?BigInt(v).toString():null;
};
const max=(a,b)=>BigInt(a)>=BigInt(b)?a:b;
const AUDIT_KEY="formwheel_rapid_sync_audit_v1";
function audit(event,values={}){
 try{
  const log=JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]");
  log.push({time:new Date().toISOString(),event,...values});
  localStorage.setItem(AUDIT_KEY,JSON.stringify(log.slice(-40)));
 }catch{}
}

function read(){
 try{const json=JSON.parse(localStorage.getItem(KEY)||"null");return digits(json?.balance);}catch{return null;}
}
function writeBalance(value){
 const n=digits(value);if(n===null)return;
 try{const w=JSON.parse(localStorage.getItem(KEY)||"{}");localStorage.setItem(KEY,JSON.stringify({...w,balance:n}));window.dispatchEvent(new CustomEvent("formwheel-rapid-synced",{detail:{balance:n}}));}catch(e){console.warn("Rapid local write failed",e);}
}
let session=0,poll=null,baseline=null,busy=false;
const info=s=>window.dispatchEvent(new CustomEvent("formwheel-rapid-account-sync",{detail:{state:s}}));
onAuthStateChanged(auth,async user=>{
 const ticket=++session;clearInterval(poll);poll=null;baseline=null;busy=false;
 if(!user||user.isAnonymous){info("guest");return;}
 const node=ref(db,"formwheelV2/rapidWallets/"+user.uid);
 const initial=read();audit("connect",{local:initial});info("connecting");
 try{
  const result=await runTransaction(node,current=>{
   const existing=digits(current?.balance)||"0";
   return {balance:max(existing,initial||"0"),updatedAt:Date.now()};
  },{applyLocally:false});
  if(ticket!==session)return;
  const merged=digits(result.snapshot.val()?.balance);
  if(merged===null)throw Error("Unexpected account wallet format");
  // A conversion may happen while the initial server transaction is in flight.
  // Preserve that local delta rather than overwriting it with the initial snapshot.
  const now=read();audit("initial-merge",{localBefore:initial,localNow:now,server:merged});
  const pending=now!==null&&initial!==null?BigInt(now)-BigInt(initial):0n;
  const initialDisplay=BigInt(merged)+pending;
  if(initialDisplay>=0n)writeBalance(initialDisplay.toString());
  baseline=merged;info("ready");
  // No live server -> local overwrite: another tab/device could publish an older
  // snapshot while this tab has a newly earned balance. Poll sends local deltas.
  poll=setInterval(async()=>{
   if(ticket!==session||busy||document.visibilityState==="hidden")return;
   const local=read();if(local===null||local===baseline)return;
   audit("local-change",{local,baseline});
   // Post-login changes are real transactions (including purchases); do not apply max
   // on every write because doing so would reverse legitimate spending.
   busy=true;
   try{
    const previous=baseline;
    const delta=BigInt(local)-BigInt(previous);
    const result=await runTransaction(node,current=>{
     const remote=digits(current?.balance)||"0";
     const next=BigInt(remote)+delta;
     if(next<0n)return; // Do not permit an overdraft under concurrent spending.
     return {...(current&&typeof current==="object"?current:{}),balance:next.toString(),updatedAt:Date.now()};
    },{applyLocally:false});
    if(!result.committed){info("conflict");return;}
    const saved=digits(result.snapshot.val()?.balance);
    audit("transaction",{local,previous,saved,delta:delta.toString()});
    if(saved===null)throw Error("Invalid synchronized wallet balance");
    if(ticket!==session)return;
    baseline=saved;
    // Preserve any additional local updates made while the network request ran.
    const latest=read();
    if(latest===local)writeBalance(saved);
    else if(latest!==null)writeBalance((BigInt(saved)+BigInt(latest)-BigInt(local)).toString());
    info("saved");
   }catch(err){audit("save-error",{reason:String(err?.code||err?.message||err)});console.warn("Rapid account update failed",err);info("error");}
   finally{busy=false;}
  },1500);
 }catch(err){if(ticket!==session)return;console.warn("Rapid account merge failed",err);info("error");}
});
window.FormwheelRapidAccount={getStatus:()=>({signedIn:!!auth.currentUser&&!auth.currentUser.isAnonymous,connected:baseline!==null}),getDiagnostics:()=>{try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]")}catch{return []}}};
