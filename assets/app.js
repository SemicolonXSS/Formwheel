/*
=========================================================
FORMWHEEL PROJECT DATABASE
=========================================================

category:
  game = 게임
  tool = 도구
  app  = 앱

mode:
  solo
  multi
  both

connection:
  online
  offline

difficulty:
  easy
  normal
  hard

recent:
  true = 최근 추가 표시

IMPORTANT:
링크는 이 배열에서만 관리하면 됩니다.
프로젝트 주소가 바뀌면 여기만 수정하세요.
=========================================================
*/


const projects = [
  {name:"Sports",icon:"⚽",className:"green",category:"game",mode:"both",connection:"offline",difficulty:"쉬움",description:"축구·농구 2종목! CPU 대전과 한 기기 2인 대전, 슛·킥·점프가 가능한 스포츠 게임.",url:"https://semicolonxss.github.io/Formwheel/sports/",addedAt:"2026-10-24T06:45:00Z",recent:true},
  {name:"Board",icon:"♟️",className:"purple",category:"game",mode:"both",connection:"online",difficulty:"보통",description:"체스·바둑·오목·오델로 4종! 규칙을 읽고 로컬 2인 대전 또는 방 코드로 친구와 온라인 플레이.",url:"https://semicolonxss.github.io/Formwheel/board/",addedAt:"2026-10-24T05:30:00Z",recent:true},
  {name:"SYNC",icon:"🧠",className:"purple",category:"game",mode:"both",connection:"online",difficulty:"쉬움",description:"친구들과 텔레파시가 통할까? 같은 답을 고르는 6라운드 싱크 파티 게임! 한 기기 파티와 온라인 방 코드.",url:"https://semicolonxss.github.io/Formwheel_Sync/",addedAt:"2026-10-22T06:00:00Z",recent:true},
  {name:"Scribble",icon:"🎨",className:"purple",category:"game",mode:"multi",connection:"online",difficulty:"쉬움",description:"친구와 문장·그림을 번갈아 전달하는 낙서 릴레이! 2~8인 방 코드, 실시간 턴 진행과 앨범 공개.",url:"https://semicolonxss.github.io/Formwheel_Scribble/",addedAt:"2026-10-22T04:00:00Z",recent:true},
  {name:"Whiteboard",icon:"🖌️",className:"purple",category:"tool",mode:"multi",connection:"online",difficulty:"쉬움",description:"친구와 같은 캔버스에서 실시간으로 함께 그리는 협업 화이트보드! 방 코드와 초대 링크, 그림 저장 지원.",url:"https://semicolonxss.github.io/Formwheel_Whiteboard/",addedAt:"2026-10-22T06:00:00Z",recent:true},
  {name:"Paint",icon:"🎨",className:"purple",category:"tool",mode:"solo",connection:"offline",difficulty:"쉬움",description:"펜·도형·페인트통으로 자유롭게 그리는 그림판! PNG 저장, 이미지 불러오기, 자동 임시 저장 지원.",url:"https://semicolonxss.github.io/Formwheel_Paint/",addedAt:"2026-10-21T04:26:00Z",recent:true},
  {name:"Animation",icon:"🎬",className:"purple",category:"tool",mode:"solo",connection:"offline",difficulty:"보통",description:"프레임별 그림과 타임라인으로 애니메이션 제작! 어니언 스킨, GIF·WebM 내보내기 지원.",url:"https://semicolonxss.github.io/Formwheel_Animation/",addedAt:"2026-10-21T04:15:00Z",recent:true},

  {name:"Mix",icon:"🎲",className:"purple",category:"game",mode:"solo",connection:"offline",difficulty:"쉬움",description:"랜덤 게임 5개를 중복 없이 뽑아 연속 도전! 진행도 저장과 재추첨 지원.",url:"https://semicolonxss.github.io/Formwheel_Mix/",addedAt:"2026-10-21T00:30:00Z",recent:true},

  {
    name:"Glitch", icon:"⚡", className:"purple", category:"game", mode:"solo",
    connection:"offline", difficulty:"보통",
    description:"5~10초마다 글리치가 누적되는 120초 생존 게임! 장애물을 피하고 에너지 조각을 모아봐.",
    url:"https://semicolonxss.github.io/Formwheel_Glitch/",
    addedAt:"2026-10-21T00:00:00Z", recent:true
  },

  {
    name:"Maze", icon:"🌀", className:"purple", category:"game", mode:"both",
    connection:"offline", difficulty:"어려움",
    description:"방해 봇과 함정을 피해 탈출! 미로를 직접 조작하는 2인 로컬 배틀도 즐겨봐.",
    url:"https://semicolonxss.github.io/Formwheel_Maze/",
    addedAt:"2026-10-19T04:40:00Z", recent:true
  },



  /* =====================
     SERVICES / TOOLS
  ===================== */

  {
    name:"Form",
    icon:"📝",
    className:"blue",
    category:"tool",
    mode:"multi",
    connection:"online",
    difficulty:"쉬움",
    description:"질문을 추가해 설문을 만들고 링크로 공유하며 응답을 확인하는 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Form/",
    addedAt:"2026-09-07T10:49:23Z",
    recent:false
  },


  {
    name:"Wheel",
    icon:"🎡",
    className:"blue",
    category:"tool",
    mode:"multi",
    connection:"online",
    difficulty:"쉬움",
    description:"랜덤 추첨과 선택을 간편하게 진행하는 Wheel 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Wheel/?v=20261008-logo2",
    addedAt:"2026-09-06T07:44:57Z",
    recent:false
  },


  {
    name:"Quiz",
    icon:"🧠",
    className:"purple",
    category:"tool",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"퀴즈를 만들고 다른 사람들과 함께 풀어보는 서비스.",
    url:"https://semicolonxss.github.io/Formwheel_Quiz/",
    addedAt:"2026-09-08T05:27:28Z",
    recent:false
  },


  {
    name:"Decode",
    icon:"🔐",
    className:"gray",
    category:"tool",
    mode:"solo",
    connection:"offline",
    difficulty:"보통",
    description:"ROT13, Base64, HTML, 진법 등을 인코딩하고 디코딩하는 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Decode/",
    addedAt:"2026-10-02T01:52:01Z",
    recent:false
  },


  {
    name:"Edit",
    icon:"✏️",
    className:"blue",
    category:"tool",
    mode:"solo",
    connection:"offline",
    difficulty:"보통",
    description:"텍스트와 스티커를 배치하고 이동·삭제하며 콘텐츠를 편집하는 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Edit/",
    addedAt:"2026-09-24T08:11:08Z",
    recent:false
  },


  {
    name:"Tool",
    icon:"🛠️",
    className:"indigo",
    category:"tool",
    mode:"solo",
    connection:"offline",
    difficulty:"쉬움",
    description:"계산기·타이머와 성별 패턴·저장·CSV를 지원하는 자리 배치 등 생활 도구 모음.",
    url:"https://semicolonxss.github.io/Formwheel_Tool/?v=20261008-logo2",
    addedAt:"2026-09-30T00:12:47Z",
    recent:false
  },


  {
    name:"Vote",
    icon:"🗳️",
    className:"blue",
    category:"tool",
    mode:"multi",
    connection:"online",
    difficulty:"쉬움",
    description:"투표방을 만들고 친구들과 투표하며 실시간 결과를 확인하는 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Vote/",
    addedAt:"2026-09-14T01:20:55Z",
    recent:false
  },


  {
    name:"Check",
    thumbnail:"./assets/check-thumbnail.svg",
    icon:"✅",
    className:"green",
    category:"tool",
    mode:"solo",
    connection:"online",
    difficulty:"쉬움",
    description:"FormWheel 프로젝트의 개선 작업을 체크하고 진행률을 관리하는 도구.",
    url:"https://semicolonxss.github.io/Formwheel_Check/",
    addedAt:"2026-10-04T05:19:59Z",
    recent:false
  },


  {
    name:"Note",
    icon:"📔",
    className:"purple",
    category:"app",
    mode:"solo",
    connection:"offline",
    difficulty:"쉬움",
    description:"날짜와 기분을 기록하고 일기를 검색·백업할 수 있는 나만의 전자일기.",
    url:"https://semicolonxss.github.io/Formwheel_Note/",
    addedAt:"2026-10-18T07:30:00Z",
    recent:true
  },

  /* =====================
     APPS
  ===================== */

  {
    name:"Chat",
    icon:"💬",
    className:"cyan",
    category:"app",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"방을 만들고 친구들과 실시간으로 대화하는 채팅 앱.",
    url:"https://semicolonxss.github.io/Formwheel_Chat/",
    addedAt:"2026-09-28T01:14:36Z",
    recent:false
  },


  {
    name:"AI",
    icon:"🤖",
    className:"indigo",
    category:"app",
    mode:"solo",
    connection:"online",
    difficulty:"어려움",
    description:"기억을 사용하고 대화를 통해 발전하도록 만든 FormWheel AI 실험.",
    url:"https://semicolonxss.github.io/Formwheel_AI/",
    addedAt:"2026-10-02T02:27:02Z",
    recent:false
  },


  {
    name:"Wiki",
    icon:"📚",
    className:"blue",
    category:"tool",
    mode:"both",
    connection:"online",
    difficulty:"보통",
    description:"Formwheel의 문서를 읽고 편집 요청을 제출하는 공식 위키.",
    url:"https://semicolonxss.github.io/Formwheel_Wiki/",
    addedAt:"2026-10-17T00:00:00Z",
    recent:true
  },

  {
    name:"AQS",
    icon:"🏆",
    className:"purple",
    category:"app",
    mode:"solo",
    connection:"online",
    difficulty:"보통",
    description:"Achievement · Quest · Secret을 통합한 도전과 발견의 공간.",
    url:"https://semicolonxss.github.io/Formwheel_AQS/",
    addedAt:"2026-10-17T00:00:00Z",
    recent:true
  },

  {
    name:"Spotlight",
    icon:"🌟",
    className:"purple",
    category:"app",
    mode:"solo",
    connection:"online",
    difficulty:"쉬움",
    description:"매일 새로운 주인공과 미션을 만나보는 오늘의 Spotlight.",
    url:"https://semicolonxss.github.io/Formwheel_Spotlight/",
    addedAt:"2026-10-17T00:00:00Z",
    recent:true
  },

  {
    name:"Story",
    icon:"📖",
    className:"indigo",
    category:"game",
    mode:"solo",
    connection:"offline",
    difficulty:"보통",
    description:"Formwheel 세계관을 따라가며 펼쳐지는 이야기 프로젝트.",
    url:"https://semicolonxss.github.io/Formwheel_Story/",
    addedAt:"2026-10-17T00:00:00Z",
    recent:true
  },

  /* =====================
     GAMES
  ===================== */

  {
    name:"PVP",
    icon:"⚔️",
    className:"purple",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"보통",
    description:"솔로 AI 연습과 친구 초대 온라인 1대1 아레나. 특수 능력과 무기 밸런스를 갖춘 PvP 베타.",
    url:"https://semicolonxss.github.io/Formwheel_PVP/",
    addedAt:"2026-10-17T11:30:00Z",
    recent:true
  },



  {
    name:"Territory",
    icon:"🗺️",
    className:"blue",
    category:"game",
    mode:"both",
    connection:"offline",
    difficulty:"보통",
    description:"솔로 AI, 2인·4인 한 기기 대전! 동시 명령으로 영토를 점령하는 전략 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Territory/",
    addedAt:"2026-10-11T04:20:00Z",
    recent:true
  },



  {
    name:"Cook",
    icon:"🍳",
    className:"orange",
    category:"game",
    mode:"solo",
    connection:"offline",
    difficulty:"보통",
    description:"재료를 손질하고 섞고 가열해 음식을 완성하는 자유 요리 시뮬레이터.",
    url:"https://semicolonxss.github.io/Formwheel_Cook/",
    addedAt:"2026-10-07T02:19:49Z",
    recent:false
  },


  {
    name:"Button",
    icon:"🔘",
    className:"purple",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"보통",
    description:"다양한 지시와 타이밍에 맞춰 버튼을 누르는 솔로·멀티 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Button/",
    addedAt:"2026-10-01T02:14:02Z",
    recent:false
  },


  {
    name:"Casino",
    icon:"🎰",
    className:"orange",
    category:"game",
    mode:"solo",
    connection:"online",
    difficulty:"보통",
    description:"가상 코인 미니게임과 UID 지갑·거래 내역·배경/이름 장식 상점을 제공하는 프로젝트.",
    url:"https://semicolonxss.github.io/Formwheel_Casino/",
    addedAt:"2026-09-11T03:44:13Z",
    recent:false
  },


  {
    name:"Battle",
    icon:"⚔️",
    className:"orange",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"친구와 실시간으로 퀴즈를 풀며 대결하는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Battle/",
    addedAt:"2026-09-08T11:38:29Z",
    recent:false
  },


  {
    name:"Bomb",
    icon:"💣",
    className:"red",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"폭탄을 넘기며 제한 시간 안에 살아남는 멀티 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Bomb/",
    addedAt:"2026-09-10T00:28:18Z",
    recent:false
  },


  {
    name:"Wheel Battle",
    icon:"⚔️",
    className:"orange",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"Wheel 시스템을 이용해 다른 플레이어와 대결하는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_WheelB/",
    addedAt:"2026-09-10T00:41:31Z",
    recent:false
  },


  {
    name:"Reflex",
    icon:"⚡",
    className:"blue",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"쉬움",
    description:"솔로 기록과 5라운드 실시간 배틀로 반응속도를 겨루는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Reflex/",
    addedAt:"2026-09-10T11:26:35Z",
    recent:false
  },


  {
    name:"Spy",
    icon:"🕵️",
    className:"purple",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"플레이어 중 스파이를 찾아내는 추리형 파티 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Spy/",
    addedAt:"2026-09-10T11:18:07Z",
    recent:false
  },


  {
    name:"Clicker",
    icon:"🖱️",
    className:"cyan",
    category:"game",
    mode:"solo",
    connection:"offline",
    difficulty:"쉬움",
    description:"클릭과 자동 생산 업그레이드로 점수를 모으고 성장하는 방치형 클릭 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Clicker/",
    addedAt:"2026-09-15T12:00:53Z",
    recent:false
  },


  {
    name:"Dice Duel",
    icon:"🎲",
    className:"blue",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"주사위와 다양한 효과를 이용해 대결하는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_DiceDuel/",
    addedAt:"2026-09-13T05:53:08Z",
    recent:false
  },


  {
    name:"Marble",
    icon:"🎱",
    className:"purple",
    category:"game",
    mode:"multi",
    connection:"offline",
    difficulty:"보통",
    description:"한 기기에서 여러 구슬을 굴려 순위를 겨루는 오프라인 레이스.",
    url:"https://semicolonxss.github.io/Formwheel_Marble/",
    addedAt:"2026-09-14T02:03:31Z",
    recent:false
  },


  {
    name:"GCrown",
    icon:"👑",
    className:"orange",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"어려움",
    description:"보드 위에서 왕관을 차지하기 위해 경쟁하는 전략 게임.",
    url:"https://semicolonxss.github.io/Formwheel_GCrown/",
    addedAt:"2026-09-22T02:36:07Z",
    recent:false
  },


  {
    name:"Fate",
    icon:"🎡",
    className:"purple",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"최대 6명이 매 라운드 운명을 선택하고, 이전 행동에 따라 룰렛이 바뀌는 대전 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Fate/",
    addedAt:"2026-09-17T00:37:08Z",
    recent:false
  },


  {
    name:"Time",
    icon:"⏱️",
    className:"red",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"보통",
    description:"장애물을 피하며 시간을 모으고 점수·콤보·이벤트·공격으로 겨루는 생존 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Time/?v=20261008-logo2",
    addedAt:"2026-09-22T01:28:52Z",
    recent:false
  },


  {
    name:"Music",
    icon:"🎵",
    className:"pink",
    category:"game",
    mode:"solo",
    connection:"online",
    difficulty:"어려움",
    description:"음악을 만들고 재생하고 직접 연주하는 프로젝트. 음악 플레이와 배틀 모드도 지원.",
    url:"https://semicolonxss.github.io/Formwheel_Music/",
    addedAt:"2026-09-26T09:38:35Z",
    recent:false
  },


  {
    name:"Piano",
    icon:"🎹",
    className:"pink",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"보통",
    description:"음계 카드 보드게임을 튜토리얼로 배우고 AI 솔로 또는 실시간 방에서 플레이.",
    url:"https://semicolonxss.github.io/Formwheel_Piano/",
    addedAt:"2026-09-21T01:16:37Z",
    recent:false
  },


  {
    name:"Balance",
    icon:"⚖️",
    className:"green",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"어려움",
    description:"친구와 방 코드로 만나 라운드마다 행동을 선택하고 위험도와 점수를 조절하는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Balance/",
    addedAt:"2026-09-20T08:29:49Z",
    recent:false
  },


  {
    name:"Vault",
    icon:"🔒",
    className:"gray",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"공용 금고를 탐험해 열쇠와 보물을 모으고, 나만의 금고를 성장시키는 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Vault/",
    addedAt:"2026-09-21T05:21:53Z",
    recent:false
  },


  {
    name:"Risk",
    icon:"🎲",
    className:"green",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"어려움",
    description:"친구들과 점수를 걸고 7라운드 동안 운과 배짱을 겨루는 온라인 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Risk/",
    addedAt:"2026-09-10T04:38:03Z",
    recent:false
  }

];


