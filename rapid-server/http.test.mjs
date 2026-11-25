import {createServer} from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import {rapidHandler} from './http.mjs';
import {apply} from './wallet.mjs';

test('HTTP authenticates wallet ownership and rejects browser credits and unapproved origins',async t=>{
 const trusted='https://semicolonxss.github.io';
 const wallets=new Map([['alice',{balance:'10',verifiedScoreUnits:'1000'}],['bob',{balance:'90'}]]);
 const server=createServer(rapidHandler({
  origin:trusted,
  auth:{verifyIdToken:async(token,revoked)=>{
   assert.equal(revoked,true);
   if(token==='alice')return {uid:'alice',firebase:{sign_in_provider:'google.com'}};
   if(token==='guest')return {uid:'bob',firebase:{sign_in_provider:'anonymous'}};
   throw Error('invalid');
  }},
  walletRef:uid=>({get:async()=>({val:()=>wallets.get(uid)})}),
  transact:async(uid,op)=>{const next=apply(wallets.get(uid),op,100);wallets.set(uid,next);return next;}
 }));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const root='http://127.0.0.1:'+server.address().port;
 const post=(body,token='alice')=>fetch(root+'/transactions',{method:'POST',headers:{origin:trusted,authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await fetch(root+'/wallet')).status,401);
 assert.equal((await fetch(root+'/wallet',{headers:{origin:'https://another.example'}})).status,403);
 assert.equal((await post({id:'exchange_01',action:'exchange',amount:'1'},'guest')).status,401);
 assert.equal((await post({id:'verified_01',action:'credit-verified',amount:'1000'})).status,409);
 const cmd={id:'exchange_01',action:'exchange',amount:'1',uid:'bob'};
 const response=await post(cmd);
 assert.equal(response.status,200);
 assert.equal((await response.json()).wallet.balance,'11');
 assert.equal((await (await post(cmd)).json()).wallet.balance,'11');
 assert.equal(wallets.get('bob').balance,'90');
});
