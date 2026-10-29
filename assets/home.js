/* Formwheel Hub home v1: local-first; account sync requires verified ID/Core adapter. */
(() => {
"use strict";
const byId=id=>document.getElementById(id);
if(typeof projects==="undefined" || !byId("fw-home")) return;
const key="fw:hub:home:v1", cacheKey="fw:hub:recommend:v2";
const all=new Map(projects.map(p=>[p.name.toLowerCase(),p]));
const defaults=["wheel","spy","reflex"];
const valid=(arr,max=100)=>[...new Set((Array.isArray(arr)?arr:[]).filter(id=>typeof id==="string"&&all.has(id)))].slice(0,max);
const isRecord=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
const load=(k,fallback)=>{try{const value=JSON.parse(localStorage.getItem(k));return isRecord(value)?value:fallback}catch{return fallback}};
const cleanVisits=value=>Object.fromEntries(Object.entries(isRecord(value)?value:{}).filter(([id,v])=>all.has(id)&&isRecord(v)).map(([id,v])=>[id,{count:Math.min(100000,Math.max(0,Number.isFinite(v.count)?Math.floor(v.count):0)),last:Math.max(0,Number.isFinite(v.last)?v.last:0)}]));
const save=(k,value)=>{try{localStorage.setItem(k,JSON.stringify(value))}catch{byId("fw-home-status")?.replaceChildren("기기 저장소에 저장하지 못했어요.")}};
let state=load(key,{pinned:[],excluded:[],visits:{},version:1});
state={pinned:[],excluded:valid(state.excluded),visits:cleanVisits(state.visits),version:1};
let cache=load(cacheKey,{}),draft=null;
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const persist=()=>{save(key,state);render();window.dispatchEvent(new CustomEvent("fw:hub:changed",{detail:{state:exportState()}}))};
const exportState=()=>JSON.parse(JSON.stringify({version:1,pinned:state.pinned,excluded:state.excluded,visits:state.visits}));
window.FormwheelHubHome={read:exportState,apply(remote){if(!remote||typeof remote!=="object")return;state={version:1,pinned:[],excluded:valid(remote.excluded),visits:cleanVisits(remote.visits)};save(key,state);cache={};render()},localKey:key};
const list=()=>projects.filter(p=>!state.excluded.includes(p.name.toLowerCase()));
// GitHub repository pushed_at records are cached for one day to limit API requests.
let updatedByRepo={};
const repoCacheKey="fw:hub:repository-updates:v1";
const repoCache=load(repoCacheKey,{});
if(repoCache&&repoCache.time&&Date.now()-repoCache.time<86400000&&repoCache.data)updatedByRepo=repoCache.data;
async function refreshRepositoryUpdates(){
 if(repoCache&&repoCache.time&&Date.now()-repoCache.time<86400000&&repoCache.data)return;
 try{
  const response=await fetch("https://api.github.com/users/SemicolonXSS/repos?per_page=100&type=owner",{headers:{Accept:"application/vnd.github+json"}});
  if(!response.ok)throw Error("GitHub API unavailable");
  const repos=await response.json();
  updatedByRepo=Object.fromEntries(repos.filter(r=>r.name&&r.pushed_at).map(r=>[r.name.toLowerCase(),Date.parse(r.pushed_at)]));
  save(repoCacheKey,{time:Date.now(),data:updatedByRepo});
  cache={};render();
 }catch(_){ /* Offline: use available project dates. */ }
}
const added=p=>Date.parse(p.addedAt||"")||0;
const updated=p=>{
 const pathname=(()=>{try{return new URL(p.url).pathname}catch{return ""}})();
 const repo=pathname.split("/").filter(Boolean)[0]?.toLowerCase();
 return updatedByRepo[repo]||Date.parse(p.updatedAt||"")||added(p);
};
function recompute(){
 const date=today(),pool=list(),fingerprint=[...state.excluded].join("|")+"|"+Object.keys(state.visits).map(id=>id+":"+(state.visits[id]?.count||0)).sort().join("|")+"|"+Object.keys(updatedByRepo).length;
 if(cache.date!==date||cache.fingerprint!==fingerprint||!Array.isArray(cache.slots)||cache.slots.some(slot=>!isRecord(slot)||!all.has(slot.id))){
  const chosen=new Set();
  const choose=(kind,rank)=>{
   const options=pool.filter(p=>!chosen.has(p.name.toLowerCase())&&((kind!=="new"&&kind!=="familiar")||p.category==="game"));
   options.sort((a,b)=>rank(b)-rank(a)||a.name.localeCompare(b.name));
   if(!options.length)return null;
   const id=options[0].name.toLowerCase();chosen.add(id);return {id,kind};
  };
  const updatedSlot=choose("updated",updated);
  const newSlot=choose("new",added);
  const familiarSlot=choose("familiar",p=>{
   const v=state.visits[p.name.toLowerCase()]||{};
   return (Number(v.count)||0)*1e13+(Number(v.last)||0)+(defaults.includes(p.name.toLowerCase())?1:0);
  });
  cache={date,fingerprint,slots:[updatedSlot,newSlot,familiarSlot].filter(Boolean)};
  save(cacheKey,cache);
 }
 return cache.slots.filter(slot=>all.has(slot.id)&&!state.excluded.includes(slot.id));
}
function card(id,kind=""){
 const p=all.get(id);if(!p)return "";
 const reason=kind==="updated"?"🛠️ 최근 업데이트":kind==="new"?"🆕 새로운 게임":kind==="familiar"?"💜 친숙한 게임":"추천";
 return '<article class="fw-home-card"><a class="fw-home-link" href="'+p.url+'" data-fw-play="'+id+'"><span class="fw-home-emoji">'+p.icon+'</span><strong>'+escapeHTML(p.name)+'</strong><small>'+reason+'</small></a><div class="fw-home-actions"><button type="button" data-fw-exclude="'+id+'">추천 제외</button></div></article>';
}
function render(){
 const rec=recompute();
 byId("fw-recommended-cards").innerHTML=rec.map(slot=>card(slot.id,slot.kind)).join("");
 byId("fw-recommended-empty").hidden=rec.length!==0;
}
byId("fw-home").addEventListener("click",e=>{
 const button=e.target.closest("button");
 if(button){
  if(button.dataset.fwExclude){state.excluded=valid([...state.excluded,button.dataset.fwExclude]);persist();byId("fw-home-status").textContent="추천에서 제외했어요. 전체 목록에서는 계속 찾을 수 있어요.";return}
 }
 const link=e.target.closest("[data-fw-play]");if(link)record(link.dataset.fwPlay);
});
function record(id){
 const v=state.visits[id]||{count:0};state.visits[id]={count:Math.min(100000,(Number(v.count)||0)+1),last:Date.now()};
 persist(); // Navigation click is an approximation, not proof of completed gameplay.
}
document.getElementById("cards")?.addEventListener("click",e=>{
 const a=e.target.closest("a.openButton");if(!a)return;
 const project=projects.find(p=>{try{const expected=new URL(p.url,location.href),actual=new URL(a.href,location.href);return expected.origin===actual.origin&&expected.pathname.replace(/\/$/,"")===actual.pathname.replace(/\/$/,"")}catch{return false}});if(project)record(project.name.toLowerCase());
});
byId("fw-excluded-show").addEventListener("click",()=>{const el=byId("fw-excluded-list");el.hidden=!el.hidden;el.innerHTML=state.excluded.map(id=>'<button type="button" data-restore="'+id+'">'+escapeHTML(all.get(id)?.name||id)+' 제외 해제 ×</button>').join("")||"<span>제외한 프로젝트가 없어요.</span>"});
byId("fw-excluded-list").addEventListener("click",e=>{const b=e.target.closest("[data-restore]");if(!b)return;state.excluded=state.excluded.filter(x=>x!==b.dataset.restore);persist();byId("fw-excluded-show").click();byId("fw-excluded-show").click()});
const filterToggle=byId("fw-filter-toggle"),filterPanel=byId("fw-filter-panel");
const responsiveFilters=()=>{if(window.matchMedia("(max-width:700px)").matches){if(!filterPanel.dataset.initialized){filterPanel.hidden=true;filterPanel.dataset.initialized="1"}}else{filterPanel.hidden=false;filterPanel.dataset.initialized="";}filterToggle.setAttribute("aria-expanded",String(!filterPanel.hidden))};
responsiveFilters();window.addEventListener("resize",responsiveFilters);
filterToggle.addEventListener("click",()=>{filterPanel.hidden=!filterPanel.hidden;filterToggle.setAttribute("aria-expanded",String(!filterPanel.hidden))});
function syncFilterCount(){const count=["modeFilter","connectionFilter","difficultyFilter"].filter(id=>byId(id).value!=="all").length;byId("fw-filter-count").textContent=count?count+"개 적용":""}
["modeFilter","connectionFilter","difficultyFilter","resetFilters"].forEach(id=>byId(id).addEventListener(id==="resetFilters"?"click":"change",()=>setTimeout(syncFilterCount,0)));
syncFilterCount();
render();
refreshRepositoryUpdates();
window.addEventListener("storage",e=>{if(e.key===key){const incoming=load(key,null);if(incoming){state={pinned:valid(incoming.pinned,3),excluded:valid(incoming.excluded),visits:cleanVisits(incoming.visits),version:1};render()}}});
})();
