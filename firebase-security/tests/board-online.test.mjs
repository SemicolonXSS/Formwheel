import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {get,ref,remove,runTransaction,set,update} from 'firebase/database';
import assert from 'node:assert/strict';

let env;
before(async()=>{
 env=await initializeTestEnvironment({
  projectId:'demo-formwheel',
  database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}
 });
});
after(()=>env?.cleanup());

test('Board seats, authenticated rejoin, ordered actions and waiting-room deletion',async()=>{
 const host=env.authenticatedContext('host').database();
 const guest=env.authenticatedContext('guest').database();
 const stranger=env.authenticatedContext('stranger').database();
 const root='boardRooms/ABCD2345';
 const at=(db,sub='')=>ref(db,root+sub);
 const now=Date.now();
 const initial={version:1,game:'omok',size:15,hostUid:'host',guestUid:'',status:'waiting',createdAt:now,updatedAt:now};
 await assertFails(get(at(env.unauthenticatedContext().database())));
 await assertSucceeds(runTransaction(at(host),state=>state===null?initial:undefined,{applyLocally:false}));
 await assertFails(remove(at(guest)));
 await assertSucceeds(remove(at(host)));
 await assertSucceeds(set(at(host),initial));
 await assertSucceeds(get(at(guest)));
 await assertSucceeds(runTransaction(at(guest),state=>state?{...state,guestUid:'guest',status:'playing'}:null,{applyLocally:false}));
 await assertFails(update(at(stranger),{guestUid:'stranger'}));
 const first={uid:'host',kind:'place',index:110,sequence:0};
 const second={uid:'guest',kind:'place',index:111,sequence:1};
 await assertFails(set(at(guest,'/actions/2'),{...second,sequence:2}));
 await assertSucceeds(runTransaction(at(host,'/actions/0'),old=>old===null?first:undefined,{applyLocally:false}));
 await assertFails(set(at(guest,'/actions/0'),second));
 await assertFails(set(at(stranger,'/actions/1'),{...second,uid:'stranger'}));
 await assertSucceeds(runTransaction(at(guest,'/actions/1'),old=>old===null?second:undefined,{applyLocally:false}));
 const returning=env.authenticatedContext('guest').database();
 const restored=(await assertSucceeds(get(at(returning)))).val();
 assert.equal(restored.guestUid,'guest');
 assert.deepEqual(Object.values(restored.actions),[first,second]);
 await assertFails(remove(at(host)));
});
