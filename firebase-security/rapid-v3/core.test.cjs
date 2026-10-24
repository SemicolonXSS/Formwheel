'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {apply,money}=require('./core.cjs');
const now=1800000000000;
const seed={balance:'1000',version:0,inventory:{},transactions:{}};
const buy={type:'purchase',itemId:'sunset',requestId:'purchase_00001'};
test('valid purchase debits and owns exactly once',()=>{
 const a=apply(seed,buy,now);assert.equal(a.balance,'500');assert.equal(a.inventory.sunset.owned,true);
 assert.deepEqual(apply(a,buy,now+5),a);assert.equal(seed.balance,'1000');
});
test('refund restores purchase once',()=>{
 const a=apply(seed,buy,now);
 const refund={type:'refund',itemId:'sunset',purchaseId:'purchase_00001',requestId:'refund_00001'};
 const b=apply(a,refund,now+1000);assert.equal(b.balance,'1000');assert.equal(b.inventory.sunset.owned,false);
 assert.deepEqual(apply(b,refund,now+2000),b);
});
test('rejects free purchases, double spend, stale refunds and receipt collision',()=>{
 assert.throws(()=>apply({ ...seed,balance:'499'},buy,now),/insufficient/);
 assert.throws(()=>apply(apply(seed,buy,now),{...buy,requestId:'purchase_00002'},now),/already owned/);
 const a=apply(seed,buy,now);
 assert.throws(()=>apply(a,{type:'refund',itemId:'sunset',purchaseId:buy.requestId,requestId:'refund_00002'},now+86400001),/expired/);
 assert.throws(()=>apply(a,{type:'refund',itemId:'forest',purchaseId:buy.requestId,requestId:buy.requestId},now),/conflict/);
});
test('rejects malformed balance and arbitrary amounts',()=>{
 assert.equal(money('1e20'),null);assert.equal(money(100),null);
 assert.throws(()=>apply({...seed,balance:'1e20'},buy,now),/invalid stored/);
 const a=apply(seed,{...buy,amount:'0',price:'0'},now);
 assert.equal(a.balance,'500');
});
