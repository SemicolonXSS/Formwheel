import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,operation,view,catalog,WalletError} from './wallet.mjs';

const op=(action,id,fields={})=>operation({action,id,...fields});
const balance='9'.repeat(220);
const initial=()=>({balance,updatedAt:4,legacy:{keep:true}});
const mint=operation({action:'credit-verified',id:'verified_01',amount:'2500'},{allowVerifiedCredit:true});
test('public requests cannot grant scores or set balances',()=>{
 assert.throws(()=>operation({action:'credit-verified',id:'verified_01',amount:'2500'}),WalletError);
 assert.throws(()=>op('exchange','exchange_01',{amount:'2e3',balance:'50'}),WalletError);
 assert.throws(()=>apply(initial(),op('exchange','exchange_01',{amount:'1'}),10),WalletError);
 assert.throws(()=>apply({balance:'corrupt'},mint,10),WalletError);
});
test('verified score and Rapid update atomically and receipt replay is idempotent',()=>{
 const wallet=apply(initial(),mint,10);
 assert.equal(view(wallet).exchangeable,'2');
 const exchange=op('exchange','exchange_01',{amount:'2'});
 const next=apply(wallet,exchange,20);
 assert.equal(next.balance,String(BigInt(balance)+2n));
 assert.equal(next.verifiedScoreUnits,'500');
 assert.deepEqual(next.legacy,{keep:true});
 assert.equal(apply(next,exchange,30),next);
 assert.throws(()=>apply(next,op('exchange','exchange_01',{amount:'1'}),30),WalletError);
 assert.throws(()=>apply(next,op('exchange','exchange_02',{amount:'1'}),30),WalletError);
});
test('catalog price, purchase ownership, refund window and replay use stored receipts',()=>{
 const item=catalog.find(v=>v.id==='mint-breeze');
 const buy=op('buy','purchase_01',{productId:item.id,price:'0'});
 const owned=apply(initial(),buy,1000);
 assert.equal(owned.balance,String(BigInt(balance)-BigInt(item.price)));
 assert.throws(()=>apply(owned,op('buy','purchase_02',{productId:item.id}),1100),WalletError);
 const refund=op('refund','refund_0001',{purchaseId:buy.id});
 assert.throws(()=>apply(initial(),refund,1100),WalletError);
 assert.throws(()=>apply(owned,refund,86401001),WalletError);
 const returned=apply(owned,refund,1200);
 assert.equal(returned.balance,balance);
 assert.equal(returned.purchases[buy.id].refundedAt,1200);
 assert.equal(apply(returned,refund,1300),returned);
 assert.throws(()=>apply(returned,op('refund','refund_0002',{purchaseId:buy.id}),1400),WalletError);
});
