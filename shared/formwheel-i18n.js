/* Formwheel shared localization v1.0 — use on other projects via the same script URL. */
(()=>{
"use strict";
const KEY="formwheel.language";
const supported=["ko","en"];
const lex={
 "⚔️ 빠른 대전":"⚔️ Quick Match","🎲 랜덤 플레이":"🎲 Random Play","공식 용어집":"Official Glossary",
 "오늘은 뭘 플레이할까?":"What will you play today?","편집":"Edit","순서 저장":"Save order","취소":"Cancel",
 "✨ 오늘의 추천":"✨ Today's Picks","최근 업데이트 · 새로운 게임 · 친숙한 게임":"Recently updated · New games · Familiar games",
 "추천할 프로젝트가 없어요. 추천 제외 설정을 확인해 주세요.":"No recommendations available. Check your exclusions.",
 "추천 제외 관리":"Manage exclusions","전체":"All","게임":"Games","도구":"Tools","앱":"Apps","최근 추가":"Recently added",
 "전체 인원":"All players","1인 가능":"Solo","다인 가능":"Multiplayer","1인·다인 모두":"Solo & multiplayer",
 "전체 연결":"Any connection","온라인":"Online","오프라인":"Offline","전체 난이도":"All difficulties",
 "쉬움":"Easy","보통":"Normal","어려움":"Hard","필터 초기화":"Reset filters",
 "기본순":"Default order","이름순":"Name","최근 추가순":"Newest",
 "Google 로그인":"Sign in with Google","로그아웃":"Sign out","계정 연결 확인 중…":"Checking account…",
 "📥 Formwheel 앱 설치":"📥 Install Formwheel","설치 방법 확인":"Installation guide","다른 기기 보기 ▾":"Other devices ▾",
 "💻 PC에서 다운로드":"💻 Install on PC","🤖 Android에서 다운로드":"🤖 Install on Android","🍎 iPhone에서 추가":"🍎 Add to iPhone",
 "코드 참가":"Join by code","복사":"Copy","선택된 게임 열기 →":"Open selected game →","나가기 / 매칭 취소":"Leave / Cancel match",
 "📚 Wiki":"📚 Wiki","ID 센터 열기 →":"Open ID Center →",
 "고정한 프로젝트":"Pinned projects",
 "위아래 버튼으로 순서를 변경하세요.":"Use the up and down buttons to reorder.",
 "이벤트 참여하기 →":"Join event →"
};
const placeholders={"🔎 프로젝트 검색...":"🔎 Search projects...","친구 코드 6자리":"6-digit friend code"};
const originals=new WeakMap();
const targetSelectors=[
 "#fw-nav-quick","#fw-nav-friend",'header nav a[href="#projects"]',"header nav a[href*='glossary']",
 "#fw-home h2","#fw-home h3","#fw-edit-toggle","#fw-edit-save","#fw-edit-cancel","#fw-home-editor p",
 "#fw-recommended-empty","#fw-excluded-show","#fw-home .fw-home-recommend-heading",
 ".categoryButtons button","#modeFilter option","#connectionFilter option","#difficultyFilter option",
 "#resetFilters","#sort option","#fw-id-login","#fw-id-logout","#fw-id-status",
 "#fw-install-title","#fw-install-primary","#fw-install-more",".fw-install-option",
 "#fw-match-friend-join","#fw-match-copy","#fw-match-launch","#fw-match-stop",
 "#fw-id-center-shortcut a","#fw-anniversary-banner a"
];
function language(){let value;try{value=localStorage.getItem(KEY)}catch{}return supported.includes(value)?value:"ko"}
function translateElement(el,lang){
 if(!originals.has(el)){originals.set(el,Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>[n,n.textContent]));}
 for(const [node,original] of originals.get(el)){
  const trimmed=original.trim();if(!trimmed)continue;
  const replacement=lang==="en"?lex[trimmed]:null;
  if(replacement){node.textContent=original.replace(trimmed,replacement)}
  else {node.textContent=original}
 }
}
function apply(lang){
 document.documentElement.lang=lang;
 for(const sel of targetSelectors)document.querySelectorAll(sel).forEach(el=>translateElement(el,lang));
 document.querySelectorAll("[data-fw-i18n]").forEach(el=>{
   const key=el.getAttribute("data-fw-i18n");el.textContent=lang==="en"?(lex[key]||key):key;
 });
 document.querySelectorAll("input[placeholder]").forEach(el=>{
  const original=el.dataset.fwOriginalPlaceholder||(el.dataset.fwOriginalPlaceholder=el.placeholder);
  el.placeholder=lang==="en"?(placeholders[original]||original):original;
 });
 const picker=document.getElementById("fw-language");if(picker)picker.value=lang;
 window.dispatchEvent(new CustomEvent("formwheel:languagechange",{detail:{language:lang}}));
}
function setLanguage(lang){if(!supported.includes(lang))return;try{localStorage.setItem(KEY,lang)}catch{}apply(lang)}
window.FormwheelI18n={getLanguage:language,setLanguage,t:(k)=>language()==="en"?(lex[k]||k):k};
function mount(){
 if(!document.getElementById("fw-language")){
  const target=document.querySelector("header .fw-profile-trigger")||document.querySelector("header");
  if(target){
   const wrap=document.createElement("label");wrap.className="fw-language-control";
   wrap.innerHTML='<span aria-hidden="true">🌐</span><span class="fw-language-sr">Language / 언어</span><select id="fw-language" aria-label="Language / 언어"><option value="ko">한국어</option><option value="en">English</option></select>';
   target.before(wrap);
   wrap.querySelector("select").addEventListener("change",e=>setLanguage(e.target.value));
  }
 }
 apply(language());
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
window.addEventListener("storage",e=>{if(e.key===KEY)apply(language())});
})();
