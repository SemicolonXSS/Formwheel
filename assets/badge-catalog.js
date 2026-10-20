// Central badge catalog: new challenge badges are not auto-awarded without verified game results.
export const BADGE_GROUPS={"시작":[["welcome","🎉","첫 방문"],["profile","🪪","프로필 완성"],["explore1","🧭","탐험 시작"],["explore5","🗺️","5개 프로젝트 탐험"],["explore10","🌍","10개 프로젝트 탐험"],["explore20","🚀","20개 프로젝트 탐험"],["visit10","👣","10회 방문"],["visit50","🥾","50회 방문"],["visit100","🌠","100회 방문"],["visit500","🌌","500회 방문"]],"프로젝트":[["project0","🎡","Wheel 방문"],["project1","❓","Quiz 방문"],["project2","⚔️","Battle 방문"],["project3","💣","Bomb 방문"],["project4","🎯","Risk 방문"],["project5","🕵️","Spy 방문"],["project6","⚡","Reflex 방문"],["project7","🎰","Casino 방문"],["project8","🎵","Music 방문"],["project9","🎹","Piano 방문"],["project10","🎲","Dice Duel 방문"],["project11","⏳","Time 방문"],["project12","👑","GCrown 방문"],["project13","🔮","Marble 방문"],["project14","🔐","Vault 방문"],["project15","🤖","AI 방문"],["project16","🔘","Button 방문"],["project17","👆","Clicker 방문"],["project18","🔎","Decode 방문"],["project19","✅","Check 방문"],["project20","📝","Form 방문"],["project21","🎬","Edit 방문"],["project22","⚖️","Balance 방문"],["project23","🔮","Fate 방문"],["project24","🍳","Cook 방문"],["project25","🛠️","Tool 방문"]],"기념일":[["base","🏅","40→50 Anniversary"],["day40","👑","DAY 40 · Original"],["master","🏆","40→50 Master"],["share","📣","40→50 SHARE"],["day50","✨","DAY 50 · Finale"]],"도전":[["challenge0","🏆","첫 승리"],["challenge1","🔥","5연승"],["challenge2","💎","10연승"],["challenge3","🧠","퀴즈 마스터"],["challenge4","🔍","스파이 탐정"],["challenge5","🛡️","스파이 생존자"],["challenge6","👑","왕관 수호자"],["challenge7","🎲","주사위 지배자"],["challenge8","⌛","시간의 지배자"],["challenge9","⚡","반사신경 달인"],["challenge10","🏁","구슬 레이서"],["challenge11","🍳","요리 전문가"],["challenge12","👆","클릭 장인"],["challenge13","🎼","음악 제작자"],["challenge14","🎹","피아노 연주자"],["challenge15","🍀","룰렛 행운아"],["challenge16","💣","폭탄 해결사"],["challenge17","🤝","친구 1명"],["challenge18","🫂","친구 5명"],["challenge19","🌟","친구 20명"],["challenge20","💌","초대장 전달"],["challenge21","🎮","첫 멀티플레이"],["challenge22","🥇","100판 플레이"],["challenge23","🏅","1000판 플레이"],["challenge24","🌈","주말 플레이어"],["challenge25","🌙","야간 탐험가"],["challenge26","📆","한 달 개근"],["challenge27","👑","시즌 챔피언"],["challenge28","❔","비밀 배지"],["challenge29","🏵️","전설의 수집가"],["matchQuick","⚔️","빠른 대전 첫 매칭"],["matchFriend","🎲","친구 랜덤 플레이"]]};
export const BADGES=Object.entries(BADGE_GROUPS).flatMap(([category,entries])=>entries.map(([id,icon,title])=>({id,icon,title,category})));
export const legacyBadgeIds=new Set(["base","day40","master","share","day50"]);
export function earnedBadge(b,awards={},home=null,profile=null,stats=null){
 if(legacyBadgeIds.has(b.id))return !!awards[b.id];
 const visits=home?.visits||{}, values=Object.values(visits);
 const normalizedVisits=Object.fromEntries(Object.entries(visits).map(([id,record])=>[id.toLowerCase().replace(/[^a-z0-9]/g,""),record]));
 const count=values.reduce((sum,x)=>sum+Math.max(0,Number(x?.count)||0),0);
 const explored=values.filter(x=>(Number(x?.count)||0)>0).length;
 const thresholds={explore1:1,explore5:5,explore10:10,explore20:20};
 if(b.id==="welcome")return count>=1;
 if(b.id==="profile")return !!(profile?.nickname&&profile.nickname!=="게스트");
 if(b.id in thresholds)return explored>=thresholds[b.id];
 const visitThresholds={visit10:10,visit50:50,visit100:100,visit500:500};
 if(b.id in visitThresholds)return count>=visitThresholds[b.id];
 if(b.id.startsWith("project")){
   const names=["Wheel","Quiz","Battle","Bomb","Risk","Spy","Reflex","Casino","Music","Piano","Dice Duel","Time","GCrown","Marble","Vault","AI","Button","Clicker","Decode","Check","Form","Edit","Balance","Fate","Cook","Tool"];
   const id=names[Number(b.id.slice(7))]?.toLowerCase();
   return !!(id&&(Number(normalizedVisits[id.replace(/[^a-z0-9]/g,"")]?.count)||0)>0);
 }
 const v=(key)=>Math.max(0,Number(stats?.[key])||0);
 const challenge={
 challenge0:()=>v("wins")>=1,challenge1:()=>v("bestWinStreak")>=5,challenge2:()=>v("bestWinStreak")>=10,
 challenge3:()=>v("quizCorrect")>=100,challenge4:()=>v("spyDetected")>=10,challenge5:()=>v("spySurvived")>=10,
 challenge6:()=>v("gcrownWins")>=10,challenge7:()=>v("diceDuelWins")>=10,challenge8:()=>v("timeWins")>=10,
 challenge9:()=>v("reflexWins")>=10,challenge10:()=>v("marbleWins")>=10,challenge11:()=>v("cookCompleted")>=20,
 challenge12:()=>v("clickerMilestones")>=10,challenge13:()=>v("musicPublished")>=1,challenge14:()=>v("pianoCompleted")>=20,
 challenge15:()=>v("wheelPlays")>=50,challenge16:()=>v("bombWins")>=10,challenge17:()=>v("friends")>=1,
 challenge18:()=>v("friends")>=5,challenge19:()=>v("friends")>=20,challenge20:()=>v("invitesSent")>=1,
 challenge21:()=>v("multiplayerGames")>=1,challenge22:()=>v("gamesPlayed")>=100,challenge23:()=>v("gamesPlayed")>=1000,
 challenge24:()=>v("weekendSessions")>=10,challenge25:()=>v("nightSessions")>=10,challenge26:()=>v("consecutiveDays")>=30,
 challenge27:()=>v("seasonChampion")>=1,challenge28:()=>!!stats?.secretBadge,
 challenge29:()=>Object.keys(awards||{}).filter(id=>awards[id]).length>=30,
 matchQuick:()=>v("quickMatch1")>=1,matchFriend:()=>v("friendRandom1")>=1
 };
 if(b.id in challenge)return challenge[b.id]();
 return !!awards[b.id];
}
