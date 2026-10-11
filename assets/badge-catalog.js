// Central badge catalog: new challenge badges are not auto-awarded without verified game results.
export const BADGE_GROUPS={"시작":[["welcome","🎉","첫 방문"],["profile","🪪","프로필 완성"],["explore1","🧭","탐험 시작"],["explore5","🗺️","5개 프로젝트 탐험"],["explore10","🌍","10개 프로젝트 탐험"],["explore20","🚀","20개 프로젝트 탐험"],["visit10","👣","10회 방문"],["visit50","🥾","50회 방문"],["visit100","🌠","100회 방문"],["visit500","🌌","500회 방문"]],"프로젝트":[["project0","🎡","Wheel 방문"],["project1","❓","Quiz 방문"],["project2","⚔️","Battle 방문"],["project3","💣","Bomb 방문"],["project4","🎯","Risk 방문"],["project5","🕵️","Spy 방문"],["project6","⚡","Reflex 방문"],["project7","🎰","Casino 방문"],["project8","🎵","Music 방문"],["project9","🎹","Piano 방문"],["project10","🎲","Dice Duel 방문"],["project11","⏳","Time 방문"],["project12","👑","GCrown 방문"],["project13","🔮","Marble 방문"],["project14","🔐","Vault 방문"],["project15","🤖","AI 방문"],["project16","🔘","Button 방문"],["project17","👆","Clicker 방문"],["project18","🔎","Decode 방문"],["project19","✅","Check 방문"],["project20","📝","Form 방문"],["project21","🎬","Edit 방문"],["project22","⚖️","Balance 방문"],["project23","🔮","Fate 방문"],["project24","🍳","Cook 방문"],["project25","🛠️","Tool 방문"]],"기념일":[["base","🏅","40→50 Anniversary"],["day40","👑","DAY 40 · Original"],["master","🏆","40→50 Master"],["share","📣","40→50 SHARE"],["day50","✨","DAY 50 · Finale"]],"도전":[["challenge0","🏆","첫 승리"],["challenge1","🔥","5연승"],["challenge2","💎","10연승"],["challenge3","🧠","퀴즈 마스터"],["challenge4","🔍","스파이 탐정"],["challenge5","🛡️","스파이 생존자"],["challenge6","👑","왕관 수호자"],["challenge7","🎲","주사위 지배자"],["challenge8","⌛","시간의 지배자"],["challenge9","⚡","반사신경 달인"],["challenge10","🏁","구슬 레이서"],["challenge11","🍳","요리 전문가"],["challenge12","👆","클릭 장인"],["challenge13","🎼","음악 제작자"],["challenge14","🎹","피아노 연주자"],["challenge15","🍀","룰렛 행운아"],["challenge16","💣","폭탄 해결사"],["challenge17","🤝","친구 1명"],["challenge18","🫂","친구 5명"],["challenge19","🌟","친구 20명"],["challenge20","💌","초대장 전달"],["challenge21","🎮","첫 멀티플레이"],["challenge22","🥇","100판 플레이"],["challenge23","🏅","1000판 플레이"],["challenge24","🌈","주말 플레이어"],["challenge25","🌙","야간 탐험가"],["challenge26","📆","한 달 개근"],["challenge27","👑","시즌 챔피언"],["challenge28","❔","비밀 배지"],["challenge29","🏵️","전설의 수집가"]]};
export const BADGES=Object.entries(BADGE_GROUPS).flatMap(([category,entries])=>entries.map(([id,icon,title])=>({id,icon,title,category})));
export const legacyBadgeIds=new Set(["base","day40","master","share","day50"]);
export function earnedBadge(b,awards={},home=null,profile=null){
 if(legacyBadgeIds.has(b.id))return !!awards[b.id];
 const visits=home?.visits||{}, values=Object.values(visits);
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
   return !!(id&&(Number(visits[id]?.count)||0)>0);
 }
 return !!awards[b.id];
}
