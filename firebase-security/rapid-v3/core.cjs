'use strict';
/* Rapid v3 prototype. Pure reducer; never trusts client-supplied prices or balances.
 * This module is not wired to production callable functions. */
const CATALOG=Object.freeze({sunset:'500',forest:'800',neon:'1200',galaxy:'1500',ocean:'1800',sakura:'2700'});
const money=s=>typeof s==='string'&&/^(0|[1-9][0-9]{0,499})$/.test(s)?BigInt(s):null;
const ident=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(s);
function apply(wallet,request,now){
  if(!ident(request?.requestId))throw Error('invalid request ID');
  if(!Number.isSafeInteger(now)||now<0)throw Error('invalid server time');
  const original=wallet||{balance:'0',version:0,inventory:{},transactions:{}};
  const balance=money(original.balance);
  if(balance===null)throw Error('invalid stored balance');
  if(original.transactions?.[request.requestId]){
    const prior=original.transactions[request.requestId];
    if(prior.type!==request.type||prior.itemId!==request.itemId||(request.type==='refund'&&prior.purchaseId!==request.purchaseId))throw Error('request ID conflict');
    return original;
  }
  const inventory={...(original.inventory||{})},transactions={...(original.transactions||{})};
  const itemId=request.itemId;
  const price=money(CATALOG[itemId]);
  if(price===null)throw Error('unknown item');
  let next=balance;
  let charged=price;
  if(request.type==='purchase'){
    if(inventory[itemId]?.owned)throw Error('already owned');
    if(balance<price)throw Error('insufficient funds');
    next=balance-price;
    inventory[itemId]={owned:true,purchaseId:request.requestId,purchasedAt:now};
  }else if(request.type==='refund'){
    const owned=inventory[itemId];
    if(!owned?.owned||owned.purchaseId!==request.purchaseId)throw Error('invalid purchase');
    const previous=transactions[request.purchaseId];
    if(!previous||previous.type!=='purchase'||previous.itemId!==itemId)throw Error('missing receipt');
    if(now<owned.purchasedAt||now-owned.purchasedAt>86400000)throw Error('refund expired');
    charged=money(previous.amount);
    if(charged===null||charged<=0n)throw Error('invalid receipt amount');
    next=balance+charged;
    inventory[itemId]={...owned,owned:false,refundedAt:now};
  }else throw Error('unsupported operation');
  transactions[request.requestId]={type:request.type,itemId,amount:charged.toString(),at:now,
    ...(request.type==='refund'?{purchaseId:request.purchaseId}:{})};
  return {...original,balance:next.toString(),version:(original.version||0)+1,inventory,transactions,updatedAt:now};
}
module.exports={apply,money,CATALOG};
