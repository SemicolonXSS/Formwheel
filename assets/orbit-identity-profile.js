import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(a=>a.name==="[DEFAULT]")||initializeApp(config),auth=getAuth(app),db=getDatabase(app);
const colors={ECHO:"#a78bfa",NOVA:"#dfa528",VOID:"#8894b3",RIFT:"#24aabc",NULL:"#555069"};
let unsubscribe=null;
function localIdentity(){try{return JSON.parse(localStorage.getItem("formwheel.aqs.v1")||"{}").identity||""}catch{return ""}}
function paint(id){if(!Object.hasOwn(colors,id))id="";const label=document.getElementById("fw-identity-label"),msg=document.getElementById("fw-identity-message"),avatar=document.getElementById("fw-profile-avatar-wrap");if(label){label.hidden=!id;label.textContent=id;label.style.cssText="display:"+(id?"inline-flex":"none")+";align-items:center;font-size:11px;font-weight:800;letter-spacing:1px;color:"+(colors[id]||"#6654cb")+";padding:4px 9px;border-radius:99px;background:#f2effa;border:1px solid "+(colors[id]||"#ded9f4")}if(msg)msg.textContent=id?"현재 Identity: "+id+" · 언제든 무료로 변경 가능":"선택된 Identity가 없어요. AQS에서 자유롭게 선택할 수 있어요.";if(avatar)avatar.style.filter=id?"drop-shadow(0 0 7px "+colors[id]+")":""}
onAuthStateChanged(auth,user=>{if(unsubscribe){unsubscribe();unsubscribe=null}paint(localIdentity());if(user&&!user.isAnonymous){unsubscribe=onValue(ref(db,"aqs/v1/users/"+user.uid),snap=>paint(snap.val()?.identity||localIdentity()),()=>paint(localIdentity()))}});
window.addEventListener("storage",e=>{if(e.key==="formwheel.aqs.v1")paint(localIdentity())});
