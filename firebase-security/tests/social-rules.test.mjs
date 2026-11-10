import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test,before,beforeEach,after} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {ref,set,update,get,remove,serverTimestamp,onDisconnect,query,orderByChild,limitToLast} from 'firebase/database';
let env;
const base='formwheelV2/socialFree/';
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});});
beforeEach(async()=>env.clearDatabase());
after(async()=>env?.cleanup());
const db=(uid,anonymous=false)=>uid?env.authenticatedContext(uid,{firebase:{sign_in_provider:anonymous?'anonymous':'password'}}).database():env.unauthenticatedContext().database();
const r=(uid,p)=>ref(db(uid),base+p);
const seed=async data=>env.withSecurityRulesDisabled(ctx=>set(ref(ctx.database(),base),data));
const request=(from,to)=>({from,to,status:'pending',at:serverTimestamp()});
const send=(from,to)=>update(ref(db(from),base),{['requests/'+to+'/'+from]:request(from,to),['sent/'+from+'/'+to]:true});
test('a handle claim is atomic, unique and cannot be stolen',async()=>{
 await assertFails(set(r('a','handles/alice'),'a'));
 await assertSucceeds(update(ref(db('a'),base),{'handles/alice':'a','handleByUid/a':'alice'}));
 await assertFails(update(ref(db('b'),base),{'handles/alice':'b','handleByUid/b':'alice'}));
 await assertFails(set(r('b','handleByUid/a'),'other'));
});
test('friend requests require sender ownership and an atomic outbound index',async()=>{
 await assertFails(set(r('a','requests/b/a'),request('a','b')));
 await assertSucceeds(send('a','b'));
 await assertFails(set(r('a','requests/b/a/status'),'accepted'));
 await assertFails(set(r('c','requests/b/a/status'),'accepted'));
 await assertSucceeds(set(r('b','requests/b/a/status'),'accepted'));
 await assertFails(get(r('c','requests/b')));
});
test('a declined request can be sent again without changing the UID ownership',async()=>{
 await assertSucceeds(send('a','b'));
 await assertSucceeds(set(r('b','requests/b/a/status'),'declined'));
 await assertSucceeds(send('a','b'));
 await assertFails(update(ref(db('c'),base),{'requests/b/a':request('a','b'),'sent/a/b':true}));
});
test('either participant may remove a friendship, an outsider may not',async()=>{
 await seed({requests:{a:{b:{from:'b',to:'a',status:'accepted',at:1}},b:{a:{from:'a',to:'b',status:'accepted',at:1}}},sent:{a:{b:true},b:{a:true}}});
 await assertFails(remove(r('c','requests/a/b')));
 await assertSucceeds(update(ref(db('a'),base),{'requests/a/b':null,'requests/b/a':null,'sent/a/b':null}));
});
test('blocks are owner-managed and prevent requests and invites in either direction',async()=>{
 await seed({requests:{b:{a:{from:'a',to:'b',status:'accepted',at:1}}}});
 await assertSucceeds(set(r('b','blocks/b/a'),true));
 await assertFails(set(r('a','blocks/b/a'),null));
 await assertFails(get(r('c','blocks/b')));
 await assertFails(send('a','b'));
 const invite={from:'a',game:'Spy',status:'pending',createdAt:serverTimestamp(),expiresAt:Date.now()+300000,reserve:false};
 await assertFails(set(r('a','invites/b/i'),invite));
 await assertSucceeds(remove(r('b','blocks/b/a')));
 await assertSucceeds(set(r('a','invites/b/i'),invite));
});
test('only recipients accept or delete invites; payload and expiry remain immutable',async()=>{
 await seed({requests:{b:{a:{from:'a',to:'b',status:'accepted',at:1}}}});
 await assertSucceeds(set(r('a','invites/b/i'),{from:'a',game:'Battle',status:'pending',createdAt:serverTimestamp(),expiresAt:Date.now()+300000,reserve:false}));
 await assertFails(set(r('c','invites/b/i/status'),'accepted'));
 await assertFails(set(r('b','invites/b/i/game'),'Spy'));
 await assertSucceeds(set(r('b','invites/b/i/status'),'accepted'));
 await assertSucceeds(get(query(r('b','invites/b'),orderByChild('createdAt'),limitToLast(40))));
 await assertFails(remove(r('a','invites/b/i')));
 await assertSucceeds(remove(r('b','invites/b/i')));
});
test('anonymous and unauthenticated clients cannot claim IDs, request friends or block users',async()=>{
 for(const uid of [null,'guest']){
  const database=uid?db(uid,true):db(null);
  await assertFails(set(ref(database,base+'blocks/guest/a'),true));
  await assertFails(set(ref(database,base+'requests/a/guest'),request('guest','a')));
  await assertFails(update(ref(database,base),{'handles/guest':'guest','handleByUid/guest':'guest'}));
 }
});
test('session cleanup can be armed before creation without granting another UID writes',async()=>{
 const id='a'.repeat(32),own=ref(db('a'),'formwheelV2/liveHubSessions/a/'+id);
 const guard=onDisconnect(own);
 await assertSucceeds(guard.remove());
 await assertSucceeds(set(own,{joinedAt:serverTimestamp(),lastSeen:serverTimestamp(),project:'Hub',accountType:'account'}));
 await assertFails(remove(ref(db('b'),'formwheelV2/liveHubSessions/a/'+id)));
 await assertSucceeds(remove(own));await guard.cancel();
});
test('encoded project-theme keys are owner-only and balances stay server-owned',async()=>{
 await assertSucceeds(update(ref(db('a'),'formwheelV2/themePreferences/a'),{'projects/%2FFormwheel_Maze%2F':'haunted-night'}));
 await assertFails(set(ref(db('b'),'formwheelV2/themePreferences/a/selected'),'ocean'));
 await assertFails(set(ref(db('a'),'formwheelV2/rapidWallets/a/balance'),'999'));
});
test('public badge sharing is explicit, contains only earned badge IDs and never exposes private event records',async()=>{
 await env.withSecurityRulesDisabled(ctx=>set(ref(ctx.database(),'formwheelV2/anniversary4050/a/badges/base'),{badgeId:'base',claimedAt:1}));
 await assertFails(get(ref(db('b'),'formwheelV2/anniversary4050/a/badges')));
 await assertSucceeds(set(ref(db('a'),'formwheelV2/publicEventBadges/a'),{base:true}));
 await assertSucceeds(get(ref(db('b'),'formwheelV2/publicEventBadges/a')));
 await assertFails(set(ref(db('a'),'formwheelV2/publicEventBadges/a/master'),true));
 await assertFails(set(ref(db('b'),'formwheelV2/publicEventBadges/a/base'),true));
 await assertFails(set(ref(db('a'),'formwheelV2/publicEventBadges/a/claimedAt'),1));
 await assertSucceeds(remove(ref(db('a'),'formwheelV2/publicEventBadges/a')));
});

test('Threads guests can correct their own submission while only approved profiles are public',async()=>{
 const root='formwheelV2/threadsExchange/';
 const guest=db('guest',true),publicDb=db(null);
 const admin=env.authenticatedContext('moderator',{admin:true}).database();
 const own=ref(guest,root+'submissions/guest'),published=ref(admin,root+'approved/guest');
 const profile=handle=>({url:'https://www.threads.net/@'+handle,handle,createdAt:serverTimestamp()});
 await assertSucceeds(set(own,profile('first')));
 const first=(await get(own)).val();
 await assertFails(get(ref(publicDb,root+'submissions')));
 await assertFails(get(ref(db('other'),root+'submissions/guest')));
 await assertFails(set(ref(guest,root+'approved/guest'),first));
 await assertSucceeds(set(published,first));
 await assertSucceeds(set(own,profile('corrected')));
 const approvedList=ref(publicDb,root+'approved');
 assert.equal((await assertSucceeds(get(approvedList))).val().guest.handle,'first');
 await assertFails(set(published,first));
 await assertSucceeds(set(published,(await get(own)).val()));
 assert.equal((await assertSucceeds(get(approvedList))).val().guest.handle,'corrected');
});
