/* PEAK WITNESS C: display only server-awarded records. */
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,onValue} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const config={apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"};
const app=getApps().find(x=>x.name==="[DEFAULT]")||initializeApp(config);
const auth=getAuth(app),db=getDatabase(app);
const milestoneSteps=[5,10,20,50,100];
const isAqs=location.pathname.startsWith("/Formwheel_AQS");
const css=document.createElement("style");
css.textContent=`
#fw-peak-awards{margin:12px auto;padding:14px;border:1px solid #c8b8f3;border-radius:16px;background:linear-gradient(125deg,#f6f1ff,#fff9e9);color:#302452;max-width:1020px;font:inherit}
#fw-peak-awards h3{margin:0 0 6px;font-size:16px;color:#34205e}
#fw-peak-awards p{margin:4px 0;font-size:12px;line-height:1.6}
#fw-peak-awards .fw-peak-steps{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#fw-peak-awards .fw-peak-step{padding:5px 9px;border-radius:999px;border:1px solid #d9d0e7;font-size:11px;color:#51446a;background:white}
#fw-peak-awards .fw-peak-step.earned{background:#443079;color:white;border-color:#443079}
#fw-peak-awards a{color:#5739b3;font-weight:700}
#fw-peak-award-toast{position:fixed;z-index:2147483001;top:15px;left:50%;transform:translateX(-50%);max-width:90vw;border-radius:14px;padding:14px 18px;background:#302058;color:#fff;box-shadow:0 10px 35px #1e143b55;font-weight:700}
`;
css.textContent+=`
#fw-peak-awards.fw-peak-compact{box-sizing:border-box;width:min(92%,760px);max-width:760px;margin:18px auto 22px;padding:9px 12px;border-radius:11px;box-shadow:none}
#fw-peak-awards.fw-peak-compact h3{font-size:12px;margin:0 0 3px}
#fw-peak-awards.fw-peak-compact p{font-size:10px;line-height:1.4;margin:2px 0}
#fw-peak-awards.fw-peak-compact .fw-peak-steps{gap:4px;margin-top:5px}
#fw-peak-awards.fw-peak-compact .fw-peak-step{font-size:10px;padding:3px 6px}
@media(max-width:480px){#fw-peak-awards.fw-peak-compact{width:calc(100% - 28px);padding:8px 10px;margin:14px auto}}
`;
document.head.appendChild(css);
const root=document.createElement("section");root.id="fw-peak-awards";root.setAttribute("aria-label","최고 동접 목격 배지");
root.innerHTML='<h3>👑 PEAK WITNESS · 최고 동접 목격자</h3><p id="fw-peak-awards-status">배지 기록 확인 중…</p><div class="fw-peak-steps" id="fw-peak-awards-steps"></div><p>최고 동접 신기록 순간 접속한 사람에게 일반 배지, 5·10·20·50·100명 기록에는 특별 배지가 지급됩니다.</p>';
const mount=()=>{if(isAqs){const anchor=document.querySelector(".hero");if(anchor)anchor.insertAdjacentElement("afterend",root);else document.querySelector("main")?.prepend(root);return;}const footer=document.querySelector("footer");if(footer){footer.insertAdjacentElement("beforebegin",root)}else{(document.querySelector("main")||document.body).appendChild(root)}root.classList.add("fw-peak-compact");};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
const status=root.querySelector("#fw-peak-awards-status"),steps=root.querySelector("#fw-peak-awards-steps");
let off=null,previous=null;
function toast(message){if(document.hidden)return;document.getElementById("fw-peak-award-toast")?.remove();const t=document.createElement("div");t.id="fw-peak-award-toast";t.setAttribute("role","status");t.textContent=message;document.body.append(t);setTimeout(()=>t.remove(),4800)}
function render(data){
 const best=Math.max(0,Number(data?.bestWitnessed)||0);
 const medals=data?.milestones||{};
 if(previous!==null&&best>previous)toast("👑 PEAK WITNESS! 최고 동접 "+best+"명 목격!");
 previous=best;
 status.textContent=best?"🏆 획득 완료 · 최고 "+best+"명 목격 · 영구 배지":"아직 획득 전 · 다음 최고 동접 신기록을 기다려 보세요!";
 steps.replaceChildren(...milestoneSteps.map(n=>{const s=document.createElement("span");s.className="fw-peak-step"+(medals[n]?" earned":"");s.textContent=(medals[n]?"🏅 ":"🔒 ")+n+"명";s.title=medals[n]?"특별 배지 획득":"미획득";return s}));
}
onAuthStateChanged(auth,user=>{
 if(off){off();off=null}previous=null;
 if(!user){status.textContent="로그인 상태 확인 중…";return}
 off=onValue(ref(db,"formwheelV2/peakWitness/users/"+user.uid),s=>render(s.val()),e=>{status.textContent="배지 기록을 읽을 수 없습니다 · Firebase Rules/배포 확인";console.warn("PEAK WITNESS read",e.code||e)});
});
