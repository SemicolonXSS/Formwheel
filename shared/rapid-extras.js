/* Rapid Extras v1: cosmetic-only, local-browser beta shared by Hub and Clicker Shop. */
(function(){
"use strict";
const WALLET_KEY="formwheel_clicker_rapid_beta_v1";
const EXTRAS_KEY="formwheel_rapid_extras_v1";
const BASE="https://semicolonxss.github.io/";
const PROJECTS=[
 ["Formwheel_Reflex","⚡ Reflex"],["Formwheel_Maze","🌀 Maze"],
 ["Formwheel_Cook","🍳 Cook"],["Formwheel_Music","🎵 Music"],
 ["Formwheel_Quiz","🧩 Quiz"],["Formwheel_Clicker","🖱️ Clicker"],
 ["Formwheel_Paint","🎨 Paint"],["Formwheel_AQS","🏆 AQS"]
];
const CATALOG=[
 {id:"frame-amber",category:"frame",name:"앰버 링",icon:"🟠",price:25,desc:"프로필 아이콘에 따뜻한 테두리 추가"},
 {id:"frame-aurora",category:"frame",name:"오로라 링",icon:"🌈",price:60,desc:"민트와 보라색의 반짝이는 테두리"},
 {id:"frame-orbit",category:"frame",name:"오빗 링",icon:"🪐",price:100,desc:"궤도 느낌의 우주 테두리"},
 {id:"title-adventurer",category:"title",name:"모험가 칭호",icon:"🧭",price:20,desc:"프로필 이름 아래에 모험가 표시"},
 {id:"title-maker",category:"title",name:"메이커 칭호",icon:"🛠️",price:45,desc:"프로필 이름 아래에 메이커 표시"},
 {id:"title-vanguard",category:"title",name:"개척자 칭호",icon:"🚀",price:90,desc:"프로필 이름 아래에 개척자 표시"},
 {id:"glow-peach",category:"glow",name:"피치 네임",icon:"🍑",price:35,desc:"닉네임에 복숭아빛 강조 효과"},
 {id:"glow-cyan",category:"glow",name:"시안 네임",icon:"💠",price:65,desc:"닉네임에 밝은 청록 강조 효과"},
 {id:"card-mint",category:"card",name:"민트 프로필 카드",icon:"🍀",price:40,desc:"프로필 미리보기 배경 변경"},
 {id:"card-dusk",category:"card",name:"노을 프로필 카드",icon:"🌇",price:75,desc:"프로필 미리보기 배경 변경"},
 {id:"ribbon-day",category:"ribbon",name:"오늘도 플레이 리본",icon:"🎈",price:30,desc:"Hub 상단에 나만의 인사 리본 표시"},
 {id:"ribbon-space",category:"ribbon",name:"우주 탐험 리본",icon:"🌠",price:75,desc:"Hub 상단에 은하수 리본 표시"},
 {id:"bio-unlock",category:"bio",name:"한 줄 소개",icon:"✍️",price:35,desc:"프로필 소개 문구를 직접 저장 (최대 60자)"},
 {id:"shortcut-unlock",category:"shortcut",name:"퀵 런처",icon:"🚀",price:50,desc:"Hub 상단에 내 전용 프로젝트 바로가기 1개"}
];
const CATS=[["all","전체"],["frame","테두리"],["title","칭호"],["glow","닉네임"],["card","카드"],["ribbon","Hub 리본"],["bio","한 줄 소개"],["shortcut","바로가기"]];
const EQUIPPABLE=new Set(["frame","title","glow","card","ribbon"]);
const byId=id=>document.getElementById(id);
const safeLoad=(key,defaultValue)=>{
 try{const data=JSON.parse(localStorage.getItem(key));return data&&typeof data==="object"?data:defaultValue}
 catch{return defaultValue}
};
const known=new Map(CATALOG.map(x=>[x.id,x]));
function stateRead(){
 const data=safeLoad(EXTRAS_KEY,{});
 const owned=[...new Set((Array.isArray(data.owned)?data.owned:[]).filter(id=>typeof id==="string"&&known.has(id)))];
 const equipped={};
 for(const type of EQUIPPABLE){
  const id=data.equipped&&data.equipped[type];
  equipped[type]=owned.includes(id)&&known.get(id)?.category===type?id:null;
 }
 return {owned,equipped,bio:typeof data.bio==="string"?data.bio.slice(0,60):"",shortcut:PROJECTS.some(p=>p[0]===data.shortcut)?data.shortcut:PROJECTS[0][0]};
}
function walletRead(){
 const w=safeLoad(WALLET_KEY,null);
 if(!w)return null;
 const balance=typeof w.balance==="string"?w.balance:(Number.isSafeInteger(w.balance)?String(w.balance):"");
 return /^\\d+$/.test(balance)?{...w,balance}:null;
}
function saveState(state){localStorage.setItem(EXTRAS_KEY,JSON.stringify(state))}
const owned=(state,id)=>state.owned.includes(id);
const equipped=(state,type)=>state.equipped[type]?known.get(state.equipped[type]):null;
const format=n=>BigInt(n).toLocaleString("ko-KR");
function notify(message){
 const out=byId("fw-rapid-extra-status");if(out)out.textContent=message;
}
function purchase(id){
 const item=known.get(id),wallet=walletRead(),state=stateRead();
 if(!item||!wallet){notify("Rapid 지갑을 확인해 주세요.");return}
 if(owned(state,id)){notify("이미 보유한 상품입니다.");return}
 if(BigInt(wallet.balance)<BigInt(item.price)){notify("Rapid가 부족해요! Clicker 환전소에서 모을 수 있어요.");return}
 if(!confirm(item.name+"을(를) "+item.price+" R에 구매할까요? 구매 상품은 이 브라우저에 저장됩니다."))return;
 const latest=walletRead(),again=stateRead();
 if(!latest||BigInt(latest.balance)<BigInt(item.price)||owned(again,id)){notify("잔액 또는 구매 상태가 변경됐어요. 다시 확인해 주세요.");return}
 const previous=localStorage.getItem(WALLET_KEY);
 const after={...latest,balance:(BigInt(latest.balance)-BigInt(item.price)).toString()};
 again.owned.push(id);
 try{
  localStorage.setItem(WALLET_KEY,JSON.stringify(after));
  saveState(again);
  notify(item.name+" 구매 완료! "+(EQUIPPABLE.has(item.category)?"장착 버튼을 눌러 적용하세요.":"아래 설정에서 사용할 수 있어요."));
  renderAll();
 }catch(error){
  try{if(previous===null)localStorage.removeItem(WALLET_KEY);else localStorage.setItem(WALLET_KEY,previous)}catch{}
  notify("저장에 실패했어요. 이 브라우저의 저장 공간을 확인해 주세요.");
 }
}
function toggleEquip(id){
 const item=known.get(id),state=stateRead();
 if(!item||!EQUIPPABLE.has(item.category)||!owned(state,id))return;
 state.equipped[item.category]=state.equipped[item.category]===id?null:id;
 try{saveState(state);notify(state.equipped[item.category]?item.name+" 장착 완료!":"장착을 해제했어요.");renderAll()}
 catch{notify("장착 정보 저장에 실패했어요.")}
}
const style=document.createElement("style");
style.textContent=[
 "#fw-rapid-extra{background:#fff;border:1px solid #dedcf0;border-radius:18px;padding:18px;margin:15px 0}",
 "#fw-rapid-extra h2{margin:0 0 10px}",
 ".fw-rx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:11px;margin:16px 0}",
 ".fw-rx-item{border:1px solid #d8d6e9;border-radius:14px;padding:13px;background:#faf9ff;color:#27263e}",
 ".fw-rx-item strong{display:block;margin:4px 0}.fw-rx-item p{font-size:13px;color:#5a5d70;min-height:36px;margin:5px 0}",
 ".fw-rx-item small{display:block;color:#585b72;margin-bottom:10px}",
 ".fw-rx-item button,.fw-rx-config button{border:0;border-radius:9px;background:#5b48b8;color:white;padding:9px 13px;font:inherit;font-weight:700;cursor:pointer}",
 ".fw-rx-item button[disabled]{background:#ddd;color:#555;cursor:default}",
 ".fw-rx-config{background:#f6f4ff;border:1px solid #ddd9f6;border-radius:12px;padding:12px;margin:12px 0}",
 ".fw-rx-config textarea,.fw-rx-config select{display:block;margin:8px 0;padding:10px;max-width:100%;width:100%;border:1px solid #c8c4e5;border-radius:8px;background:white;color:#25283e}",
 "#fw-rapid-extra-filter{padding:8px;border-radius:8px;border:1px solid #bbb7e0;max-width:100%;background:white;color:#25283e}",
 ".fw-rx-ribbon{border-radius:14px;padding:12px 16px;margin:8px 0;font-weight:750;text-align:center;background:linear-gradient(95deg,#ffe7be,#f7c7ea);color:#48314e}",
 ".fw-rx-ribbon[data-kind='ribbon-space']{background:linear-gradient(95deg,#1d2b59,#7455af);color:white}",
 ".fw-rx-hubbar{max-width:820px;margin:9px auto;padding:12px 16px;background:#fff;border:1px solid #ded9f4;border-radius:14px;color:#27263e;text-align:center}",
 ".fw-rx-hubbar a{color:#5140ab;text-decoration:none;font-weight:750;margin:0 6px}",
 ".fw-rx-title{display:inline-block;margin:4px 0 2px;padding:3px 9px;border-radius:30px;background:#ece9ff;color:#433699;font-size:12px;font-weight:750}",
 ".fw-rx-profile-msg{display:block;margin-top:5px;font-size:13px;color:#34415b;white-space:pre-wrap;overflow-wrap:anywhere}",
 "@media(max-width:520px){#fw-rapid-extra{padding:12px}.fw-rx-grid{grid-template-columns:1fr 1fr}.fw-rx-item{padding:9px}.fw-rx-item p{min-height:54px}}"
].join("\n");
document.head.append(style);
let filter="all";
function buildShop(){
 if(byId("fw-rapid-extra")||!byId("balance")||!byId("items"))return;
 const root=document.createElement("section");root.id="fw-rapid-extra";root.setAttribute("aria-label","Rapid 확장 상점");
 root.innerHTML='<h2>✨ Rapid 확장 상점</h2><p class="muted">프로필·Hub를 꾸미는 영구 상품 14종! 구매한 상품은 이 브라우저에서 사용해요.</p><p><strong id="fw-rapid-extra-balance"></strong> · <a href="https://semicolonxss.github.io/Formwheel/profile.html">내 프로필 확인 ↗</a></p><label for="fw-rapid-extra-filter">종류별 보기</label> <select id="fw-rapid-extra-filter"></select><div class="fw-rx-grid" id="fw-rapid-extra-items"></div><div id="fw-rx-settings"></div><p id="fw-rapid-extra-status" role="status" aria-live="polite"></p><p class="muted">베타 안내: Rapid는 실제 돈이 아니며 결제·상품 내역은 서버에 동기화되지 않아요. 기기 저장 데이터를 지우면 구매 내역이 사라질 수 있습니다. 새 상품은 환불 기능과 아직 연결되지 않았습니다.</p>';
 const place=byId("items").closest(".panel");
 if(place)place.insertAdjacentElement("afterend",root);else document.querySelector("main")?.append(root);
 const options=byId("fw-rapid-extra-filter");
 CATS.forEach(([id,label])=>{const o=document.createElement("option");o.value=id;o.textContent=label;options.append(o)});
 options.addEventListener("change",()=>{filter=options.value;renderShop()});
 root.addEventListener("click",event=>{
  const buy=event.target.closest("button[data-rx-buy]");
  const equip=event.target.closest("button[data-rx-equip]");
  if(buy)purchase(buy.dataset.rxBuy);
  else if(equip)toggleEquip(equip.dataset.rxEquip);
 });
}
function renderShop(){
 const host=byId("fw-rapid-extra-items");if(!host)return;
 const s=stateRead(),w=walletRead();
 byId("fw-rapid-extra-balance").textContent=w?"보유 "+format(w.balance)+" R":"지갑 확인 필요";
 if(byId("balance")){if(typeof window.render==="function"){try{window.render()}catch{}}else byId("balance").textContent=w?format(w.balance)+" R":"지갑 확인 필요";}
 host.replaceChildren();
 for(const item of CATALOG.filter(p=>filter==="all"||p.category===filter)){
  const box=document.createElement("div");box.className="fw-rx-item";
  const icon=document.createElement("div");icon.style.fontSize="26px";icon.textContent=item.icon;
  const name=document.createElement("strong");name.textContent=item.name;
  const desc=document.createElement("p");desc.textContent=item.desc;
  const price=document.createElement("small");price.textContent=format(item.price)+" R"+(owned(s,item.id)?" · 보유중":"");
  const button=document.createElement("button");
  if(owned(s,item.id)){
   if(EQUIPPABLE.has(item.category)){button.dataset.rxEquip=item.id;button.textContent=s.equipped[item.category]===item.id?"✓ 장착 중 · 해제":"장착하기";}
   else{button.disabled=true;button.textContent="✓ 해금됨"}
  }else{button.dataset.rxBuy=item.id;button.textContent="구매";button.disabled=!w||BigInt(w.balance)<BigInt(item.price)}
  box.append(icon,name,desc,price,button);host.append(box);
 }
 const settings=byId("fw-rx-settings");settings.replaceChildren();
 if(owned(s,"bio-unlock")){
  const block=document.createElement("div");block.className="fw-rx-config";
  const label=document.createElement("strong");label.textContent="✍️ 내 한 줄 소개 설정 (최대 60자)";
  const input=document.createElement("textarea");input.rows=2;input.maxLength=60;input.value=s.bio;input.setAttribute("aria-label","내 프로필 소개");
  const btn=document.createElement("button");btn.textContent="소개 저장";
  btn.onclick=()=>{const latest=stateRead();if(!owned(latest,"bio-unlock"))return;latest.bio=input.value.trim().slice(0,60);try{saveState(latest);notify("소개를 저장했어요.");renderAll()}catch{notify("소개 저장 실패")}};
  block.append(label,input,btn);settings.append(block);
 }
 if(owned(s,"shortcut-unlock")){
  const block=document.createElement("div");block.className="fw-rx-config";
  const label=document.createElement("strong");label.textContent="🚀 내 퀵 런처 목적지";
  const select=document.createElement("select");select.setAttribute("aria-label","바로가기 프로젝트");
  for(const [id,name] of PROJECTS){const option=document.createElement("option");option.value=id;option.textContent=name;select.append(option)}
  select.value=s.shortcut;
  const btn=document.createElement("button");btn.textContent="바로가기 저장";
  btn.onclick=()=>{const latest=stateRead();if(!owned(latest,"shortcut-unlock")||!PROJECTS.some(p=>p[0]===select.value))return;latest.shortcut=select.value;try{saveState(latest);notify("Hub 바로가기를 설정했어요.");renderAll()}catch{notify("바로가기 저장 실패")}};
  block.append(label,select,btn);settings.append(block);
 }
}
function renderProfile(){
 const preview=document.querySelector(".fw-profile-preview");
 if(!preview||!byId("fw-profile-avatar-wrap"))return;
 const s=stateRead(),wrap=byId("fw-profile-avatar-wrap"),name=byId("fw-profile-name");
 const frame=equipped(s,"frame"),title=equipped(s,"title"),glow=equipped(s,"glow"),card=equipped(s,"card");
 wrap.style.borderRadius="50%";
 wrap.style.outline=frame?(frame.id==="frame-amber"?"4px solid #e4a04c":frame.id==="frame-aurora"?"4px solid #66d9c4":"4px solid #9272d4"):"";
 wrap.style.outlineOffset=frame?"4px":"";
 name.style.textShadow=glow?(glow.id==="glow-peach"?"0 0 7px #f5a0a5":"0 0 8px #4fcbe0"):"";
 name.style.color=glow?(glow.id==="glow-peach"?"#b35454":"#217992"):"";
 preview.style.borderRadius=card?"16px":"";
 preview.style.padding=card?"12px":"";
 preview.style.background=card?(card.id==="card-mint"?"linear-gradient(125deg,#d6fff0,#dbedff)":"linear-gradient(125deg,#ffe1b8,#f3c5df)"):"";
 let label=byId("fw-rx-profile-title"),bio=byId("fw-rx-profile-bio");
 if(!label){label=document.createElement("span");label.id="fw-rx-profile-title";label.className="fw-rx-title";name.parentNode?.append(label)}
 if(!bio){bio=document.createElement("span");bio.id="fw-rx-profile-bio";bio.className="fw-rx-profile-msg";name.parentNode?.append(bio)}
 label.hidden=!title;label.textContent=title?title.icon+" "+title.name:"";
 bio.hidden=!owned(s,"bio-unlock")||!s.bio;
 bio.textContent=owned(s,"bio-unlock")?s.bio:"";
 let link=byId("fw-rx-profile-shop");
 if(!link){link=document.createElement("a");link.id="fw-rx-profile-shop";link.href=BASE+"Formwheel_Clicker/rapid-shop.html";link.textContent="🪙 Rapid 장식 상점 →";link.style.cssText="display:inline-block;margin:12px 0;font-weight:750;color:#5842b1";preview.insertAdjacentElement("afterend",link)}
}
function renderHub(){
 const anchor=byId("rapid-customization-link");
 if(!anchor)return;
 const s=stateRead(),w=walletRead();
 let host=byId("fw-rx-hub");
 if(!host){host=document.createElement("div");host.id="fw-rx-hub";anchor.insertAdjacentElement("afterend",host)}
 host.replaceChildren();
 const bar=document.createElement("div");bar.className="fw-rx-hubbar";
 const count=document.createElement("span");count.textContent="🪙 내 Rapid: "+(w?format(w.balance)+" R":"지갑 확인 필요")+" · ";
 const link=document.createElement("a");link.href=BASE+"Formwheel_Clicker/rapid-shop.html";link.textContent="상점";
 bar.append(count,link);
 if(owned(s,"shortcut-unlock")){
  const selected=PROJECTS.find(p=>p[0]===s.shortcut)||PROJECTS[0];
  const quick=document.createElement("a");quick.href=BASE+selected[0]+"/";quick.textContent="🚀 "+selected[1]+" 바로가기";bar.append(quick);
 }
 host.append(bar);
 const ribbon=equipped(s,"ribbon");
 if(ribbon){
  const node=document.createElement("div");node.className="fw-rx-ribbon";node.dataset.kind=ribbon.id;
  node.textContent=ribbon.id==="ribbon-day"?"🎈 오늘도 Formwheel과 즐거운 도전!":"🌠 나만의 우주, 새로운 프로젝트를 탐험하자!";
  host.append(node);
 }
 const avatar=byId("fw-header-avatar"),frame=equipped(s,"frame");
 if(avatar){avatar.style.outline=frame?"2px solid "+(frame.id==="frame-amber"?"#e4a04c":frame.id==="frame-aurora"?"#66d9c4":"#9272d4"):"";avatar.style.outlineOffset=frame?"2px":"";avatar.style.borderRadius=frame?"50%":""}
}
function renderAll(){renderShop();renderProfile();renderHub()}
function start(){buildShop();renderAll()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.addEventListener("storage",event=>{if([WALLET_KEY,EXTRAS_KEY].includes(event.key))renderAll()});
window.addEventListener("pageshow",renderAll);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderAll()});
})();