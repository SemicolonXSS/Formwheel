/* Shared local preferences. Gameplay records, wallets and login storage are never changed. */
(()=>{
'use strict';
const KEY='fw.settings.v2';
const defaults={animation:'normal',sound:true,start:'hub',notifications:{achievement:true,reward:true,update:false,event:false},performance:'auto',reducedMotion:false,highContrast:false,density:'normal',font:'normal',recommend:true};
const enums={animation:['off','low','normal','high'],start:['hub','recent','favorites'],performance:['auto','saving','balanced','high'],density:['spacious','normal','compact'],font:['small','normal','large']};
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
function normalize(value){
 const raw=record(value),next={...defaults,...raw,notifications:{...defaults.notifications,...record(raw.notifications)}};
 for(const [key,allowed] of Object.entries(enums))if(!allowed.includes(next[key]))next[key]=defaults[key];
 for(const key of ['sound','reducedMotion','highContrast','recommend'])if(typeof next[key]!=='boolean')next[key]=defaults[key];
 for(const key of Object.keys(defaults.notifications))if(typeof next.notifications[key]!=='boolean')next.notifications[key]=defaults.notifications[key];
 return next;
}
function read(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{return normalize({});}}
function apply(){
 if(!document.body)return;
 const state=read(),reduced=state.reducedMotion||state.animation==='off'||state.performance==='saving';
 document.documentElement.style.fontSize=state.font==='large'?'18px':state.font==='small'?'14px':'16px';
 document.documentElement.style.setProperty('scroll-behavior',reduced?'auto':'');
 for(const name of ['compact','spacious']){
  document.body.classList.toggle(name,state.density===name);
  document.body.classList.toggle('fw-v2-'+name,state.density===name);
 }
 document.body.classList.toggle('highcontrast',state.highContrast);
 document.body.classList.toggle('fw-v2-contrast',state.highContrast);
 document.body.classList.toggle('fw-v2-reduced',reduced);
}
function write(patch){
 const current=read(),input=record(patch),next=normalize({...current,...input,notifications:{...current.notifications,...record(input.notifications)}});
 try{localStorage.setItem(KEY,JSON.stringify(next));apply();window.dispatchEvent(new Event('fw-settings-v2-changed'));return {ok:true,state:next};}
 catch(error){return {ok:false,state:current,error};}
}
function activity(){
 let value={};try{value=JSON.parse(localStorage.getItem('fw:hub:home:v1')||'{}')||{};}catch{}
 const visits=Object.values(record(value.visits)).filter(v=>v&&Number.isFinite(v.count)&&v.count>0);
 return {projectsOpened:visits.length,projectOpenCount:visits.reduce((n,v)=>n+Math.min(100000,Math.floor(v.count)),0),lastOpenAt:visits.reduce((n,v)=>Number.isFinite(v.last)?Math.max(n,Math.min(Date.now(),v.last)):n,0)};
}
window.FormwheelSettings=Object.freeze({read,write,normalize,apply,activity});
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){apply();window.dispatchEvent(new Event('fw-settings-v2-changed'));}});
window.addEventListener('focus',apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
