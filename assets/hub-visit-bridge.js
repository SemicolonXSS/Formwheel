/* Minimal Hub visit state bridge for compact Hub layout. */
(()=>{
"use strict";
const storageKey="fw:hub:home:v1",guestKey="fw:hub:guest:v1";
const valid=new Set((typeof projects!=="undefined"?projects:[]).map(p=>p.name.toLowerCase()));
function clean(raw){
 const visits={};
 for(const [id,val] of Object.entries(raw?.visits||{})){
  const key=id.toLowerCase();
  if(valid.has(key)&&val&&typeof val==="object")visits[key]={count:Math.max(0,Number(val.count)||0),last:Math.max(0,Number(val.last)||0)};
 }
 return {version:1,pinned:[],excluded:[],visits};
}
function load(){try{return clean(JSON.parse(localStorage.getItem(storageKey)))}catch{return clean({})}}
let state=load();
function emit(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}window.dispatchEvent(new CustomEvent("fw:hub:changed",{detail:{state:read()}}))}
function read(){return clean(state)}
window.FormwheelHubHome={read,apply(remote){state=clean(remote);try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}}};
function record(id){
 if(!valid.has(id))return;
 const old=state.visits[id]||{count:0,last:0};
 state.visits[id]={count:Math.min(100000,old.count+1),last:Date.now()};
 emit();
}
document.addEventListener("click",event=>{
 const a=event.target.closest("a[href]");
 if(!a)return;
 let url;try{url=new URL(a.href,location.href)}catch{return}
 const match=(typeof projects!=="undefined"?projects:[]).find(p=>{
  try{const target=new URL(p.url,location.href);return target.origin===url.origin&&target.pathname.replace(/\/$/,"")===url.pathname.replace(/\/$/,"")}
  catch{return false}
 });
 if(match)record(match.name.toLowerCase());
},true);
})();