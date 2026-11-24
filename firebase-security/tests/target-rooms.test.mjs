import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {get,ref,set,update,remove,serverTimestamp} from 'firebase/database';
import assert from 'node:assert/strict';
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});});
after(()=>env?.cleanup());
const db=uid=>env.authenticatedContext(uid).database();

test('Territory seat ownership, turn orders, host resolve and reconnect',async()=>{
 const h=db('host'),g=db('guest'),o=db('other'),p='territoryRooms/ABC234';
 const at=(x,s='')=>ref(x,p+s);
 const player=(uid,clientId)=>({uid,clientId});
 const data={host:'host',hostClient:'host-device',created:Date.now(),started:false,players:{0:player('host','host-device')},config:{players:2,rounds:20,difficulty:'normal',maptype:'classic'}};
 await assertFails(set(at(g),data));
 for(const [kind,key] of [['quick','territory012345'],['friend','123987']]){
  const path='formwheelV2/matchmaking/'+kind+'/'+key;
  const now=Date.now();
  await assertSucceeds(set(ref(h,path),{owner:'host-tab',ownerUid:'host',status:'waiting',createdAt:now,updatedAt:now}));
  await assertSucceeds(update(ref(g,path),{guest:'guest-tab',guestUid:'guest',status:'matched',game:'territory'}));
 }
 await assertSucceeds(set(at(h),data));
 for(const [kind,key] of [['quick','territory012345'],['friend','123987']]){
  const path='formwheelV2/matchmaking/'+kind+'/'+key;
  await assertSucceeds(update(ref(h,path),{gameRoom:'ABC234',gameReadyAt:Date.now()}));
  assert.equal((await get(ref(g,path+'/gameRoom'))).val(),'ABC234');
 }
 await assertFails(set(at(g,'/players/2'),player('guest','guest-device')));
 await assertSucceeds(set(at(g,'/players/1'),player('guest','guest-device')));
 await assertFails(set(at(o,'/players/1'),player('other','other-device')));
 const state={turn:1,phase:'choosing',cells:[{owner:-1,wall:false}],bases:[0,1],n:2};
 await assertFails(update(at(g),{started:true,state}));
 await assertSucceeds(update(at(h),{started:true,state}));
 await assertFails(set(at(g,'/orders/0'),{p:0,a:'expand',i:1,turn:1}));
 await assertFails(set(at(g,'/orders/1'),{p:1,a:'defend',i:1,turn:2}));
 await assertSucceeds(set(at(g,'/orders/1'),{p:1,a:'defend',i:1,turn:1}));
 await assertFails(set(at(g,'/orders/1'),{p:1,a:'attack',i:2,turn:1}));
 await assertSucceeds(update(at(h),{state:{...state,turn:2},orders:null}));
 assert.equal((await get(at(db('guest'),'/state/turn'))).val(),2);
 await assertFails(remove(at(o)));
 await assertSucceeds(set(at(h,'/state/phase'),'finished'));
 await assertSucceeds(remove(at(h)));
});

test('Clicker Battle has two seats, isolated scores, rejoin and guest exit',async()=>{
 const h=db('host'),g=db('guest'),o=db('other'),p='formwheelBattles/clicker/ABC234';
 const at=(x,s='')=>ref(x,p+s);
 const player=(uid,name)=>({uid,name,score:0});
 const start={host:'host-tab',hostUid:'host',phase:'waiting',createdAt:Date.now(),players:{'host-tab':player('host','Host')}};
 await assertFails(set(at(g),start));
 await assertSucceeds(set(at(h),start));
 await assertFails(get(ref(o,'formwheelBattles/clicker')));
 await assertFails(update(at(g),{guest:'guest-tab','players/guest-tab':player('other','Guest')}));
 await assertSucceeds(update(at(g),{guest:'guest-tab','players/guest-tab':player('guest','Guest')}));
 await assertFails(update(at(o),{guest:'other-tab','players/other-tab':player('other','Other')}));
 await assertFails(update(at(g),{phase:'playing',startedAt:serverTimestamp()}));
 await assertSucceeds(update(at(h),{phase:'playing',startedAt:serverTimestamp()}));
 await assertFails(set(at(g,'/players/host-tab/score'),8));
 await assertFails(set(at(h,'/players/guest-tab/score'),100));
 await assertSucceeds(set(at(g,'/players/guest-tab/score'),8));
 await assertFails(set(at(g,'/players/guest-tab/score'),4));
 assert.equal((await get(at(db('guest'),'/players/guest-tab/score'))).val(),8);
 await assertSucceeds(update(at(g),{guest:null,'players/guest-tab':null,phase:'finished'}));
 await assertFails(remove(at(o)));
 await assertSucceeds(remove(at(h)));
 await assertFails(set(ref(h,'formwheelBattles/casino/ABC234'),start));
});

for(const path of ['battle/1234','rooms/ABC234','gcrown/rooms/1234','timeRooms/ABC234','bombRooms/ABC234','formwheelBattles/casino/ABC234','formwheelBattles/marble/ABC234','formwheelBattles/music/ABC234','formwheelBattles/quiz/ABC234']){
 test('Legacy writes remain denied at '+path,async()=>{
  const target=ref(db('host'),path);
  await assertFails(get(target));
  await assertFails(set(target,{host:'host',status:'waiting'}));
 });
}
