import {readFile} from 'node:fs/promises';
import {test,after,before} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {ref,set,get,remove} from 'firebase/database';
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-formwheel',database:{host:'127.0.0.1',port:9000,rules:await readFile(new URL('../database.rules.json',import.meta.url),'utf8')}});await env.withSecurityRulesDisabled(async ctx=>{await set(ref(ctx.database(),'formwheelV2'),{rooms:{r:{players:{alice:{name:"Alice"},bob:{name:"Bob"}}}},privateRooms:{r:{answers:{1:{correct:2}}}},privatePlayers:{r:{alice:{role:'citizen',word:'secret'},bob:{role:'spy'}}},wallets:{alice:{coins:100}},forms:{f:{public:{owner:'alice',title:'Survey',questions:['Q']},responses:{one:{respondent:'bob',answers:['A'],submittedAt:1}}}},chat:{public:{messages:{m:{uid:'alice',text:'hello',createdAt:1}}}}})})});
after(async()=>env?.cleanup());
const database=(uid,claims)=>uid?env.authenticatedContext(uid,claims).database():env.unauthenticatedContext().database();
test('anonymous and outsiders cannot read member room',async()=>{await assertFails(get(ref(database(),'formwheelV2/rooms/r')));await assertFails(get(ref(database('eve'),'formwheelV2/rooms/r')));await assertSucceeds(get(ref(database('alice'),'formwheelV2/rooms/r')))});
test('secret answers and other player roles are private',async()=>{await assertFails(get(ref(database('alice'),'formwheelV2/privateRooms/r')));await assertFails(get(ref(database('alice'),'formwheelV2/privatePlayers/r/bob')));await assertSucceeds(get(ref(database('alice'),'formwheelV2/privatePlayers/r/alice')))});
test('scores, wallet balances and producer claims cannot be client-forged',async()=>{await assertFails(set(ref(database('alice'),'formwheelV2/rooms/r/players/alice/score'),999));await assertFails(set(ref(database('alice'),'formwheelV2/wallets/alice/coins'),999));await assertFails(set(ref(database('alice'),'formwheelV2/users/alice'),{displayName:'Alice',createdAt:1,producer:true}));await assertFails(set(ref(database('alice'),'formwheelV2/bans/eve'),{at:1}))});
test('wallet reads are per UID',async()=>{await assertSucceeds(get(ref(database('alice'),'formwheelV2/wallets/alice')));await assertFails(get(ref(database('eve'),'formwheelV2/wallets/alice')))});
test('survey responses read only by owner; submissions immutable',async()=>{await assertSucceeds(get(ref(database(),'formwheelV2/forms/f/public')));await assertSucceeds(get(ref(database('alice'),'formwheelV2/forms/f/responses')));await assertFails(get(ref(database('bob'),'formwheelV2/forms/f/responses')));await assertSucceeds(set(ref(database('bob'),'formwheelV2/forms/f/responses/two'),{respondent:'bob',answers:['B'],submittedAt:2}));await assertFails(set(ref(database('bob'),'formwheelV2/forms/f/responses/two'),{respondent:'bob',answers:['C'],submittedAt:3}))});
test('chat cannot impersonate user or delete other messages',async()=>{await assertFails(set(ref(database('bob'),'formwheelV2/chat/public/messages/fake'),{uid:'alice',text:'fake',createdAt:1}));await assertFails(remove(ref(database('bob'),'formwheelV2/chat/public/messages/m')));await assertSucceeds(remove(ref(database('producer',{producer:true}),'formwheelV2/chat/public/messages/m')))});

test('season 2 clicker score is owned, bounded and cannot be deleted or reduced',async()=>{
 const root='clickerLeaderboardSeason2/alice', now=Date.now();
 const score=n=>n.toString().padStart(101,'0');
 const entry=(value,at=now)=>({uid:'alice',name:'Alice',score:score(value),updatedAt:at});
 await assertFails(set(ref(database('bob'),root),entry(1)));
 await assertFails(set(ref(database('alice'),root),{...entry(1),uid:'bob'}));
 await assertFails(set(ref(database('alice'),root),{...entry(1),score:'9'.repeat(101)}));
 await assertSucceeds(set(ref(database('alice'),root),entry(1)));
 await assertSucceeds(get(ref(database(), 'clickerLeaderboardSeason2')));
 await assertFails(remove(ref(database('alice'),root)));
 await assertFails(set(ref(database('alice'),root),entry(0,now+61000)));
 await assertFails(set(ref(database('alice'),root),entry(2,now)));
});
