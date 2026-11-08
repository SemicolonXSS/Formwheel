'use strict';
const milestones=[5,10,20,50,100];
// Commit the record and every witness in one transaction. A retry can never see
// a new record without its associated awards, or award the same record twice.
function advancePeak(current,active,at){
 const unique=[...new Set(active)],count=unique.length;
 const old=current&&typeof current==='object'?current:{};
 const previous=Math.max(4,Number(old.record?.count)||0);
 if(count<=previous)return;
 const users={...old.users};
 for(const uid of unique){
  const prior=users[uid]||{},next={...prior.milestones};
  for(const n of milestones)if(n>previous&&n<=count&&!next[n])next[n]={awardedAt:at,peak:count};
  users[uid]={...prior,firstWitnessedAt:prior.firstWitnessedAt||at,bestWitnessed:Math.max(Number(prior.bestWitnessed)||0,count),lastWitnessedAt:at,milestones:next};
 }
 return {...old,record:{count,recordedAt:at},users};
}
module.exports={advancePeak};
