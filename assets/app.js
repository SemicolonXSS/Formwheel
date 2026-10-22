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
  {name:"Paint",icon:"🎨",className:"purple",category:"tool",mode:"solo",connection:"offline",difficulty:"쉬움",description:"펜·도형·페인트통으로 자유롭게 그리는 그림판! PNG 저장, 이미지 불러오기, 자동 임시 저장 지원.",url:"https://semicolonxss.github.io/Formwheel_Paint/",addedAt:"2026-10-21T04:26:00Z",recent:true},
  {name:"Animation",icon:"🎬",className:"purple",category:"tool",mode:"solo",connection:"offline",difficulty:"보통",description:"프레임별 그림과 타임라인으로 애니메이션 제작! 어니언 스킨, GIF·WebM 내보내기 지원.",url:"https://semicolonxss.github.io/Formwheel_Animation/",addedAt:"2026-10-21T04:15:00Z",recent:true},

  {name:"Mix",icon:"🎲",className:"purple",category:"game",mode:"solo",connection:"offline",difficulty:"쉬움",description:"랜덤 게임 5개를 중복 없이 뽑아 연속 도전! 진행도 저장과 재추첨 지원.",url:"https://semicolonxss.github.io/Formwheel/mix/",addedAt:"2026-10-21T00:30:00Z",recent:true},

  {
    name:"Glitch", icon:"⚡", className:"purple", category:"game", mode:"solo",
    connection:"offline", difficulty:"보통",
    description:"30초마다 규칙이 바뀌는 120초 생존 게임! 장애물을 피하고 에너지 조각을 모아봐.",
    url:"https://semicolonxss.github.io/Formwheel/glitch/",
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
    description:"설문을 만들고 응답을 받을 수 있는 FormWheel 설문 도구.",
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
    description:"콘텐츠를 만들고 편집하기 위한 FormWheel 편집 도구.",
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
    url:"https://semicolonxss.github.io/Formwheel/pvp/",
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
    url:"https://semicolonxss.github.io/Formwheel/button/",
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
    description:"클릭을 통해 점수와 업그레이드를 쌓는 클릭 게임.",
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
    description:"랜덤한 선택과 결과를 이용해 플레이하는 운 게임.",
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
    description:"한 손·두 손·포 핸드 악보를 만들고 드럼·피아노로 재생하며 리듬을 연주하는 음악 도구.",
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
    description:"공격, 방어, 점수 등 선택을 이용해 균형을 겨루는 게임.",
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
    description:"금고와 잠금 장치를 이용하는 퍼즐형 실험 게임.",
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
    description:"선택과 위험 요소를 이용해 경쟁하는 전략 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Risk/",
    addedAt:"2026-09-10T04:38:03Z",
    recent:false
  }

];


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

const filterButtons =
  [...document.querySelectorAll(".filterButton")];


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
function render(){

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

          <img src="${thumbnailURL(project)}" alt="" loading="lazy" width="1200" height="630" style="display:block;width:100%;height:auto;border-radius:12px;margin-bottom:14px">
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


          <div class="description">
            ${escapeHTML(project.description)}
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


          <div class="cardBottom">

            <a
              class="openButton"
              href="${project.url}"
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
  sortElement.value = "popular";
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
render();
