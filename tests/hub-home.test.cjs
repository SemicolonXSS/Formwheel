'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/home.js'),'utf8');
function boot(saved={}){
 const nodes=new Map(), handlers={};
 const node=id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},value:'all',hidden:false,addEventListener(){},setAttribute(){},replaceChildren(){}});return nodes.get(id)};
 const window={addEventListener:(name,fn)=>handlers[name]=fn,dispatchEvent(){},matchMedia:()=>({matches:false})};
 vm.runInNewContext(source,{projects:[{name:'Wheel',category:'game',url:'https://example.com/',icon:'x'}],document:{getElementById:node},window,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v},Intl,Date,URL,CustomEvent:class{},escapeHTML:s=>s,fetch:()=>new Promise(()=>{}),setTimeout});
 return {api:window.FormwheelHubHome,handlers,saved};
}
test('malformed saved objects do not prevent Hub startup',()=>{
 for(const value of ['[]','"text"','42','null','{broken']){
  const h=boot({'fw:hub:home:v1':value,'fw:hub:recommend:v2':value});
  assert.equal(h.api.read().version,1);
 }
});
test('null cached recommendation slots are rebuilt',()=>{
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const h=boot({'fw:hub:recommend:v2':JSON.stringify({date:day,fingerprint:'||0',slots:[null]})});
 assert.equal(JSON.parse(h.saved['fw:hub:recommend:v2']).slots[0].id,'wheel');
});
test('remote and cross-tab history reject malformed values and preserve valid counts',()=>{
 const h=boot();
 h.api.apply({visits:{wheel:{count:7,last:123},unknown:{count:99},bad:null}});
 assert.equal(h.api.read().visits.wheel.count,7);
 assert.equal(Object.keys(h.api.read().visits).length,1);
 h.saved['fw:hub:home:v1']=JSON.stringify({visits:{wheel:{count:-5,last:'bad'}}});
 h.handlers.storage({key:'fw:hub:home:v1'});
 assert.equal(h.api.read().visits.wheel.count,0);
 assert.equal(h.api.read().visits.wheel.last,0);
});