window.FormwheelHubProjects = projects;
/* Editorial development maturity estimates (2026-10-24).
   Weighted judgment: core feature coverage 40%, reliability 30%, UX 20%,
   multiplayer/essential flows 10%. Not automated tests or release guarantees.
   Adjust conservatively where user-reported regressions remain unresolved. */
const projectMaturity = {
  Sports:62,
  Board:70,
  SYNC:70,
  Scribble:58,
  Whiteboard:64,
  Paint:84,
  Animation:73,
  Mix:80,
  Glitch:69,
  Maze:82,
  Form:88,
  Wheel:93,
  Quiz:88,
  Decode:95,
  Edit:76,
  Tool:86,
  Vote:83,
  Check:87,
  Note:82,
  Chat:73,
  AI:60,
  Wiki:68,
  AQS:78,
  Spotlight:78,
  Story:66,
  PVP:62,
  Territory:65,
  Cook:86,
  Button:82,
  Casino:81,
  Battle:85,
  Bomb:87,
  "Wheel Battle":79,
  Reflex:90,
  Spy:69,
  Clicker:81,
  "Dice Duel":68,
  Marble:66,
  GCrown:79,
  Fate:81,
  Time:87,
  Music:65,
  Piano:76,
  Balance:62,
  Vault:80,
  Risk:82
};

