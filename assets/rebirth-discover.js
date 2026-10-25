/* REBIRTH 01: optional keyword discovery and next-project links. */
(()=>{'use strict';
const terms={'친구':['Battle','Spy','Board'],'짧은':['Reflex','Time','Button'],'퀴즈':['Quiz','Battle'],'요리':['Cook'],'음악':['Music','Piano'],'돌림판':['Wheel']};
function init(){
const cards=document.getElementById('cards'),search=document.getElementById('search');if(!cards||!search)return;
const tip=document.createElement('p');tip.textContent='💡 친구 · 짧은 · 퀴즈 · 요리 · 음악 · 돌림판으로도 탐색해 보세요.';tip.style.fontSize='12px';search.insertAdjacentElement('afterend',tip);
const box=document.createElement('section');box.id='rebirth-recommend';box.style.cssText='margin:18px 0;padding:14px;border:1px solid #ddd;border-radius:14px';const title=document.createElement('h2');title.textContent='✨ 다음 프로젝트 추천';box.append(title);const links=document.createElement('div');links.style.cssText='display:flex;flex-wrap:wrap;gap:10px';box.append(links);cards.insertAdjacentElement('afterend',box);
const seen=new Set();for(const a of cards.querySelectorAll('a[href]')){if(seen.has(a.href)||!a.href.startsWith('http'))continue;seen.add(a.href);const link=document.createElement('a');link.href=a.href;link.textContent=(a.textContent.trim()||'프로젝트 열기').slice(0,35);links.append(link);if(seen.size===3)break}if(!seen.size)box.hidden=true;
search.addEventListener('input',()=>{const q=search.value.trim();const matched=Object.entries(terms).filter(([word])=>word.includes(q)&&q);tip.textContent=matched.length?'💡 관련 프로젝트: '+matched.flatMap(([,names])=>names).join(' · '):'💡 친구 · 짧은 · 퀴즈 · 요리 · 음악 · 돌림판';});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();