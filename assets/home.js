/* Formwheel Hub home v1: local-first; account sync requires verified ID/Core adapter. */
(() => {
"use strict";
const byId=id=>document.getElementById(id);
if(typeof projects==="undefined" || !byId("fw-home")) return;
const key="fw:hub:home:v1", cacheKey="fw:hub:recommend:v1";
const all=new Map(projects.map(p=>[p.name.toLowerCase(),p]));
const defaults=["wheel","spy","reflex"];
const valid=(arr,max=100)=>[...new Set((Array.isArray(arr)?arr:[]).filter(id=>typeof id==="string"&&all.has(id)))].slice(0,max);
const load=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))||fallback}catch{return fallback}};
const save=(k,value)=>{try{localStorage.setItem(k,JSON.stringify(value))}catch{byId("fw-home-status").textContent="기기 저장소에 저장하지 못했어요."}};
let state=load(key,{pinned:[],excluded:[],visits:{},version:1});
state={pinned:valid(state.pinned,3),excluded:valid(state.excluded),visits:state.visits&&typeof state.visits==="object"?state.visits:{},version:1};
let cache=load(cacheKey,{}),draft=null;
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const persist=()=>{save(key,state);render()};
const list=()=>projects.filter(p=>!state.pinned.includes(p.name.toLowerCase())&&!state.excluded.includes(p.name.toLowerCase()));
function recompute(){
 const date=today();const pool=list();
 const fingerprint=[...state.pinned,...state.excluded].join("|");
 if(cache.date!==date||cache.fingerprint!==fingerprint||!Array.isArray(cache.ids)||cache.ids.some(id=>!all.has(id))){
   const preferred=defaults.filter(id=>pool.some(p=>p.name.toLowerCase()===id));
   const scored=pool.map((p,i)=>{const visit=state.visits[p.name.toLowerCase()]||{};const age=visit.last?Math.max(0,(Date.now()-visit.last)/86400000):999;
     return {id:p.name.toLowerCase(),index:i,score:(age<=7?35*(1-age/8):0)+30*Math.min(Number(visit.count)||0,10)/10+(!visit.count?15:0)+((projects.length-i)/projects.length)*20};});
   scored.sort((a,b)=>b.score-a.score||a.index-b.index);
   const ids=state.pinned.length||Object.keys(state.visits).length?scored.map(x=>x.id):[...preferred,...scored.map(x=>x.id)];
   cache={date,fingerprint,ids:[...new Set(ids)].slice(0,Math.max(3,ids.length))};save(cacheKey,cache);
 }
 return cache.ids.filter(id=>all.has(id)&&!state.pinned.includes(id)&&!state.excluded.includes(id)).slice(0,3);
}
function card(id,recommend=false){
 const p=all.get(id);if(!p)return "";
 const reason=(state.visits[id]?.count?"최근 플레이":defaults.includes(id)?"대표 프로젝트":"새로운 발견");
 return '<article class="fw-home-card"><a class="fw-home-link" href="'+p.url+'" data-fw-play="'+id+'"><span class="fw-home-emoji">'+p.icon+'</span><strong>'+escapeHTML(p.name)+'</strong><small>'+(recommend?reason:"고정됨")+'</small></a><div class="fw-home-actions"><button type="button" data-fw-pin="'+id+'" aria-label="'+escapeHTML(p.name)+(recommend?" 고정":" 고정 해제")+'">'+(recommend?"📌 고정":"✓ 고정")+'</button>'+(recommend?'<button type="button" data-fw-exclude="'+id+'">추천 제외</button>':"")+'</div></article>';
}
function render(){
 const pins=state.pinned.filter(id=>all.has(id));
 byId("fw-pinned-section").hidden=pins.length===0;
 byId("fw-pinned-cards").innerHTML=pins.map(id=>card(id)).join("");
 const rec=recompute();
 byId("fw-recommended-cards").innerHTML=rec.map(id=>card(id,true)).join("");
 byId("fw-recommended-empty").hidden=rec.length!==0;
 byId("fw-home-count").textContent=pins.length+"/3";
}
function renderEditor(){
 const container=byId("fw-edit-list");
 container.innerHTML=draft.map((id,i)=>{const p=all.get(id);return '<div class="fw-edit-item"><span>'+p.icon+' '+escapeHTML(p.name)+'</span><span><button type="button" data-move="'+i+':-1" '+(!i?"disabled":"")+'>↑</button><button type="button" data-move="'+i+':1" '+(i===draft.length-1?"disabled":"")+'>↓</button><button type="button" data-remove="'+id+'">해제</button></span></div>'}).join("")||'<p>고정한 프로젝트가 없어요.</p>';
}
function togglePin(id){
 if(state.pinned.includes(id)){state.pinned=state.pinned.filter(x=>x!==id);persist();byId("fw-home-status").textContent="고정을 해제했어요.";return}
 if(state.pinned.length>=3){
  const old=window.prompt("고정은 최대 3개예요. 교체할 프로젝트 이름을 입력하세요: "+state.pinned.map(x=>all.get(x).name).join(", "));
  if(!old)return;
  const replace=state.pinned.find(x=>x===old.trim().toLowerCase());if(!replace){byId("fw-home-status").textContent="고정 교체를 취소했어요. 정확한 프로젝트 이름이 필요해요.";return}
  state.pinned.splice(state.pinned.indexOf(replace),1,id);
 }else state.pinned.push(id);
 persist();byId("fw-home-status").textContent="홈 고정 설정을 저장했어요.";
}
byId("fw-home").addEventListener("click",e=>{
 const button=e.target.closest("button");
 if(button){
  if(button.dataset.fwPin){togglePin(button.dataset.fwPin);return}
  if(button.dataset.fwExclude){state.excluded=valid([...state.excluded,button.dataset.fwExclude]);persist();byId("fw-home-status").textContent="추천에서 제외했어요. 전체 목록에서는 계속 찾을 수 있어요.";return}
  if(button.dataset.move){const [i,d]=button.dataset.move.split(":").map(Number);const j=i+d;if(j>=0&&j<draft.length){[draft[i],draft[j]]=[draft[j],draft[i]];renderEditor()}return}
  if(button.dataset.remove){draft=draft.filter(x=>x!==button.dataset.remove);renderEditor();return}
 }
 const link=e.target.closest("[data-fw-play]");if(link)record(link.dataset.fwPlay);
});
function record(id){
 const v=state.visits[id]||{count:0};state.visits[id]={count:Math.min(100000,(Number(v.count)||0)+1),last:Date.now()};
 save(key,state); // Navigation click is an approximation, not proof of completed gameplay.
}
document.getElementById("cards")?.addEventListener("click",e=>{
 const a=e.target.closest("a.openButton");if(!a)return;
 const project=projects.find(p=>p.url===a.href);if(project)record(project.name.toLowerCase());
});
byId("fw-edit-toggle").addEventListener("click",()=>{
 const editor=byId("fw-home-editor");
 if(editor.hidden){draft=[...state.pinned];renderEditor();editor.hidden=false;byId("fw-edit-toggle").textContent="편집 닫기"}
 else{editor.hidden=true;draft=null;byId("fw-edit-toggle").textContent="편집"}
});
byId("fw-edit-save").addEventListener("click",()=>{state.pinned=valid(draft,3);byId("fw-home-editor").hidden=true;draft=null;byId("fw-edit-toggle").textContent="편집";persist();byId("fw-home-status").textContent="고정 순서를 저장했어요."});
byId("fw-edit-cancel").addEventListener("click",()=>{byId("fw-home-editor").hidden=true;draft=null;byId("fw-edit-toggle").textContent="편집"});
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
window.addEventListener("storage",e=>{if(e.key===key){const incoming=load(key,null);if(incoming){state={pinned:valid(incoming.pinned,3),excluded:valid(incoming.excluded),visits:incoming.visits||{},version:1};render()}}});
})();
