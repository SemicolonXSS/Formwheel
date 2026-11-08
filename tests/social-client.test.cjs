'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.style={};this.value='';this.textContent='';this.isConnected=true;}
 addEventListener(name,fn){this.listeners[name]=fn;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(){}
 remove(){this.isConnected=false;}
}
const delay=()=>new Promise(r=>setTimeout(r,70));
function boot(){
 const ids=['social-status','my-handle','friend-inbox','friend-list','invite-list','friend-blocked','friend-search-result','fw-public-badges','claim-handle','handle-button','friend-query','friend-find','invite-game','invite-minutes','social-refresh'];
 const nodes=new Map(ids.map(id=>[id,new Element()])),subscriptions=new Map(),reads=[],writes=[],events=[],intervals=[],storage=new Map();let authCallback;
 const body=new Element('body');
 const ctx={console,auth:{},db:{},root:"formwheelV2/socialFree",ref:(_,p)=>p,get:async p=>{reads.push(p);return{val:()=>p.endsWith('/handles/bob')?'bob':p.endsWith('/handleByUid/bob')?'bob':null};},
  set:async(p,v)=>writes.push([p,v]),update:async(p,v)=>writes.push([p,v]),push:p=>p+'/new',serverTimestamp:()=>123,
  query:p=>p,orderByChild:()=>{},limitToLast:()=>{},onValue:(p,fn)=>{subscriptions.set(p,fn);return()=>subscriptions.delete(p);},onAuthStateChanged:(_,fn)=>authCallback=fn,
  document:{getElementById:id=>id==='fw-invite-toast'?body.children.find(x=>x.id===id&&x.isConnected)||null:nodes.get(id)||null,createElement:tag=>new Element(tag),body,visibilityState:'visible',addEventListener(){}},
  window:{dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},Date,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  setTimeout:(fn,ms)=>ms>=8000?0:setTimeout(fn,ms),clearTimeout,setInterval:fn=>{intervals.push(fn);return intervals.length;}};
 const source=fs.readFileSync(__dirname+'/../assets/id-social.js','utf8').replace(/^import .*;\n/gm,'').replace(/^const (config|app)=.*;\n/gm,'');
 vm.createContext(ctx);vm.runInContext(source,ctx);
 function emit(part,value){const callback=subscriptions.get('formwheelV2/socialFree/'+part);assert(callback,part);callback({val:()=>value});}
 function login(uid){authCallback({uid,isAnonymous:false});}
 return {ctx,nodes,body,reads,writes,events,intervals,subscriptions,emit,login};
}
test('an existing valid invite is notified immediately and timer refreshes do not poll Firebase',async()=>{
 const h=boot();h.login('alice');
 h.emit('handleByUid/alice','alice');h.emit('requests/alice',{});h.emit('sent/alice',{});h.emit('blocks/alice',{});
 h.emit('invites/alice',{i:{from:'bob',game:'Battle',status:'pending',createdAt:Date.now(),expiresAt:Date.now()+60000,reserve:false}});
 await delay();
 assert(h.body.children.some(n=>n.id==='fw-invite-toast'));
 const count=h.reads.length;h.intervals[0]();await delay();assert.equal(h.reads.length,count);
});
test('friend lookup dispatches public badge selection and outbound subscriptions stop on account change',async()=>{
 const h=boot();h.login('alice');
 h.emit('sent/alice',{bob:true});assert(h.subscriptions.has('formwheelV2/socialFree/requests/bob/alice'));
 h.nodes.get('friend-query').value='@bob';await h.nodes.get('friend-find').listeners.click();
 assert.equal(h.events[0].type,'fw:friend-found');assert.equal(h.events[0].detail.uid,'bob');
 h.login('charlie');assert(!h.subscriptions.has('formwheelV2/socialFree/requests/bob/alice'));
});
test('an expired invite is labeled as expired and offers no acceptance action',async()=>{
 const h=boot();h.login('alice');
 h.emit('handleByUid/alice','alice');h.emit('requests/alice',{});h.emit('sent/alice',{});h.emit('blocks/alice',{});
 h.emit('invites/alice',{i:{from:'bob',game:'Spy',status:'pending',createdAt:1,expiresAt:2,reserve:false}});
 await delay();const line=h.nodes.get('invite-list').children[0];
 assert.match(line.textContent,/만료됨/);assert(!line.children.some(n=>n.textContent==='수락'));assert(!h.body.children.some(n=>n.id==='fw-invite-toast'));
});
test('a slow earlier friend search cannot replace the latest search result',async()=>{
 const h=boot(),pending=[];h.login('alice');
 h.ctx.get=p=>new Promise(resolve=>pending.push({p,resolve:v=>resolve({val:()=>v})}));
 h.nodes.get('friend-query').value='carol';const old=h.nodes.get('friend-find').listeners.click();
 h.nodes.get('friend-query').value='bob';const latest=h.nodes.get('friend-find').listeners.click();
 pending[1].resolve('bob');await new Promise(r=>setImmediate(r));pending[2].resolve('bob');await latest;
 pending[0].resolve('carol');await old;
 assert.equal(h.events.filter(e=>e.type==='fw:friend-found').length,1);
 assert.equal(h.events.find(e=>e.type==='fw:friend-found').detail.uid,'bob');
});
