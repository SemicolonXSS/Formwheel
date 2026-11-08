const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Text{constructor(s){this.nodeType=3;this.textContent=s;this.isConnected=true;this.parentElement={closest:()=>false}}contains(x){return x===this}}
class Root{constructor(nodes=[]){this.nodeType=1;this.isConnected=true;this.nodes=nodes}matches(){return false}querySelectorAll(){return []}contains(x){return this.nodes.includes(x)}}
const body=new Root([new Text('게임'),new Text('ROT13, Base64, HTML, 진법 등을 인코딩하고 디코딩하는 도구.')]);
const data=new Map(),events=[];let observer;
const ctx={console,setTimeout,queueMicrotask,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},NodeFilter:{SHOW_TEXT:4},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail}},MutationObserver:class{constructor(cb){this.cb=cb;observer=this}observe(){this.active=true}disconnect(){this.active=false}takeRecords(){return[]}},document:{body,readyState:'complete',documentElement:{},querySelector:()=>null,getElementById:()=>null,createTreeWalker:root=>{let i=0;return{nextNode:()=>root.nodes?.[i++]||null}}},window:{dispatchEvent:e=>events.push(e),addEventListener:()=>{}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../shared/formwheel-i18n.js','utf8'),ctx);
(async()=>{
const api=ctx.window.FormwheelI18n;api.setLanguage('en');assert.equal(body.nodes[0].textContent,'Games');assert.match(body.nodes[1].textContent,/Encode and decode/);
body.nodes[0].textContent='도구';observer.cb([{target:body.nodes[0]}]);await new Promise(r=>setTimeout(r,15));assert.equal(body.nodes[0].textContent,'Tools');assert.equal(events.length,2);
const added=new Text('열기 →');body.nodes.push(added);observer.cb([{target:body}]);await new Promise(r=>setTimeout(r,15));assert.equal(added.textContent,'Open →');api.setLanguage('ko');assert.equal(body.nodes[0].textContent,'도구');assert.equal(added.textContent,'열기 →');api.setLanguage('en');assert.equal(added.textContent,'Open →');console.log('PASS localization: round trips, external text edits, inserted nodes, descriptions, mutation event suppression');
class Storage{constructor(){this.map=new Map()}getItem(k){return this.map.get(k)||null}setItem(k,v){this.map.set(k,v)}removeItem(k){this.map.delete(k)}}
const store=new Storage(),pending=[],writes=[],statuses=[];let authCallback,liveCallback;
const auth={currentUser:null};const c={console,Storage,localStorage:store,setTimeout,clearTimeout,Event:class{},CustomEvent:class{constructor(type,init){this.detail=init.detail}},window:{dispatchEvent:e=>{if(e.detail)statuses.push(e.detail.state)}},auth,db:{},onAuthStateChanged:(_,cb)=>authCallback=cb,ref:(_,p)=>p,get:()=>new Promise((resolve,reject)=>pending.push({resolve,reject})),update:async(path,value)=>writes.push({path,value}),onValue:(_,cb)=>{liveCallback=cb;return()=>{}}};
let src=fs.readFileSync(__dirname+'/../shared/account-theme-sync.js','utf8').replace(/^import .*;\n/gm,'').replace(/^const (config|app|auth)=.*;\n/gm,'');vm.createContext(c);vm.runInContext(src,c);
store.setItem('formwheel_rapid_shop_beta_v1','{"equipped":"sunset"}');store.setItem('fw-global-theme-v1','sunset');
const snap=value=>({exists:()=>true,val:()=>value});auth.currentUser={uid:'a'};let ready=authCallback(auth.currentUser);pending.shift().resolve(snap({selected:'ocean',projects:{}}));await ready;assert.equal(store.getItem('fw-global-theme-v1'),'ocean');assert.equal(writes.length,0);
liveCallback(snap({selected:'forest',projects:{}}));assert.equal(store.getItem('fw-global-theme-v1'),'forest');
auth.currentUser={uid:'b'};const b=authCallback(auth.currentUser);auth.currentUser={uid:'c'};const d=authCallback(auth.currentUser);pending.shift().resolve(snap({selected:'sunset',projects:{}}));await b;assert.equal(store.getItem('fw-global-theme-v1'),'forest');pending.shift().resolve(snap({selected:'ocean',projects:{}}));await d;
store.setItem('fw-global-theme-v1','forest');await new Promise(r=>setTimeout(r,550));assert.equal(writes.length,1);assert.equal(writes[0].path,'formwheelV2/themePreferences/c');assert.deepEqual(JSON.parse(JSON.stringify(writes[0].value)),{selected:'forest'});store.setItem('fw-project-themes-v1',JSON.stringify({'/Formwheel_Maze/':'haunted-night'}));
liveCallback(snap({selected:'forest',projects:{Wheel:'ocean'}}));
assert.deepEqual(JSON.parse(store.getItem('fw-project-themes-v1')),{'/Formwheel_Maze/':'haunted-night',Wheel:'ocean'});
await new Promise(r=>setTimeout(r,550));
assert.deepEqual(JSON.parse(JSON.stringify(writes[1].value)),{'projects/%2FFormwheel_Maze%2F':'haunted-night'});
store.setItem('fw-project-themes-v1',JSON.stringify({Wheel:'ocean'}));await new Promise(r=>setTimeout(r,550));
assert.deepEqual(JSON.parse(JSON.stringify(writes[2].value)),{'projects/%2FFormwheel_Maze%2F':null});
console.log('PASS theme: server preference wins, no login overwrite, realtime updates, stale-account responses ignored, current-account save');
})().catch(e=>{console.error(e);process.exitCode=1});

