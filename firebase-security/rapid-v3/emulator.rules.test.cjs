'use strict';
/* Run under Firebase database emulator. Requires npm install in this directory. */
const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {initializeTestEnvironment,assertFails,assertSucceeds}=
  require('@firebase/rules-unit-testing');
const {ref,get,set}=require('firebase/database');
let env;
before(async()=>{
 if(!process.env.FIREBASE_DATABASE_EMULATOR_HOST)throw Error('Run via firebase emulators:exec');
 env=await initializeTestEnvironment({
  projectId:'demo-formwheel-rapid-v3',
  database:{rules:readFileSync(__dirname+'/database.rules.json','utf8')}
 });
 await env.withSecurityRulesDisabled(async ctx=>{
  await set(ref(ctx.database(),'rapidV3/alice'),{balance:'12500',version:1});
 });
});
after(async()=>{if(env)await env.cleanup()});
test('only owner can read and client cannot write root or child',async()=>{
 const alice=env.authenticatedContext('alice',{firebase:{sign_in_provider:'password'}}).database();
 const bob=env.authenticatedContext('bob',{firebase:{sign_in_provider:'password'}}).database();
 const anon=env.unauthenticatedContext().database();
 const anonymous=env.authenticatedContext('guest',{firebase:{sign_in_provider:'anonymous'}}).database();
 assert.equal((await assertSucceeds(get(ref(alice,'rapidV3/alice/balance')))).val(),'12500');
 await assertFails(get(ref(bob,'rapidV3/alice')));
 await assertFails(get(ref(anon,'rapidV3/alice')));
 await assertFails(get(ref(anonymous,'rapidV3/guest')));
 await assertFails(set(ref(alice,'rapidV3/alice/balance'),'999999'));
 await assertFails(set(ref(alice,'rapidV3/alice'),{balance:'99999'}));
 await assertFails(set(ref(bob,'rapidV3/alice/balance'),'999999'));
});

test('anonymous and unauthenticated writes are rejected at all relevant depths',async()=>{
 const guest=env.unauthenticatedContext().database();
 const registered=env.authenticatedContext('alice',{firebase:{sign_in_provider:'password'}}).database();
 await assertFails(set(ref(guest,'rapidV3/alice/balance'),'100'));
 await assertFails(set(ref(registered,'rapidV3/alice/inventory/sunset/owned'),true));
 await assertFails(set(ref(registered,'rapidV3/alice/transactions/fake'),{type:'purchase'}));
 await assertFails(set(ref(registered,'rapidV3'),{}));
});
test('an authenticated user cannot enumerate other account wallets',async()=>{
 const bob=env.authenticatedContext('bob',{firebase:{sign_in_provider:'password'}}).database();
 await assertFails(get(ref(bob,'rapidV3')));
 await assertFails(get(ref(bob,'rapidV3/alice/inventory')));
});
