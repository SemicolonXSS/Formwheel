import{initializeApp,getApps}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getDatabase,ref,get,onValue,runTransaction}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const p=new URLSearchParams(location.search),code=p.get("fwMatch"),kind=p.get("fwKind"),side=p.get("fwSide");
if(code&&["quick","friend"].includes(kind)&&["owner","guest"].includes(side)){
const app=getApps()[0]||initializeApp({apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"});
const db=getDatabase(app),path=ref(db,"formwheelV2/matchmaking/"+kind+"/"+code);
const game=location.pathname.match(/Formwheel_([^/]+)/)?.[1]?.toLowerCase();
const $=id=>document.getElementById(id),pause=ms=>new Promise(r=>setTimeout(r,ms));
const adapters={
 reflex:{start:()=>{},name:"battleName",create:"battleCreate",join:"battleJoin",input:"battleCode",display:"battleCode"},
 risk:{start:()=>{},name:"nameInput",create:"createBtn",join:"joinConfirm",input:"roomInput",display:"roomCode"},
 time:{start:()=>{if($("battleSetup")?.classList.contains("hidden"))$("battleMode")?.click()},name:"nickname",create:"createRoom",join:"joinRoom",input:"roomCode",display:"roomCodeDisplay"},
 bomb:{start:()=>{},name:"name",create:"createBtn",join:"joinBtn",input:"roomInput",display:"roomCode"},
 gcrown:{start:()=>{window.showBattleSetup?.()},name:"battleName",create:null,join:null,input:"joinCode",display:"roomCodeDisplay"},
 territory:{start:()=>{document.querySelector('[data-mode="online2"]')?.click();},name:null,create:"createRoom",join:"joinRoom",input:"roomCode",display:"roomDetail"},
 battle:{start:()=>{},name:null,create:"createBtn",join:"joinBtn",input:"joinPin",display:null}
};
const roomRoots={reflex:"reflexRooms",battle:"battle",territory:"territoryRooms",risk:"rooms",gcrown:"gcrown/rooms",time:"timeRooms",bomb:"bombRooms"};
async function checkRoom(room){if(!/^[A-Za-z0-9]{4,6}$/.test(room))return false;const snap=await get(ref(db,roomRoots[game]+"/"+room));if(!snap.exists())return false;const d=snap.val();if(game==="risk")return d.phase==="lobby" && (d.players||[]).length===1;if(game==="time")return d.meta?.status==="waiting";if(game==="battle")return d.state?.phase==="waiting";if(game==="territory")return !d.started;if(game==="reflex")return d.status==="lobby";if(game==="gcrown")return !d.started;if(game==="bomb")return d.status==="waiting";return false;}
const a=adapters[game];if(a){
const box=document.createElement("div");box.style.cssText="position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;margin:auto;z-index:99999;background:#101c36;color:white;padding:16px;border-radius:17px;box-shadow:0 15px 50px #0005;font:14px system-ui";const label=document.createElement("div");label.textContent="🎮 Formwheel 매칭 방에 연결 중…";box.append(label);const close=document.createElement("button");close.textContent="안내 닫기";close.style.cssText="float:right;margin-top:8px";close.onclick=()=>box.remove();box.append(close);document.body.append(box);
const say=t=>label.textContent="🎮 "+t;
const nick=()=>{if(a.name&&$(a.name)&&!$(a.name).value)$(a.name).value="플레이어-"+Math.floor(Math.random()*9000+1000)};
let initiated=false,joined=false,creating=false,joining=false;
async function waitUntil(check,timeout=16000){const start=Date.now();while(Date.now()-start<timeout){const v=check();if(v)return v;await pause(300)}throw Error("게임 화면 준비 시간 초과")}
function clickButton(id){const b=$(id);if(!b)throw Error("버튼을 찾지 못했습니다: "+id);b.click()}
function start(){a.start();nick()}
async function create(){
 start();
 if(game==="gcrown"){await waitUntil(()=>typeof window.createRoom==="function");await window.createRoom()}
 else if(game==="battle"){await waitUntil(()=> $("createBattle"));clickButton("createBattle");await waitUntil(()=> $("hostName")&&$("createBtn"));$("hostName").value="랜덤-"+Math.floor(Math.random()*9000);await pause(800);clickButton("createBtn")}
 else{await waitUntil(()=>$(a.create));clickButton(a.create)}
 const room=await waitUntil(()=>{
   if(game==="battle"){return document.querySelector(".pin-box .pin")?.textContent?.trim()?.match(/^\d{4}$/)?.[0]}
   if(game==="territory"){return location.hash.match(/room=([A-Z2-9]{6})/)?.[1]}
   return ($(a.display)?.value||$(a.display)?.textContent||"").trim().match(/^[A-Z0-9]{4,6}$/)?.[0]
 },20000);
 if(!(await checkRoom(room)))throw Error("방이 Firebase에 생성되지 않았거나 이미 시작되었습니다.");
 const tx=await runTransaction(path,v=>{if(!v||v.status!=="matched"||v.gameRoom)return;v.gameRoom=room;v.gameReadyAt=Date.now();return v},{applyLocally:false});
 if(!tx.committed)throw Error("매칭 방 번호 저장에 실패했어요");
 say("같은 게임방 생성 완료 · 코드 "+room+" · 상대 입장 대기");
}
async function join(room){
 if(!(await checkRoom(room)))throw Error("상대의 게임방이 없습니다. 방장이 다시 생성해야 합니다.");
 start();nick();
 if(game==="gcrown"){await waitUntil(()=>typeof window.joinRoom==="function");$("joinCode").value=room;await window.joinRoom()}
 else if(game==="battle"){await waitUntil(()=> $("joinBattle"));clickButton("joinBattle");await waitUntil(()=>$("joinPin")&&$("joinBtn"));$("joinPin").value=room;$("joinName").value="랜덤-"+Math.floor(Math.random()*9000);clickButton("joinBtn")}
 else{await waitUntil(()=>$(a.input)&&$(a.join));$(a.input).value=room;clickButton(a.join)}
 say("매칭된 게임방 "+room+"에 참가 요청을 보냈어요. 대기실 입장을 확인해 주세요.");
}
onValue(path,async snap=>{
 const v=snap.val();if(!v){say("매칭 정보가 없어졌어요. Hub에서 다시 매칭해 주세요.");return}
 try{
 if(side==="owner"&&!initiated&&!creating){creating=true;initiated=true;await pause(900);await create();creating=false}
 if(side==="guest"&&v.gameRoom&&!joined&&!joining){joining=true;joined=true;await pause(900);await join(v.gameRoom);joining=false}
 if(side==="guest"&&!v.gameRoom)say("상대가 게임방을 만들고 있어요…");
 }catch(e){creating=false;joining=false;say("자동 참가에 실패했어요: "+e.message+" · 새 게임방을 무한 생성하지 않도록 중지했어요. Hub에서 다시 매칭하거나 게임방 코드를 확인해 주세요.");console.error("Formwheel match bridge",e)}
},e=>say("Firebase 매칭 연결 오류: "+e.message));
}}