/* ======================================================
   ELEMENTS
====================================================== */

const cardsElement =
  document.getElementById("cards");

const searchElement =
  document.getElementById("search");

const countElement =
  document.getElementById("count");

const emptyElement =
  document.getElementById("empty");

const sortElement =
  document.getElementById("sort");
const sortDirectionButton = document.getElementById("sortDirection");
let sortAscending = false;
function updateSortDirectionButton(){
  if (!sortDirectionButton) return;
  sortDirectionButton.textContent = sortAscending ? "↑" : "↓";
  sortDirectionButton.title = sortAscending ? "오름차순 · 클릭하면 내림차순" : "내림차순 · 클릭하면 오름차순";
  sortDirectionButton.setAttribute("aria-label", sortDirectionButton.title);
  sortDirectionButton.setAttribute("aria-pressed", String(sortAscending));
}
sortDirectionButton?.addEventListener("click",()=>{sortAscending=!sortAscending;updateSortDirectionButton();render();});
updateSortDirectionButton();

const filterButtons =
  [...document.querySelectorAll(".categoryButtons .filterButton[data-filter]")];


/* ======================================================
   STATE
====================================================== */

let currentFilter = "all";
const favoriteStorageKey = "formwheel-hub-pinned-games-v1";
let pinnedGames = [];
try {
  const stored = JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]");
  if (Array.isArray(stored)) pinnedGames = stored.filter(name => typeof name === "string");
} catch (_) { /* Storage may be unavailable */ }
const favoriteToggle = document.getElementById("fw-favorites-toggle");
const favoritePanel = document.getElementById("fw-favorites-panel");
const favoriteOptions = document.getElementById("fw-favorites-options");
const favoriteCount = document.getElementById("fw-favorites-count");
function savePinnedGames(){
  try { localStorage.setItem(favoriteStorageKey, JSON.stringify(pinnedGames)); } catch (_) {}
  updateFavoriteControls();
  render();
}
function updateFavoriteControls(){
  favoriteCount.textContent = pinnedGames.length ? "(" + pinnedGames.length + ")" : "";
  favoriteOptions.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.checked = pinnedGames.includes(input.value);
  });
}
if (favoriteToggle && favoritePanel && favoriteOptions) {
  favoriteOptions.innerHTML = projects.filter(p => p.category === "game")
    .sort((a,b) => a.name.localeCompare(b.name,"ko"))
    .map(p => '<label><input type="checkbox" value="' + escapeHTML(p.name) + '"><span>' + escapeHTML(p.icon || "🎮") + ' ' + escapeHTML(p.name) + '</span></label>').join("");
  favoriteOptions.addEventListener("change", e => {
    if (!e.target.matches('input[type="checkbox"]')) return;
    const name = e.target.value;
    pinnedGames = pinnedGames.filter(item => item !== name);
    if (e.target.checked) pinnedGames.push(name);
    savePinnedGames();
  });
  favoriteToggle.addEventListener("click", () => {
    favoritePanel.hidden = !favoritePanel.hidden;
    favoriteToggle.setAttribute("aria-expanded", String(!favoritePanel.hidden));
  });
  document.getElementById("fw-favorites-clear")?.addEventListener("click", () => {
    pinnedGames = [];
    savePinnedGames();
  });
  updateFavoriteControls();
}
const modeFilter = document.getElementById("modeFilter");
const connectionFilter = document.getElementById("connectionFilter");
const difficultyFilter = document.getElementById("difficultyFilter");
const resetFilters = document.getElementById("resetFilters");


