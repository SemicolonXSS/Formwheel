import {readFile} from 'node:fs/promises';
import {after,before,test} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {get,push,ref,set} from 'firebase/database';
let env;
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});
});
after(()=>env?.cleanup());
test('public music publishing validates owner and payload and leaves score writes denied',async()=>{
 const db=env.authenticatedContext('artist').database();
 const outsider=env.authenticatedContext('outsider').database();
 const publicDb=env.unauthenticatedContext().database();
 const path='formwheelMusic/songs/';
 const song=push(ref(db,path));
 const data={owner:'artist',songId:song.key,public:true,version:3,title:'Recovery test',instrument:'piano',handMode:'two',tempo:120,updatedAt:Date.now(),notes:[{id:'ab5d781c-a8b0-4d3d-8f41-20c86131b357',type:'note',note:'C4',start:0,duration:1}]};
 await assertFails(set(ref(outsider,path+song.key),data));
 await assertSucceeds(set(song,data));
 await assertSucceeds(get(ref(publicDb,path+song.key)));
 await assertFails(set(song,{...data,title:'overwrite'}));
 const bad=push(ref(db,path));
 await assertFails(set(bad,{...data,songId:bad.key,tempo:301}));
 await assertFails(set(push(ref(db,'formwheelMusic/scores/'+song.key)),{score:1}));
});
