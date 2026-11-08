'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
const catalog=import('data:text/javascript;base64,'+Buffer.from(src('assets/badge-catalog.js')).toString('base64'));
class Node{
 constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.style={};this._value='';this.textContent='';this.replacements=0;}
 get options(){return this.children;}
 get value(){return this._value;}
 set value(value){this._value=String(value);}
 get selectedIndex(){return this.children.findIndex(n=>n.value===this._value);}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.replacements++;this.children=nodes;}
 addEventListener(type,fn){this.listeners[type]=fn;}
}
async function boot(){
 const data=new Map(),nodes=new Map(),subscriptions=new Map(),writes=[],events=new Map();let authCallback;
 const element=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
 element('fw-badge-filter').value='all';
 const auth={currentUser:null};
 const ctx={console,auth,db:{},...await catalog,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},Event:class{},
  window:{addEventListener:(t,fn)=>events.set(t,fn),dispatchEvent(){}},document:{getElementById:element,createElement:t=>new Node(t)},ref:(_,p)=>p,
  onValue:(p,fn)=>{subscriptions.set(p,fn);return()=>{};},onAuthStateChanged:(_,fn)=>authCallback=fn,
  set:(p,v)=>new Promise((resolve,reject)=>writes.push({p,v,resolve,reject}))};
 const source=src('assets/profile.js').replace(/^import .*;\n/gm,'').replace(/^const (config|app|auth)=.*;\n/gm,'');
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {nodes,subscriptions,writes,data,emit:(p,value)=>subscriptions.get(p)({val:()=>value}),login:user=>{auth.currentUser=user;authCallback(user);}};
}
test('choosing no featured badge survives background updates without resetting unchanged badge DOM',async()=>{
 const h=await boot();h.login({uid:'a'});
 h.emit('formwheelV2/anniversary4050/a/badges',{base:true});h.emit('formwheelV2/featuredBadges/a','base');
 const select=h.nodes.get('fw-featured-select');select.value='';select.listeners.change({target:select});
 h.emit('formwheelV2/visitorStats/uniqueVisitors/a',{firstSeen:1,visitCount:1});
 assert.equal(select.value,'');
 const grid=h.nodes.get('fw-badges-grid'),count=grid.replacements;
 h.emit('formwheelV2/visitorStats/uniqueVisitors/a',{firstSeen:1,visitCount:1,totalMs:15000});
 assert.equal(grid.replacements,count);
});
test('old account subscriptions cannot overwrite the new profile',async()=>{
 const h=await boot();h.login({uid:'a'});const old=h.subscriptions.get('formwheelV2/hubProfiles/a');
 h.login({uid:'b'});h.emit('formwheelV2/hubProfiles/b',{nickname:'Bob',icon:'🎮',color:'#123456'});
 old({val:()=>({nickname:'Alice',icon:'🎡',color:'#123456'})});
 assert.equal(h.nodes.get('fw-profile-name').textContent,'Bob');
});
test('incoming profile data and an earlier save do not erase a newer unsaved edit',async()=>{
 const h=await boot();h.login({uid:'a'});
 h.emit('formwheelV2/hubProfiles/a',{nickname:'Original',icon:'🎡',color:'#123456'});
 const form=h.nodes.get('fw-profile-form'),input=h.nodes.get('fw-profile-nickname');
 input.value='Draft';form.listeners.input();
 h.emit('formwheelV2/hubProfiles/a',{nickname:'Remote',icon:'🎡',color:'#123456'});
 assert.equal(input.value,'Draft');
 const save=form.listeners.submit({preventDefault(){}});
 input.value='New draft';form.listeners.input();h.writes[0].resolve();await save;
 assert.equal(input.value,'New draft');
});
test('a previous account save failure does not appear in the current account',async()=>{
 const h=await boot();h.login({uid:'a'});
 h.nodes.get('fw-profile-nickname').value='Alice';const save=h.nodes.get('fw-profile-form').listeners.submit({preventDefault(){}});
 h.login({uid:'b'});h.writes[0].reject({code:'old-account-error'});await save;
 assert.equal(h.nodes.get('fw-profile-status').textContent,'');
});
