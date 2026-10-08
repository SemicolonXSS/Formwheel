const {randomInt}=require('node:crypto');
class Denied extends Error{constructor(message){super(message);this.code='permission-denied'}}
function identity(auth){if(!auth?.uid)throw new Denied('인증이 필요합니다.');return auth.uid}
function producer(auth){identity(auth);if(auth.token?.producer!==true)throw new Denied('서버 Producer 권한이 필요합니다.')}
function identifier(value){if(typeof value!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(value))throw new Error('잘못된 식별자');return value}
function member(room,uid){if(!room?.players?.[uid])throw new Denied('방 참가자만 요청할 수 있습니다.')}
function submitAnswer(room,uid,input,secret,now){member(room,uid);if(room.status!=='playing'||room.round!==input.round||now<room.startedAt||now>room.deadline)throw new Error('현재 답변 가능한 라운드가 아닙니다.');const question=room.questions[room.round-1];if(!Number.isInteger(input.choice)||input.choice<0||input.choice>=question.choices.length)throw new Error('잘못된 선택지');room.answers??={};room.answers[room.round]??={};if(room.answers[room.round][uid])return room;const correct=input.choice===secret.correct;room.answers[room.round][uid]={choice:input.choice,correct,at:now};room.players[uid].score=(room.players[uid].score||0)+(correct?1:0);return room}
function castVote(room,uid,choice,now){member(room,uid);if(room.status!=='playing'||(room.deadline&&now>room.deadline))throw new Error('투표가 종료되었습니다.');if(!Number.isInteger(choice)||choice<0||choice>=room.choices.length)throw new Error('잘못된 선택지');room.voters??={};if(room.voters[uid]!==undefined)return room;room.voters[uid]=choice;room.counts??={};room.counts[choice]=(room.counts[choice]||0)+1;return room}
const catalog={ocean:{price:120,type:'background'},rose:{price:120,type:'background'},star:{price:80,type:'decoration'},crown:{price:200,type:'decoration'}};
function walletAction(wallet,uid,input,now,outcome){
 const day=new Date(now).toISOString().slice(0,10);wallet??={version:2,uid,coins:100,lastDaily:day,inventory:{},equipped:{},receipts:{}};
 if(wallet.uid!==uid||!Number.isSafeInteger(wallet.coins)||wallet.coins<0)throw new Denied('잘못된 지갑');identifier(input.receipt);wallet.receipts??={};if(wallet.receipts[input.receipt])return wallet;
 let delta=0,label=input.action;
 if(input.action==='daily'){if(wallet.lastDaily!==day)delta=100;wallet.lastDaily=day}
 else if(input.action==='purchase'){const item=catalog[input.item];if(!item||wallet.inventory?.[input.item])throw new Error('상품을 확인하세요.');delta=-item.price;wallet.inventory??={};wallet.inventory[input.item]=true}
 else if(input.action==='equip'){const item=catalog[input.item];if(!item||!wallet.inventory?.[input.item])throw new Error('보유하지 않은 상품');wallet.equipped??={};wallet.equipped[item.type]=input.item}
 else if(input.action==='coin'){const bet=input.bet;if(!Number.isSafeInteger(bet)||bet<1||bet>1000||wallet.coins<bet||!['heads','tails'].includes(input.choice)||!['heads','tails'].includes(outcome))throw new Error('잘못된 게임 요청');delta=outcome===input.choice?bet:-bet;label='coin:'+outcome}
 else throw new Error('임의 코인 변경은 허용하지 않습니다.');
 if(wallet.coins+delta<0)throw new Error('코인이 부족합니다.');wallet.coins+=delta;wallet.receipts[input.receipt]={at:now,delta,balance:wallet.coins,label};return wallet;
}
function assignSpy(players,secret){const ids=Object.keys(players),spy=ids[randomInt(ids.length)],roles={};for(const uid of ids)roles[uid]={role:uid===spy?'spy':'citizen',...(uid===spy?{}:{word:secret})};return roles}
module.exports={Denied,identity,producer,identifier,member,submitAnswer,castVote,walletAction,assignSpy};
