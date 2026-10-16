/* Formwheel Project Spotlight: one featured project per Korea-local day. */
(function () {
  "use strict";
  const root = document.getElementById("fw-spotlight");
  if (!root) return;
  const curated = [
    {name:"Reflex", challenge:"반응속도 300ms 이내에 도전해 보세요!", tag:"순발력 챌린지"},
    {name:"Cook", challenge:"랜덤 챌린지에서 90점 이상을 노려보세요!", tag:"요리 챌린지"},
    {name:"Decode", challenge:"암호 하나를 직접 해독해 보세요!", tag:"두뇌 챌린지"},
    {name:"Clicker", challenge:"나만의 최고 기록을 세워 보세요!", tag:"기록 챌린지"},
    {name:"Time", challenge:"시간을 지키며 오래 살아남아 보세요!", tag:"시간 챌린지"},
    {name:"Marble", challenge:"새로운 맵을 탐험해 보세요!", tag:"탐험 챌린지"},
    {name:"GCrown", challenge:"왕관을 지키는 전략을 시험해 보세요!", tag:"전략 챌린지"}
  ];
  const today = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Seoul", year:"numeric", month:"2-digit", day:"2-digit"}).format(new Date());
  const dayNumber = Math.floor(Date.parse(today + "T00:00:00Z") / 86400000);
  const pick = curated[((dayNumber % curated.length) + curated.length) % curated.length];
  const source = typeof projects !== "undefined" && Array.isArray(projects) ? projects : [];
  const project = source.find(p => p.name === pick.name && /^https:\/\//.test(p.url || ""));
  if (!project) { root.hidden = true; return; }
  const title = root.querySelector("[data-spotlight-title]");
  const description = root.querySelector("[data-spotlight-description]");
  const challenge = root.querySelector("[data-spotlight-challenge]");
  const link = root.querySelector("[data-spotlight-link]");
  const date = root.querySelector("[data-spotlight-date]");
  title.textContent = (project.icon || "✨") + " " + project.name;
  description.textContent = project.description || "오늘의 프로젝트를 발견해 보세요.";
  challenge.textContent = pick.tag + " · " + pick.challenge;
  link.href = project.url;
  link.setAttribute("aria-label", project.name + " 프로젝트로 이동");
  date.textContent = today + " · 매일 자정(KST) 변경";
  root.hidden = false;
})();
