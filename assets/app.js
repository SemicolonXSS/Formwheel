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
    url:"https://semicolonxss.github.io/Formwheel_Wheel/",
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
    description:"계산기, 타이머, 단위 변환 등 실생활에 필요한 도구 모음.",
    url:"https://semicolonxss.github.io/Formwheel_Tool/",
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


  /* =====================
     GAMES
  ===================== */

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
    description:"코인으로 룰렛과 슬롯 등 다양한 미니게임을 즐기는 프로젝트.",
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
    description:"제한 시간 안에서 빠르게 행동하는 타임 게임.",
    url:"https://semicolonxss.github.io/Formwheel_Time/",
    addedAt:"2026-09-22T01:28:52Z",
    recent:false
  },


  {
    name:"Music",
    icon:"🎵",
    className:"pink",
    category:"game",
    mode:"both",
    connection:"online",
    difficulty:"어려움",
    description:"음악을 만들고 재생하고 직접 플레이하는 음악 프로젝트.",
    url:"https://semicolonxss.github.io/Formwheel_Music/",
    addedAt:"2026-09-26T09:38:35Z",
    recent:false
  },


  {
    name:"Piano",
    icon:"🎹",
    className:"pink",
    category:"game",
    mode:"multi",
    connection:"online",
    difficulty:"보통",
    description:"음계 카드를 활용해 플레이하는 FormWheel 보드게임.",
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

  multi:"멀티",

  both:"1인 · 멀티"

};


const connectionLabel = {

  online:"온라인",

  offline:"오프라인"

};


/* ======================================================
   RENDER
====================================================== */

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
            categoryLabel[project.category]
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


  /* SORT */

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
          class="card ${project.className}"
        >

          ${newBadge}


          <img src="${project.url}assets/thumbnail.svg" alt="" loading="lazy" width="1200" height="630" style="display:block;width:100%;height:auto;border-radius:12px;margin-bottom:14px">
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

render();