/* ======================================================
   LABELS
====================================================== */

const categoryLabel = {

  game:"게임",

  tool:"도구",

  app:"앱"

};


const modeLabel = {

  solo:"1인",

  multi:"다인",

  both:"1인 · 다인"

};


const connectionLabel = {

  online:"온라인",

  offline:"오프라인"

};


/* ======================================================
   RENDER
====================================================== */

function generatedThumbnail(project){
  const colors = {
    AQS:["#241b58","#8065f6"], Spotlight:["#3d237b","#e49b39"],
    Story:["#172c64","#6178db"], Wiki:["#16476a","#38b6a5"]
  };
  const palette = {
    blue:["#123c72","#3687d5"], purple:["#382067","#9764da"],
    indigo:["#202956","#6679d9"], orange:["#753313","#e99b3d"],
    cyan:["#104e63","#42b8cf"], green:["#155443","#4bb88f"],
    red:["#741e35","#df5975"], gray:["#313a50","#8795aa"]
  };
  // Consistent thumbnail backgrounds by project category.
  // Keep individual icons, names and decorative shapes unchanged.
  const categoryColors = {
    game:["#234B9B","#518BE8"],  // 게임: blue
    tool:["#176858","#45AF9B"],  // 도구: teal
    app:["#6A3A98","#A177D4"]    // 앱: violet
  };
  const [start,end] = categoryColors[project.category] || colors[project.name] || palette[project.className] || ["#263158","#717db0"];
  const name = escapeHTML(project.name);
  const icon = escapeHTML(project.icon || "✦");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs>
    <rect width="1200" height="630" rx="38" fill="url(#g)"/>
    <circle cx="1050" cy="100" r="250" fill="#ffffff" opacity=".07"/>
    <circle cx="120" cy="600" r="290" fill="#ffffff" opacity=".06"/>
    <text x="72" y="108" fill="#ffffff" opacity=".8" font-size="34" font-family="Arial,sans-serif" font-weight="bold">FORMWHEEL PROJECT</text>
    <text x="600" y="315" font-size="142" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${icon}</text>
    <text x="600" y="475" fill="#ffffff" font-size="100" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold">${name}</text>
    <rect x="72" y="554" width="1056" height="3" rx="2" fill="#ffffff" opacity=".4"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function thumbnailURL(project){
  // Unified Hub card design. Original thumbnail files remain untouched in their repositories.
  return generatedThumbnail(project);
}

function isRecent(project,now=Date.now()){const age=now-Date.parse(project.addedAt);return Number.isFinite(age)&&age>=0&&age<=14*86400000;}
const hubViewStorageKey = "formwheel-hub-view-v1";
function saveHubView(){
  try { localStorage.setItem(hubViewStorageKey, JSON.stringify({
    category: currentFilter, search: searchElement.value, mode: modeFilter.value,
    connection: connectionFilter.value, difficulty: difficultyFilter.value,
    sort: sortElement.value, ascending: sortAscending
  })); } catch (_) {}
}
function restoreHubView(){
  try {
    const state = JSON.parse(localStorage.getItem(hubViewStorageKey) || "null");
    if (!state || typeof state !== "object" || Array.isArray(state)) return;
    for (const [el, value] of [[modeFilter,state.mode],[connectionFilter,state.connection],[difficultyFilter,state.difficulty],[sortElement,state.sort]]) {
      if (typeof value === "string" && [...el.options].some(option => option.value === value)) el.value = value;
    }
    if (typeof state.search === "string") searchElement.value = state.search.slice(0,200);
    if (typeof state.ascending === "boolean") sortAscending = state.ascending;
    if (filterButtons.some(b => b.dataset.filter === state.category)) currentFilter = state.category;
    filterButtons.forEach(b => { const active = b.dataset.filter === currentFilter; b.classList.toggle("active", active); b.setAttribute("aria-pressed",String(active)); });
    updateSortDirectionButton();
  } catch (_) {}
}
function render(){
  saveHubView();
  const appliedCount = [modeFilter, connectionFilter, difficultyFilter]
    .filter(select => select.value !== "all").length;
  const filterCount = document.getElementById("fw-filter-count");
  if (filterCount) filterCount.textContent = appliedCount ? appliedCount + "개 적용" : "";



  let list =
    [...projects];


  /* SEARCH */

  const keyword =
    searchElement.value
      .trim()
      .toLowerCase();


  if(keyword){

    list =
      list.filter(project => {

        const text =
          (
            project.name +
            " " +
            project.description +
            " " +
            categoryLabel[project.category] + " " + modeLabel[project.mode] + " " + connectionLabel[project.connection] + " " + project.difficulty
          ).toLowerCase();

        return text.includes(keyword);

      });

  }


  /* FILTER */

  if(currentFilter !== "all"){

    if(currentFilter === "recent"){

      list =
        list.filter(project => isRecent(project));

    }

    else{

      list =
        list.filter(project =>
          project.category === currentFilter
        );

    }

  }


  list = list.filter(project =>
    (modeFilter.value === "all" || project.mode === modeFilter.value || (project.mode === "both" && modeFilter.value !== "both")) &&
    (connectionFilter.value === "all" || project.connection === connectionFilter.value) &&
    (difficultyFilter.value === "all" || project.difficulty === difficultyFilter.value)
  );

  /* SORT: creator-managed list with fallback for new projects. */
  if (sortElement.value === 'creator') {
    const order = window.FormwheelCreatorSort?.order || [];
    list.sort((a,b) => {
      const ai=order.indexOf(a.name), bi=order.indexOf(b.name);
      return (ai<0?Number.MAX_SAFE_INTEGER:ai)-(bi<0?Number.MAX_SAFE_INTEGER:bi);
    });
  }

  /* SORT: personalized popularity based on recorded Hub openings. */

  if(sortElement.value === "popular"){
    const visits = window.FormwheelHubHome?.read?.().visits || {};
    const count = project => Math.max(0, Number(visits[project.name.toLowerCase()]?.count) || 0);
    list.sort((a,b) => count(b)-count(a) || Date.parse(b.addedAt||0)-Date.parse(a.addedAt||0) || a.name.localeCompare(b.name,"ko"));
  }

  if(sortElement.value === "name"){

    list.sort((a,b) =>
      a.name.localeCompare(
        b.name,
        "ko"
      )
    );

  }


  if(sortElement.value === "recent"){

    list.sort((a,b) =>
      Date.parse(b.addedAt||0) -
      Date.parse(a.addedAt||0)
    );

  }


  if(sortElement.value === "maturity"){
    list.sort((a,b) => (projectMaturity[b.name] ?? 60) - (projectMaturity[a.name] ?? 60) || a.name.localeCompare(b.name,"ko"));
  }
  // Reverse the active order while keeping pinned cards at the top.
  if(sortAscending) list.reverse();

  /* Keep pinned games above other visible cards, regardless of sort. */
  list.sort((a,b) => {
    const ai = pinnedGames.indexOf(a.name);
    const bi = pinnedGames.indexOf(b.name);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  /* COUNT */

  countElement.textContent =
    list.length;


  /* EMPTY */

  emptyElement.classList.toggle(
    "show",
    list.length === 0
  );


  /* HTML */

  cardsElement.innerHTML =
    list.map(project => {

      const difficultyStars =
        project.difficulty === "쉬움"
          ? "⭐"
          : project.difficulty === "보통"
            ? "⭐⭐"
            : "⭐⭐⭐";


      const newBadge =
        isRecent(project)
          ? `<span class="newBadge">NEW</span>`
          : "";


      return `

        <article
          class="card ${project.className} ${pinnedGames.includes(project.name) ? "fw-pinned" : ""}"
        >

          ${newBadge}
          ${pinnedGames.includes(project.name) ? '<span class="fw-pin-mark">📌 고정됨</span>' : ""}

          <div class="fw-card-thumbnail">
            <img src="${thumbnailURL(project)}" alt="" loading="lazy" decoding="async" width="1200" height="630">
            <div class="fw-thumbnail-description">${escapeHTML(project.description)}</div>
          </div>
          <div class="cardTop">

            <div class="icon">
              ${project.icon}
            </div>


            <div class="cardTitle">

              <h3>
                ${escapeHTML(project.name)}
              </h3>

              <div class="cardCategory">
                ${categoryLabel[project.category]}
              </div>

            </div>

          </div>





          <div class="info">

            <span class="tag">
              ${modeLabel[project.mode]}
            </span>

            <span
              class="tag ${project.connection}"
            >
              ${connectionLabel[project.connection]}
            </span>

            <span class="tag difficulty">
              ${difficultyStars}
              ${project.difficulty}
            </span>

          </div>


          <div class="fw-maturity" title="제작자가 추정한 개발 완성도 · 자동 측정값이 아닙니다">
            <div class="fw-maturity-caption"><span>개발 완성도 <small>(추정)</small></span><strong>${projectMaturity[project.name] ?? 60}%</strong></div>
            <div class="fw-maturity-track" role="progressbar" aria-label="${escapeHTML(project.name)} 개발 완성도 추정" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${projectMaturity[project.name] ?? 60}"><div class="fw-maturity-fill" style="width:${projectMaturity[project.name] ?? 60}%"></div></div>
          </div>
          <div class="cardBottom">

            <a
              class="openButton"
              href="${project.url}"
              data-fw-project="${escapeHTML(project.name)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              열기 →
            </a>

          </div>

        </article>

      `;

    }).join("");

}


/* ======================================================
   ESCAPE
====================================================== */

function escapeHTML(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* ======================================================
   SEARCH
====================================================== */

searchElement.addEventListener(
  "input",
  render
);


/* ======================================================
   FILTER
====================================================== */

filterButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      filterButtons.forEach(
        item =>
          item.classList.remove("active")
      );


      button.classList.add("active");
      filterButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));


      currentFilter =
        button.dataset.filter;


      render();

    }
  );

});


