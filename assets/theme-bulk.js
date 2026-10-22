/* Bulk project theme assignments; cosmetic only, purchase entitlements remain checked by shared UI. */
(()=>{
'use strict';
const key='fw-project-themes-v1', shopKey='formwheel_rapid_shop_beta_v1';
const palettes={sunset:'🌇 선셋',forest:'🌲 포레스트',neon:'💜 네온',galaxy:'🌌 갤럭시',ocean:'🌊 오션',sakura:'🌸 사쿠라',midnight:'🌙 미드나이트',aurora:'🌌 오로라',ember:'🔥 엠버',cyber:'⚡ 사이버',royal:'👑 로열',echo:'📡 ECHO',nova:'🌟 NOVA','void-premium':'🕳️ VOID',rift:'⚡ RIFT',prismatic:'💎 프리즈마'};
const projects=window.FormwheelHubProjects||[];
const host=document.getElementById('projects');
if(!host||!projects.length)return;
const details=document.createElement('details');
details.className='fw-theme-bulk';
details.style.cssText='margin:12px 0;padding:14px;border:1px solid #d9dcee;border-radius:14px;background:#fff;color:#283047';
const summary=document.createElement('summary');
summary.textContent='🎨 프로젝트별 테마 일괄 설정';
summary.style.cssText='cursor:pointer;font-weight:800';
const intro=document.createElement('p');intro.textContent='여러 프로젝트를 선택해 구매한 테마를 한 번에 적용하세요. 각 프로젝트마다 서로 다른 테마를 지정할 수도 있어요.';
intro.style.cssText='font-size:13px;line-height:1.5';
const theme=document.createElement('select');theme.setAttribute('aria-label','적용할 테마');
theme.style.cssText='padding:9px;border:1px solid #bbc3d7;border-radius:8px;background:white;color:#202638';
const classic=document.createElement('option');classic.value='classic';classic.textContent='기본 테마 (설정 해제)';theme.append(classic);
let shop={};
try{shop=JSON.parse(localStorage.getItem(shopKey)||'{}')||{};}catch{}
const owned=new Set((Array.isArray(shop.purchases)?shop.purchases:[]).filter(p=>p && p.refunded===false).map(p=>p.theme));
Object.entries(palettes).forEach(([id,label])=>{if(!owned.has(id))return;const option=document.createElement('option');option.value=id;option.textContent=label;theme.append(option);});
const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0';
const all=document.createElement('button');all.type='button';all.textContent='전체 선택';
const none=document.createElement('button');none.type='button';none.textContent='선택 해제';
const save=document.createElement('button');save.type='button';save.textContent='선택한 프로젝트에 적용';
for(const b of [all,none,save])b.style.cssText='padding:8px 10px;border:1px solid #ccd2e2;border-radius:9px;background:#f5f6ff;color:#29346a;cursor:pointer';
const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='font-size:12px;color:#525e72';
const list=document.createElement('div');list.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;max-height:270px;overflow:auto';
const entries=[...new Map(projects.map(p=>[p.name,p])).values()];
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}};
const labelFor=id=>palettes[id]||'기본';
for(const p of entries){
 const label=document.createElement('label');label.style.cssText='display:flex;gap:6px;align-items:center;border:1px solid #e2e4ed;border-radius:9px;padding:8px;font-size:12px;background:#fafbff';
 const input=document.createElement('input');input.type='checkbox';input.value=p.name;
 const caption=document.createElement('span');caption.textContent=p.name+' · '+labelFor(read()[p.name]);
 label.append(input,caption);list.append(label);
}
const inputs=()=>[...list.querySelectorAll('input[type="checkbox"]')];
const repaint=()=>{const map=read();for(const label of list.children){const input=label.querySelector('input');label.querySelector('span').textContent=input.value+' · '+labelFor(map[input.value]);}};
all.onclick=()=>inputs().forEach(el=>el.checked=true);
none.onclick=()=>inputs().forEach(el=>el.checked=false);
save.onclick=()=>{
 const chosen=inputs().filter(el=>el.checked).map(el=>el.value);
 if(!chosen.length){status.textContent='적용할 프로젝트를 선택해 주세요.';return;}
 if(theme.value!=='classic'&&!owned.has(theme.value)){status.textContent='먼저 Rapid 상점에서 테마를 구매해야 해요.';return;}
 const map=read();
 for(const name of chosen){const project=entries.find(p=>p.name===name);if(theme.value==='classic'){delete map[name];if(project){delete map[new URL(project.url).pathname];}}else{map[name]=theme.value;if(project)map[new URL(project.url).pathname]=theme.value;}}
 try{localStorage.setItem(key,JSON.stringify(map));status.textContent=chosen.length+'개 프로젝트에 설정했어요. 해당 프로젝트를 다시 열면 적용돼요.';repaint();}
 catch{status.textContent='브라우저 저장소에 저장하지 못했습니다.';}
};
controls.append(theme,all,none,save);details.append(summary,intro,controls,list,status);
host.prepend(details);
})();