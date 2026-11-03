/* Formwheel Rapid protected-wallet compatibility.
 * Realtime Database Rules deliberately prohibit client-side writes to rapidWallets.
 * Do not merge, overwrite, or credit balances from browser storage.
 * Server-backed purchases and exchanges require a verified server transaction API.
 */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const KEY="formwheel_clicker_rapid_beta_v1";
const AUDIT_KEY="formwheel_rapid_sync_audit_v1";
const digits=value=>{
 const v=typeof value==="string"?value:(Number.isSafeInteger(value)&&value>=0?String(value):null);
 return v!==null && /^\d{1,10000}$/.test(v)?BigInt(v).toString():null;
};
function audit(event,values={}){
 try{
  const log=JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]");
  log.push({time:new Date().toISOString(),event,...values});
  localStorage.setItem(AUDIT_KEY,JSON.stringify(log.slice(-40)));
 }catch{}
}
function localBalance(){
 try{return digits(JSON.parse(localStorage.getItem(KEY)||"null")?.balance)}catch{return null}
}
let session=0,mode="guest";
const info=state=>{mode=state;window.dispatchEvent(new CustomEvent("formwheel-rapid-account-sync",{detail:{state}}));};
onAuthStateChanged(auth,async user=>{
 const ticket=++session;
 if(!user||user.isAnonymous){info("guest");return;}
 info("connecting");
 const local=localBalance();
 try{
  const snapshot=await get(ref(db,"formwheelV2/rapidWallets/"+user.uid));
  if(ticket!==session)return;
  const server=digits(snapshot.val()?.balance);
  // Read-only comparison: never change local wallet even if server and local differ.
  audit("server-wallet-read-only",{local,server});
  info("server-required");
 }catch(err){
  if(ticket!==session)return;
  const reason=String(err?.code||err?.message||err);
  audit("server-wallet-read-failed",{reason});
  console.warn("Rapid wallet read unavailable",reason);
  info("server-required");
 }
});
async function creditExchange(){
 throw new Error("Rapid 서버 지갑 거래가 준비되지 않았습니다. 현재 로컬 잔액은 유지됩니다.");
}
window.FormwheelRapidAccount={
 creditExchange,
 getStatus:()=>({signedIn:!!auth.currentUser&&!auth.currentUser.isAnonymous,connected:false,mode}),
 getDiagnostics:()=>{try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]")}catch{return []}}
};
