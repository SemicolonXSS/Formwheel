import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {get,ref,set,update,remove,onDisconnect,goOffline,goOnline} from 'firebase/database';
import assert from 'node:assert/strict';

let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});});
after(()=>env?.cleanup());
test('Reflex room lifecycle, own results, presence and authenticated reconnect',async()=>{
 const h=env.authenticatedContext('host').database(),g=env.authenticatedContext('guest').database(),o=env.authenticatedContext('other').database();
 const path='reflexRooms/1234';
 const at=(db,part='')=>ref(db,path+part);
 const room={version:1,status:'lobby',round:0,createdAt:Date.now(),host:'host',players:{host:{name:'Host'}},presence:{host:true}};
 await assertFails(set(at(o),room));
 await assertSucceeds(set(at(h),room));
 await assertFails(get(ref(g,'reflexRooms')));
 await assertFails(get(at(env.unauthenticatedContext().database())));
 await assertSucceeds(get(at(g)));
 await assertSucceeds(update(at(g),{'players/guest':{name:'Guest'},'presence/guest':true}));
 await assertFails(update(at(g),{'players/other':{name:'Forged'}}));
 await assertFails(update(at(g),{status:'playing',round:1,goAt:Date.now()}));
 await assertSucceeds(update(at(h),{status:'playing',round:1,goAt:Date.now()}));
 await assertFails(set(at(o,'/players/other'),{name:'New'}));
 await assertFails(set(at(g,'/results/1/host'),{kind:'hit',ms:20}));
 await assertSucceeds(set(at(g,'/results/1/guest'),{kind:'hit',ms:198}));
 await assertFails(set(at(g,'/results/1/guest'),{kind:'hit',ms:20}));
 await assertFails(set(at(g,'/results/2/guest'),{kind:'hit',ms:20}));
 await assertSucceeds(update(at(h),{round:2,goAt:Date.now(),'results/1/host':{kind:'timeout',ms:500}}));
 await assertSucceeds(onDisconnect(at(g,'/presence/guest')).set(false));
 goOffline(g);
 for(let i=0;i<25;i++){
  if((await get(at(h,'/presence/guest'))).val()===false)break;
  await new Promise(r=>setTimeout(r,20));
 }
 assert.equal((await get(at(h,'/presence/guest'))).val(),false);
 goOnline(g);
 await assertSucceeds(set(at(g,'/presence/guest'),true));
 await assertSucceeds(set(at(h,'/presence/host'),false));
 await assertSucceeds(set(at(g,'/host'),'guest'));
 await assertSucceeds(update(at(h),{'players/host':null,'presence/host':null}));
 await assertFails(remove(at(o)));
 await assertSucceeds(remove(at(g)));
});
