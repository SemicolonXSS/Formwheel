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
Object.assign(lex,{
 "일정을 기록하고 코드로 공유하는 나만의 캘린더. Formwheel 이벤트도 함께 확인!": "Your personal calendar: record plans, share by code, and check Formwheel events.",
 "합성함수·역함수를 개념부터 응용까지 배우는 고등수학 학습 로드맵. 단계를 자유롭게 건너뛸 수 있는 베타.": "Learn composite and inverse functions, from concepts to applications. Skip freely through this beta course.",
 "축구·농구 2종목! CPU 대전과 한 기기 2인 대전, 슛·킥·점프가 가능한 스포츠 게임.": "Play soccer and basketball against the CPU or a friend on one device. Shoot, kick, and jump!",
 "체스·바둑·오목·오델로 4종! 규칙을 읽고 로컬 2인 대전 또는 방 코드로 친구와 온라인 플레이.": "Chess, Go, Gomoku, and Othello. Read the rules and play locally or online with a room code.",
 "친구들과 텔레파시가 통할까? 같은 답을 고르는 6라운드 싱크 파티 게임! 한 기기 파티와 온라인 방 코드.": "Think alike in this six-round party game! Play on one device or join an online room.",
 "친구와 문장·그림을 번갈아 전달하는 낙서 릴레이! 2~8인 방 코드, 실시간 턴 진행과 앨범 공개.": "Pass sentences and drawings between 2–8 friends, with room codes, live turns, and a shared album.",
 "친구와 같은 캔버스에서 실시간으로 함께 그리는 협업 화이트보드! 방 코드와 초대 링크, 그림 저장 지원.": "Draw together on a shared canvas in real time. Room codes, invite links, and image export supported.",
 "펜·도형·페인트통으로 자유롭게 그리는 그림판! PNG 저장, 이미지 불러오기, 자동 임시 저장 지원.": "Draw with pens, shapes, and a paint bucket. Import images, export PNGs, and save drafts automatically.",
 "프레임별 그림과 타임라인으로 애니메이션 제작! 어니언 스킨, GIF·WebM 내보내기 지원.": "Create frame-by-frame animations on a timeline, with onion skinning and GIF or WebM export.",
 "랜덤 게임 5개를 중복 없이 뽑아 연속 도전! 진행도 저장과 재추첨 지원.": "Try five different randomly selected games in a row. Save progress or draw a new set.",
 "5~10초마다 글리치가 누적되는 120초 생존 게임! 장애물을 피하고 에너지 조각을 모아봐.": "Survive for 120 seconds as glitches stack every 5–10 seconds. Dodge obstacles and collect energy.",
 "방해 봇과 함정을 피해 탈출! 미로를 직접 조작하는 2인 로컬 배틀도 즐겨봐.": "Escape bots and traps, or control the maze yourself in a local two-player battle.",
 "질문을 추가해 설문을 만들고 링크로 공유하며 응답을 확인하는 도구.": "Create surveys, share them by link, and review responses.",
 "항목을 입력하고 돌림판을 돌려 무작위로 하나를 선택하는 추첨 도구.": "Enter choices and spin the wheel to pick one at random.",
 "문제를 직접 만들고 다른 사람과 공유해 풀 수 있는 퀴즈 도구.": "Create quizzes and share them for others to solve.",
 "ROT13, Base64, HTML, 진법 등을 인코딩하고 디코딩하는 도구.": "Encode and decode ROT13, Base64, HTML, number bases, and more.",
 "텍스트와 스티커를 배치하고 이동·삭제하며 콘텐츠를 편집하는 도구.": "Create content by placing, moving, and deleting text and stickers.",
 "계산기·타이머와 성별 패턴·저장·CSV를 지원하는 자리 배치 등 생활 도구 모음.": "Everyday tools including a calculator, timer, and seating planner with gender patterns, saving, and CSV support.",
 "투표방을 만들고 친구들과 투표하며 실시간 결과를 확인하는 도구.": "Create a voting room, invite friends, and see results in real time.",
 "Formwheel 프로젝트의 개선 항목을 체크하고 진행률을 확인하는 관리 도구.": "Track improvements and check development progress across Formwheel projects.",
 "날짜별 일기와 기분을 기록하고 검색·백업할 수 있는 개인 기록 앱.": "Keep a diary and mood history, with search and backup.",
 "채팅방에서 닉네임을 사용해 친구들과 실시간으로 메시지를 주고받는 앱.": "Chat with friends in real time using nicknames.",
 "대화와 기억 기능을 시험해 볼 수 있는 Formwheel AI 실험 프로젝트.": "An experimental Formwheel AI project for testing conversation and memory.",
 "Formwheel의 문서를 읽고 편집 요청을 제출하는 공식 위키.": "Read Formwheel documentation and submit edit requests in the official wiki.",
 "업적·퀘스트·비밀 요소를 확인하고 도전하는 통합 공간.": "Explore achievements, quests, and secrets in one place.",
 "오늘의 추천 프로젝트와 도전 미션을 확인하는 공간.": "Discover today's recommended projects and challenges.",
 "Formwheel 세계관의 이야기를 진행하는 스토리 게임.": "Play through stories set in the Formwheel universe.",
 "솔로 AI 연습과 친구 초대 온라인 1대1 아레나. 특수 능력과 무기 밸런스를 갖춘 PvP 베타.": "Practice against AI or invite a friend to an online 1v1 arena. A PvP beta with special abilities and balanced weapons.",
 "솔로 AI, 2인·4인 한 기기 대전! 동시 명령으로 영토를 점령하는 전략 게임.": "Conquer territory with simultaneous commands. Play against AI or with 2–4 players on one device.",
 "재료를 손질하고 섞고 가열해 음식을 완성하는 자유 요리 시뮬레이터.": "Prepare, mix, and heat ingredients in a free-form cooking simulator.",
 "화면의 지시에 맞춰 버튼을 누르는 솔로·멀티플레이 게임.": "Follow on-screen instructions and press buttons in solo or multiplayer games.",
 "가상 코인 미니게임과 UID 지갑·거래 내역·배경/이름 장식 상점을 제공하는 프로젝트.": "Virtual-coin minigames with a UID wallet, transaction history, and background and name decorations.",
 "친구와 같은 퀴즈 문제를 풀고 점수를 겨루는 실시간 대결 게임.": "Answer the same quiz questions as your friends and compete for points in real time.",
 "폭탄을 넘기며 제한 시간 안에 살아남는 멀티 게임.": "Pass the bomb and survive before time runs out in this multiplayer game.",
 "Wheel 시스템을 이용해 다른 플레이어와 대결하는 게임.": "Compete with other players using the Wheel system.",
 "혼자 반응속도를 측정하거나 5라운드 실시간 대결에 참여하는 게임.": "Test your reaction time alone or compete in a five-round live match.",
 "플레이어 중 스파이를 찾아내는 추리형 파티 게임.": "Find the spy among the players in this deduction party game.",
 "직접 클릭하거나 자동 생산을 업그레이드해 점수를 모으는 게임.": "Earn points by clicking and upgrading automatic production.",
 "주사위와 다양한 효과를 이용해 대결하는 게임.": "Compete using dice and a variety of effects.",
 "한 기기에서 여러 구슬을 굴려 순위를 겨루는 오프라인 레이스.": "Race multiple marbles on one device in an offline competition.",
 "보드 위에서 왕관을 차지하기 위해 경쟁하는 전략 게임.": "Compete to claim the crown on the board.",
 "최대 6명이 매 라운드 운명을 선택하고, 이전 행동에 따라 룰렛이 바뀌는 대전 게임.": "Up to six players choose their fate each round, with a wheel that changes based on earlier actions.",
 "장애물을 피하며 시간을 모으고 점수·콤보·이벤트·공격으로 겨루는 생존 게임.": "Dodge obstacles, collect time, and compete with scores, combos, events, and attacks.",
 "음악을 만들고 재생하고 직접 연주하는 프로젝트. 음악 플레이와 배틀 모드도 지원.": "Create, play, and perform music. Music play and battle modes are also available.",
 "음계 카드 보드게임을 튜토리얼로 배우고 AI 솔로 또는 실시간 방에서 플레이.": "Learn this musical-scale card game through a tutorial, then play against AI or in a live room.",
 "친구와 방 코드로 만나 라운드마다 행동을 선택하고 위험도와 점수를 조절하는 게임.": "Join friends by room code, choose actions each round, and manage risk and points.",
 "공용 금고를 탐험해 열쇠와 보물을 모으고, 나만의 금고를 성장시키는 게임.": "Explore a shared vault, collect keys and treasure, and grow your own vault.",
 "친구들과 점수를 걸고 7라운드 동안 운과 배짱을 겨루는 온라인 게임.": "Wager points with friends in a seven-round online game of luck and nerve.",
 "열기 →": "Open →",
 "1인": "Solo",
 "다인": "Multiplayer",
 "1인 · 다인": "Solo & multiplayer",
 "접기 ▲": "Collapse ▲",
 "펴기 ▼": "Expand ▼",
 "개발 상태": "Development status",
 "(추정)": "(estimate)",
 "🚧 일부 기능 공사중": "🚧 Some features under maintenance",
 "📌 고정됨": "📌 Pinned",
 "지갑·카드 거래의 Firebase 저장 기능 점검 중": "Wallet and card transaction saving is under maintenance",
 "리더보드 점수 등록·Rapid 서버 지갑 점검 중": "Leaderboard submissions and Rapid server wallet are under maintenance",
 "온라인 방·매칭 권한 점검 중": "Online room and matchmaking permissions are under maintenance",
 "일부 온라인 대전 연결 권한 점검 중": "Some online match connection permissions are under maintenance",
 "· 다른 기능은 이용할 수 있어요.": "· Other features remain available."
});
const placeholders={"🔎 프로젝트 검색...":"🔎 Search projects...","친구 코드 6자리":"6-digit friend code"};
const dynamicOriginals=new WeakMap();
let pending=false,observer=null;
const changedRoots=new Set();
const observerOptions={subtree:true,childList:true,characterData:true};
function translateDynamic(lang,root=document.body){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node=root.nodeType===3?root:walker.nextNode();
 for(;node;node=walker.nextNode()){
  if(node.parentElement?.closest("script,style,textarea,code,pre,[contenteditable]"))continue;
  const current=node.textContent;
  const previous=dynamicOriginals.get(node);
  const source=previous&&previous.output===current?previous.source:current;
  const trimmed=source.trim();
  if(!trimmed)continue;
  const output=lang==="en"&&lex[trimmed]?source.replace(trimmed,lex[trimmed]):source;
  dynamicOriginals.set(node,{source,output});
  if(current!==output)node.textContent=output;
 }
}
function language(){let value;try{value=localStorage.getItem(KEY)}catch{}return supported.includes(value)?value:"ko"}
function translateRoot(root,lang){
 if(!root?.isConnected)return;
 const select=selector=>[...(root.nodeType===1&&root.matches(selector)?[root]:[]),...(root.querySelectorAll?.(selector)||[])];
 select("[data-fw-i18n]").forEach(el=>{
   const key=el.getAttribute("data-fw-i18n");const value=lang==="en"?(lex[key]||key):key;if(el.textContent!==value)el.textContent=value;
 });
 select("input[placeholder]").forEach(el=>{
  const original=el.dataset.fwOriginalPlaceholder||(el.dataset.fwOriginalPlaceholder=el.placeholder);
  el.placeholder=lang==="en"?(placeholders[original]||original):original;
 });
 translateDynamic(lang,root);
}
function withoutObservation(action){
 // Flush changes queued before disconnecting so unrelated updates are not lost.
 const records=observer?.takeRecords()||[];
 observer?.disconnect();
 for(const record of records)translateRoot(record.target,language());
 try{action()}finally{if(observer)observer.observe(document.body,observerOptions)}
}
function apply(lang){
 document.documentElement.lang=lang;
 withoutObservation(()=>translateRoot(document.body,lang));
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
 observer=new MutationObserver(records=>{
  for(const record of records)changedRoots.add(record.target);
  if(pending)return;
  pending=true;
  setTimeout(()=>{
   pending=false;
   const roots=[...changedRoots];changedRoots.clear();
   withoutObservation(()=>{
    const lang=language();
    for(const root of roots){
     if(!roots.some(other=>other!==root&&other.contains(root)))translateRoot(root,lang);
    }
   });
  },0);
 });
 observer.observe(document.body,observerOptions);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
window.addEventListener("storage",e=>{if(e.key===KEY)apply(language())});
})();

