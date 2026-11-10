'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
const strip=s=>s.replace(/^import .*;\n/gm,'').replace(/^const (config|app|auth)=.*;\n/gm,'');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
class Storage{
 constructor(){this.data=new Map();}
 getItem(k){return this.data.get(k)||null;}
 setItem(k,v){this.data.set(k,String(v));}
 removeItem(k){this.data.delete(k);}
}
function theme(){
 const store=new Storage(),timers=[],writes=[];let authCallback,liveCallback;
 const auth={currentUser:null};
 const snapshot=v=>({exists:()=>v!==null,val:()=>v});
 const ctx={console,Storage,localStorage:store,auth,db:{},Event:class{},CustomEvent:class{constructor(t,o){this.detail=o.detail;}},
  window:{dispatchEvent(){}},ref:(_,p)=>p,get:async()=>snapshot({selected:'ocean',projects:{}}),
  update:(path,value)=>new Promise((resolve,reject)=>writes.push({path,value,resolve,reject})),
  onValue:(_,fn)=>{liveCallback=fn;return()=>{};},onAuthStateChanged:(_,fn)=>authCallback=fn,
  setTimeout:fn=>{const timer={fn,active:true};timers.push(timer);return timer;},clearTimeout:timer=>{if(timer)timer.active=false;}};
 vm.createContext(ctx);vm.runInContext(strip(read('shared/account-theme-sync.js')),ctx);
 return {store,writes,login:async()=>{auth.currentUser={uid:'a'};await authCallback(auth.currentUser);},emit:v=>liveCallback(snapshot(v)),
  run:()=>{const timer=timers.find(t=>t.active);assert(timer);timer.active=false;return timer.fn();}};
}
test('reverting a theme while its previous save is in flight persists the final choice',async()=>{
 const h=theme();await h.login();
 h.store.setItem('fw-global-theme-v1','forest');const first=h.run();
 assert.equal(h.writes[0].value.selected,'forest');
 h.store.setItem('fw-global-theme-v1','forest');
 h.emit({selected:'ocean',projects:{Wheel:'sunset'}});
 assert.equal(h.store.getItem('fw-global-theme-v1'),'forest');
 h.store.setItem('fw-global-theme-v1','ocean');
 h.emit({selected:'forest',projects:{}});
 assert.equal(h.store.getItem('fw-global-theme-v1'),'ocean');
 h.writes[0].resolve();await first;
 const second=h.run();assert.equal(h.writes[1].value.selected,'ocean');
 h.writes[1].resolve();await second;
});
function core(){
 const pending=[],writes=[],nodes=new Map(),storage=new Storage(),callbacks=new Map();let authCallback;
 const guest={version:1,pinned:[],excluded:[],visits:{wheel:{count:1,last:1}}};let state=guest;
 const home={read:()=>JSON.parse(JSON.stringify(state)),apply:next=>state=JSON.parse(JSON.stringify(next))};
 const element=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,addEventListener(){}});return nodes.get(id);};
 const auth={currentUser:null,authStateReady:async()=>{}};let signedOut=0;
 const ctx={console,auth,db:{},BADGES:[],projects:[{name:'Wheel'}],localStorage:storage,Date,
  window:{FormwheelHubHome:home,addEventListener:(name,fn)=>callbacks.set(name,fn),dispatchEvent(){}},
  document:{getElementById:id=>['fw-id-status','fw-id-login','fw-id-logout'].includes(id)?element(id):null,addEventListener(){}},
  setPersistence:async()=>{},browserLocalPersistence:{},ref:(_,p)=>p,
  get:p=>new Promise((resolve,reject)=>pending.push({p,resolve:v=>resolve({val:()=>v}),reject})),
  set:async(p,v)=>writes.push({p,v}),onValue:()=>()=>{},onAuthStateChanged:(_,fn)=>authCallback=fn,signOut:async actual=>{assert.equal(actual,auth);signedOut++;}};
 vm.createContext(ctx);vm.runInContext(strip(read('assets/id-core.js')),ctx);
 return {pending,writes,home,nodes,login:user=>{auth.currentUser=user;authCallback(user);},api:ctx.window.FormwheelCore,signedOut:()=>signedOut};
}
test('a new account starts from the guest snapshot rather than the previous account history',async()=>{
 const h=core();h.login({uid:'a'});h.pending.shift().resolve({visits:{wheel:{count:40,last:40}}});await tick();
 assert.equal(h.home.read().visits.wheel.count,40);
 h.login({uid:'b'});h.pending.shift().resolve(null);await tick();
 assert.equal(h.writes.find(x=>x.p.endsWith('/b')).v.visits.wheel.count,1);
});
test('a delayed A response cannot replace newer A data after A -> B -> A',async()=>{
 const h=core();h.login({uid:'a'});const first=h.pending.shift();
 h.login({uid:'b'});const second=h.pending.shift();
 h.login({uid:'a'});const third=h.pending.shift();
 third.resolve({visits:{wheel:{count:9,last:9}}});await tick();
 first.resolve({visits:{wheel:{count:99,last:99}}});second.reject({code:'old-account-error'});await tick();
 assert.equal(h.home.read().visits.wheel.count,9);
 assert(!h.nodes.get('fw-id-status').textContent.includes('old-account-error'));
});
test('the shared logout API signs out the initialized authentication instance',async()=>{
 const h=core();await h.api.logout();assert.equal(h.signedOut(),1);
});
