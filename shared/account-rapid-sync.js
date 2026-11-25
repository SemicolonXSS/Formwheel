import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);

const settings=fetch(new URL("./rapid-server-config.json",import.meta.url),{cache:"no-cache"})
 .then(async response=>{
  if(!response.ok)return null;
  const {endpoint}=await response.json();
  if(!endpoint)return null;
  const url=new URL(endpoint);
  return url.protocol==="https:"&&!url.username&&!url.password&&!url.search&&!url.hash?url.href.replace(/\/$/,""):null;
 }).catch(()=>null);

let session=0,stopWallet,mode="guest",wallet=null,catalog=[],endpoint=null,busy=false;
function notify(state=mode){
 mode=state;
 window.dispatchEvent(new CustomEvent("formwheel-rapid-account-sync",{detail:{state}}));
}
function applyWallet(value){
 if(!value){wallet={balance:"0",exchangeable:"0",purchases:[]};return;}
 if(!/^\d{1,500}$/.test(value.balance??"")||!/^\d{1,500}$/.test(value.verifiedScoreUnits??"0")){
  wallet=null;return;
 }
 wallet={balance:value.balance,exchangeable:String(BigInt(value.verifiedScoreUnits??"0")/1000n),
  purchases:Object.values(value.purchases||{})};
}
async function request(user,url,body){
 const token=await user.getIdToken();
 const response=await fetch(url,{method:body?"POST":"GET",cache:"no-store",credentials:"omit",
  headers:{Authorization:"Bearer "+token,...(body?{"Content-Type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(new Error(data.error||"Rapid 서버에 연결하지 못했어요."),{status:response.status});
 return data;
}
onAuthStateChanged(auth,async user=>{
 const ticket=++session;
 stopWallet?.();stopWallet=null;wallet=null;catalog=[];endpoint=null;
 if(!user||user.isAnonymous){notify("guest");return;}
 notify("connecting");
 stopWallet=onValue(ref(db,"formwheelV2/rapidWallets/"+user.uid),snapshot=>{
  if(ticket!==session)return;
  applyWallet(snapshot.val());
  notify();
 },()=>{if(ticket===session){wallet=null;notify();}});
 const url=await settings;
 if(ticket!==session)return;
 if(!url){notify("server-required");return;}
 try{
  const data=await request(user,url+"/wallet");
  if(ticket!==session)return;
  wallet??=data.wallet;
  catalog=data.catalog;
  endpoint=url;notify("connected");
 }catch{if(ticket===session)notify("unavailable");}
});
async function trade(action,key,fields){
 const user=auth.currentUser,ticket=session,url=endpoint;
 if(!url||!user||user.isAnonymous)throw new Error("계정에 로그인하고 Rapid 서버 연결을 확인해 주세요.");
 if(busy)throw new Error("진행 중인 거래를 기다려 주세요.");
 const storageKey="fw_rapid_pending_v3_"+user.uid+"_"+action+"_"+key;
 let id=localStorage.getItem(storageKey);
 if(!id){id="rapid_"+crypto.randomUUID();localStorage.setItem(storageKey,id);}
 busy=true;
 try{
  const data=await request(user,url+"/transactions",{action,id,...fields});
  localStorage.removeItem(storageKey);
  if(ticket!==session)throw new Error("계정이 바뀌었어요. 거래 결과는 원래 계정에서 확인해 주세요.");
  return data.wallet;
 }catch(e){
  if(e.status===409)localStorage.removeItem(storageKey);
  throw e;
 }finally{busy=false;}
}
window.FormwheelRapidAccountV3={
 signIn:()=>signInWithPopup(auth,new GoogleAuthProvider()),
 creditExchange:amount=>trade("exchange",String(amount),{amount:String(amount)}),
 buy:productId=>trade("buy",productId,{productId}),
 refund:purchaseId=>trade("refund",purchaseId,{purchaseId}),
 getStatus:()=>({signedIn:!!auth.currentUser&&!auth.currentUser.isAnonymous,connected:!!endpoint,mode}),
 getWallet:()=>wallet,
 getCatalog:()=>catalog,
 getDiagnostics:()=>{try{return JSON.parse(localStorage.getItem("formwheel_rapid_sync_audit_v1")||"[]")}catch{return []}}
};
// Older Clicker screens debit local scores after a successful call.
window.FormwheelRapidAccount={
 getStatus:()=>({...window.FormwheelRapidAccountV3.getStatus(),connected:false}),
 getDiagnostics:window.FormwheelRapidAccountV3.getDiagnostics,
 async creditExchange(){throw new Error("계정 환전은 Rapid 상점에서 이용해 주세요.");}
};
