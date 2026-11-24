import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {get,ref,set,update} from 'firebase/database';
import assert from 'node:assert/strict';
let env;
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});
});
after(()=>env?.cleanup());
test('SYNC rematch atomically discards old answers and only the host can restart',async()=>{
 const host=env.authenticatedContext('alice').database();
 const guest=env.authenticatedContext('bob').database();
 const root='syncRooms/ABC234';
 const state=(phase,round)=>({phase,round,score:0,streak:0,updatedAt:Date.now(),roundPoints:0});
 await assertSucceeds(set(ref(host,root),{hostUid:'alice',seed:0,createdAt:Date.now(),players:{alice:{name:'Alice',joinedAt:Date.now()}},state:state('lobby',0)}));
 await assertSucceeds(set(ref(guest,root+'/players/bob'),{name:'Bob',joinedAt:Date.now()}));
 await assertSucceeds(set(ref(host,root+'/state'),state('answer',6)));
 await assertSucceeds(set(ref(guest,root+'/answers/bob'),{round:6,choice:1}));
 await assertFails(update(ref(host,root),{state:state('lobby',0),answers:null}));
 await assertSucceeds(set(ref(host,root+'/state'),state('end',6)));
 await assertFails(set(ref(host,root+'/answers'),null));
 await assertFails(update(ref(guest,root),{state:state('lobby',0),answers:null}));
 await assertSucceeds(update(ref(host,root),{state:state('lobby',0),answers:null}));
 assert.equal((await get(ref(host,root+'/answers'))).exists(),false);
 await assertSucceeds(set(ref(host,root+'/state'),state('answer',6)));
 await assertSucceeds(set(ref(guest,root+'/answers/bob'),{round:6,choice:2}));
 await assertFails(set(ref(guest,root+'/answers/bob'),{round:6,choice:3}));
});