/* ======================================================
   SORT
====================================================== */

sortElement.addEventListener(
  "change",
  render
);


/* ======================================================
   START
====================================================== */

[modeFilter, connectionFilter, difficultyFilter].forEach(select => select.addEventListener("change", render));
filterButtons.forEach(button => button.setAttribute("aria-pressed", String(button.classList.contains("active"))));
resetFilters.addEventListener("click", () => {
  searchElement.value = "";
  currentFilter = "all";
  [modeFilter, connectionFilter, difficultyFilter].forEach(select => select.value = "all");
  sortElement.value = "creator";
  sortAscending = false;
  updateSortDirectionButton();
  filterButtons.forEach(button => {
    const active = button.dataset.filter === "all";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  render();
});
cardsElement.addEventListener("error", event => {
  const img = event.target;
  if (img.tagName !== "IMG") return;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  const name = img.closest(".card")?.querySelector("h3")?.textContent?.trim() || "Project";
  const project = projects.find(item => item.name === name) || { name, icon:"✦" };
  img.src = generatedThumbnail(project);
}, true);
window.addEventListener('formwheel-creator-sort-updated', render);
window.FormwheelHubProjects=projects;
window.FormwheelHubResetFilters=()=>resetFilters.click();
restoreHubView();

render();

// The compact Hub does not load home.js; filter controls belong to the catalogue.
(() => {
  const toggle = document.getElementById("fw-filter-toggle");
  const panel = document.getElementById("fw-filter-panel");
  if (!toggle || !panel) return;
  const mobile = window.matchMedia("(max-width:700px)");
  const storageKey = "formwheel-hub-detail-filter-expanded-v1";
  function savedPreference(){
    try {
      const value = localStorage.getItem(storageKey);
      return value === null ? null : value === "true";
    } catch (_) { return null; }
  }
  function setExpanded(expanded, persist = false){
    panel.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    if (persist) {
      try { localStorage.setItem(storageKey, String(expanded)); } catch (_) {}
    }
  }
  // On the first visit keep filters visible on desktop and compact on mobile.
  // A user's explicit choice survives reloads and viewport changes.
  const sync = () => setExpanded(savedPreference() ?? !mobile.matches);
  toggle.addEventListener("click", () => setExpanded(panel.hidden, true));
  mobile.addEventListener?.("change", sync);
  window.addEventListener("storage", event => {
    if (event.key === storageKey) sync();
  });
  sync();
})();
