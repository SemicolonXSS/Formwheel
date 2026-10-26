/* Formwheel achievement toast: derives badges from existing trustworthy records. */
import {BADGES,earnedBadge} from "./badge-catalog.js";
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",storageBucket:"formwheel.firebasestorage.app",messagingSenderId:"431583088241",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const css=document.createElement("style");
css.textContent=`
#fw-achievement-toast{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translate(-50%,-160%);z-index:2147483000;display:flex;align-items:center;gap:13px;width:min(380px,calc(100vw - 28px));padding:13px 17px;background:linear-gradient(120deg,#182342,#263662);border:2px solid #f6ce69;border-radius:15px;box-shadow:0 12px 35px #10172a55;color:#fff;pointer-events:none;opacity:0;transition:transform .48s cubic-bezier(.17,.85,.35,1.16),opacity .3s ease;font:inherit;box-sizing:border-box}
#fw-achievement-toast.show{transform:translate(-50%,0);opacity:1}
#fw-achievement-toast .fw-achievement-icon{font-size:32px;flex:none}
#fw-achievement-toast strong{display:block;font-size:12px;letter-spacing:.06em;color:#ffdd88}
#fw-achievement-toast span.fw-achievement-title{display:block;font-size:16px;font-weight:800;margin-top:3px}
@media(prefers-reduced-motion:reduce){#fw-achievement-toast{transition:none}}
`;
document.head.append(css);
const toast=document.createElement("div");
toast.id="fw-achievement-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");
toast.innerHTML='<span class="fw-achievement-icon"></span><div><strong>🏆 업적 달성!</strong><span class="fw-achievement-title"></span></div>';
document.body.append(toast);
const queue=[];let running=false;
async function notify(b){
 queue.push(b);if(running)return;running=true;
 while(queue.length){
  const badge=queue.shift();
  toast.querySelector(".fw-achievement-icon").textContent=badge.icon;
  toast.querySelector(".fw-achievement-title").textContent=badge.title;
  toast.classList.add("show");
  await new Promise(resolve=>setTimeout(resolve,3400));
  toast.classList.remove("show");
  await new Promise(resolve=>setTimeout(resolve,450));
 }
 running=false;
}
let unsubs=[],state={},ready={},userKey="guest",generation=0;
const sources=["home","profile","stats","awards","peak"];
function getLocal(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
function check(){
 if(!sources.every(k=>ready[k]))return;
 const achievementStats={...state.stats,communityLivePeak:state.peak?.count};
 const current=BADGES.filter(b=>earnedBadge(b,state.awards,state.home,state.profile,achievementStats)).map(b=>b.id);
 const storageKey="fw:badge:seen:v2:"+userKey;
 const old=getLocal(storageKey);
 if(Array.isArray(old)){
  const known=new Set(old);
  const newOnes=current.filter(id=>!known.has(id));
  // Only animate a few at a time when many older awards were imported.
  newOnes.slice(0,4).forEach(id=>{const badge=BADGES.find(b=>b.id===id);if(badge)notify(badge)});
 }
 try{localStorage.setItem(storageKey,JSON.stringify(current))}catch{}
}
function received(key,value){state[key]=value||{};ready[key]=true;check()}
window.addEventListener("fw:hub:changed",event=>{
 if(userKey!=="guest"&&!ready.home)return;
 received("home",event.detail?.state);
});
onAuthStateChanged(auth,user=>{
 unsubs.forEach(off=>off());unsubs=[];generation++;
 const gen=generation;
 userKey=user&&!user.isAnonymous?user.uid:"guest";
 state={};ready={};
 if(user&&!user.isAnonymous){
  unsubs.push(onValue(ref(db,"formwheelV2/visitorStats/livePeak"),snap=>{if(gen===generation)received("peak",snap.val())},()=>{if(gen===generation)received("peak",{})}));
  for(const [key,path] of [
   ["home","formwheelV2/hubHomes/"+user.uid],
   ["profile","formwheelV2/hubProfiles/"+user.uid],
   ["stats","formwheelV2/achievementStats/"+user.uid],
   ["awards","formwheelV2/anniversary4050/"+user.uid+"/badges"]]){
   unsubs.push(onValue(ref(db,path),snap=>{if(gen===generation)received(key,snap.val())},()=>{if(gen===generation)received(key,{})}));
  }
 }else{
  received("peak",{});
  received("profile",getLocal("fw:profile:guest:v1"));
  received("stats",{});
  received("awards",{});
  received("home",window.FormwheelHubHome?.read()||getLocal("fw:hub:home:v1")||{});
 }
});
