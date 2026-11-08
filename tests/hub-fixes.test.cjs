'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=p=>fs.readFileSync(path.join(root,p),'utf8');
const {advancePeak}=require('../functions/presence-core.cjs');
const badgeModule=import('data:text/javascript;base64,'+Buffer.from(source('assets/badge-catalog.js')).toString('base64'));
test('visit badges use real sessions while project badges still use project opens',async()=>{
 const {BADGES,earnedBadge}=await badgeModule,b=id=>BADGES.find(x=>x.id===id);
 const home={visits:{wheel:{count:100}}};
 assert.equal(earnedBadge(b('visit10'),{},home,null,{visitCount:2}),false);
 assert.equal(earnedBadge(b('visit10'),{},home,null,{visitCount:10}),true);
 assert.equal(earnedBadge(b('project0'),{},home,null,{visitCount:2}),true);
 assert.equal(earnedBadge(b('welcome'),{},null,null,{firstSeen:1}),true);
});
test('collector counts earned badges from every category without counting itself',async()=>{
 const {BADGES,earnedBadge}=await badgeModule;
 const names=BADGES.filter(b=>b.category==='프로젝트').map((b,i)=>['wheel','quiz','battle','bomb','risk','spy','reflex','casino','music','piano','dice duel','time','gcrown','marble','vault','ai','button','clicker','decode','check','form','edit','balance','fate','cook','tool'][i]);
 const home={visits:Object.fromEntries(names.map(id=>[id,{count:1}]))};
 assert.equal(earnedBadge(BADGES.find(b=>b.id==='challenge29'),{},home,{nickname:'Explorer'}),true);
 assert.equal(earnedBadge(BADGES.find(b=>b.id==='challenge29'),{base:true}),false);
});
test('a peak transition contains every witness and its record atomically and is replay-safe',()=>{
 const active=['a','b','c','d','e'];
 const state=advancePeak({extra:'preserved'},active,100);
 assert.equal(state.record.count,5);assert.equal(state.extra,'preserved');
 for(const uid of active)assert.deepEqual(state.users[uid].milestones[5],{awardedAt:100,peak:5});
 assert.equal(advancePeak(state,active,101),undefined);
 assert.equal(advancePeak(state,[...active,'a'],101),undefined);
 const next=advancePeak(state,[...active,'f','g','h','i','j'],102);
 assert.equal(next.users.a.firstWitnessedAt,100);
 assert.equal(next.users.j.milestones[10].peak,10);
 assert.equal(state.record.count,5,'transaction retries must not mutate the input snapshot');
});
function sampler(){
 const data=new Map();let queue=Promise.resolve();
 const context={localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},document:{hasFocus:()=>true},navigator:{locks:{request:(_,fn)=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;}}},Date};
 vm.createContext(context);vm.runInContext(source('shared/visitor-time.js').replace('export async function','async function')+'\nglobalThis.sample=claimVisibleTime;',context);return context;
}
test('overlapping tabs claim visible time once per UID and recover after clock rollback',async()=>{
 const {sample}=sampler();
 const values=await Promise.all([sample('a',15000,100000),sample('a',15000,100000)]);
 assert.equal(values.reduce((a,b)=>a+b,0),15000);
 assert.equal(await sample('a',15000,115000),15000);
 assert.equal(await sample('b',15000,115000),15000);
 assert.equal(await sample('a',15000,1000),15000);
});
test('link guard finds relative, root-relative and absolute same-origin missing files',()=>{
 const {checkLinks}=require('../scripts/check-syntax.cjs'),file=path.join(root,'index.html');
 for(const href of ['missing.html','/Formwheel/missing.html','https://semicolonxss.github.io/Formwheel/missing.html'])assert.throws(()=>checkLinks('<a href="'+href+'">open</a>',file),/missing/);
 assert.doesNotThrow(()=>checkLinks('<a href="./profile.html?stay=1#top">Profile</a><a href="https://other.example/">external</a>',file));
});
function presence(){
 const auth={currentUser:null},subscriptions=new Map(),transactions=[],nodes=new Map([['fw-live-count',{}],['fw-total-visitor-count',{}]]);let authCallback;
 const ctx={console:{warn(){},debug(){}},auth,db:{},claimVisibleTime:async(_,ms)=>ms,getIdTokenResult:async u=>({claims:u.claims||{}}),
  ref:(_,p)=>p,onValue:(p,cb)=>{subscriptions.set(p,cb);return()=>subscriptions.delete(p);},onAuthStateChanged:(_,cb)=>authCallback=cb,
  runTransaction:async(p,fn)=>{transactions.push(p);return {committed:true,snapshot:{exists:()=>true,val:()=>fn(null)}};},
  document:{getElementById:id=>nodes.get(id)||null,addEventListener(){},visibilityState:'visible',referrer:''},window:{addEventListener(){}},
  location:{pathname:'/Formwheel/',search:''},URLSearchParams,Intl,Date,setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},serverTimestamp:()=>123,signInAnonymously:async()=>{}};
 const js=source('assets/live-presence.js').replace(/^import .*;\n/gm,'').replace(/^const (config|app|auth)=.*;\n/gm,'');vm.createContext(ctx);vm.runInContext(js,ctx);
 return {subscriptions,transactions,nodes,login:async user=>{auth.currentUser=user;await authCallback(user);}};
}
test('ordinary and anonymous users never subscribe to or publish administrator aggregates',async()=>{
 for(const user of [{uid:'guest',isAnonymous:true},{uid:'member',isAnonymous:false}]){
  const h=presence();await h.login(user);
  assert(!h.subscriptions.has('formwheelV2/liveHubSessions'));
  assert(!h.subscriptions.has('formwheelV2/visitorStats/uniqueVisitors'));
  assert(h.transactions.every(p=>p==='formwheelV2/visitorStats/uniqueVisitors/'+user.uid));
 }
});
test('verified administrators read details but still display the same published total as guests',async()=>{
 const h=presence();await h.login({uid:'admin',isAnonymous:false,claims:{admin:true}});
 assert(h.subscriptions.has('formwheelV2/liveHubSessions'));
 h.subscriptions.get('formwheelV2/publicVisitorCounts/total')({val:()=>({count:531,updatedAt:123})});
 h.subscriptions.get('formwheelV2/visitorStats/uniqueVisitors')({val:()=>({a:{}})});
 assert.equal(h.nodes.get('fw-total-visitor-count').textContent,'531명');
});
