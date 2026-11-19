import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {ref,set,get,update,remove,serverTimestamp} from 'firebase/database';

let env;
before(async()=>{
  env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{
    host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')
  }});
});
after(()=>env.cleanup());
const path=(uid,key)=>ref(env.authenticatedContext(uid).database(),'formwheelV2/'+key);
for(const [kind,code] of [['quick','quick123'],['friend','123456']]){
  test(kind+' lobby can be created, joined once, and cancelled by its owner while waiting',async()=>{
    const key='matchmaking/'+kind+'/'+code;
    const room={owner:'tab-a',ownerUid:'alice',status:'waiting',createdAt:Date.now(),updatedAt:Date.now()};
    await assertSucceeds(set(path('alice',key),room));
    await assertSucceeds(get(path('bob',key)));
    await assertFails(remove(path('bob',key)));
    await assertSucceeds(remove(path('alice',key)));
    await assertSucceeds(set(path('alice',key),room));
    await assertSucceeds(update(path('alice',key),{updatedAt:Date.now()}));
    const claim={guest:'tab-b',guestUid:'bob',status:'matched',game:'reflex'};
    await assertSucceeds(update(path('bob',key),claim));
    await assertFails(update(path('charlie',key),{...claim,guest:'tab-c',guestUid:'charlie'}));
  });
}
test('pixel placement is atomic, rate limited, and history is immutable',async()=>{
  const key='pixelWar/v1/players/alice';
  const stamp=serverTimestamp();
  const move={x:0,y:1,color:2,at:stamp};
  await assertSucceeds(update(path('alice',key),{count:1,lastAt:stamp,'moves/1':move}));
  await assertFails(update(path('alice',key),{count:2,lastAt:stamp,'moves/2':move}));
  await assertFails(remove(path('alice',key+'/moves/1')));
  await assertFails(set(path('bob',key+'/moves/1/x'),3));
});
