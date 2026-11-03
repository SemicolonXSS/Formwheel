/* Formwheel Rapid beta wallet sync: highest existing balance wins at sign-in.
   Client-authoritative beta only. Server-side validation is required before using Rapid
   for trusted economy/leaderboards. Never combines balances by addition. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,get} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const KEY="formwheel_clicker_rapid_beta_v1";
const digits=value=>{
 const v=typeof value==="string"?value:(Number.isSafeInteger(value)&&value>=0?String(value):null);
 return v!==null && /^\d{1,10000}$/.test(v)?BigInt(v).toString():null;
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
  // Protected server wallets are read-only until trusted server transactions exist.
  const snapshot=await get(node);
  if(ticket!==session)return;
  const remote=digits(snapshot.val()?.balance);
  audit("read-only-wallet",{server:remote,local:initial});
  info("server-required");

 }catch(err){if(ticket!==session)return;const reason=String(err?.code||err?.message||err);audit("read-error",{reason});console.warn("Rapid account read failed",reason);info("server-required");}
});
async function creditExchange(amount,transactionId){
 throw new Error("Rapid 서버 지갑 거래가 아직 연결되지 않았습니다. 로컬 잔액은 보존됩니다.");
}
window.FormwheelRapidAccount={creditExchange,getStatus:()=>({signedIn:!!auth.currentUser&&!auth.currentUser.isAnonymous,connected:false,mode:"read-only"}),getDiagnostics:()=>{try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]")}catch{return []}}};
