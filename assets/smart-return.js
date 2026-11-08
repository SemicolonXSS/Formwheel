/* Opt-in project return. Missing or blocked browser storage never prevents Hub startup. */
(()=>{
'use strict';
const KEY='fw.smartReturn.enabled.v1',LAST='fw.smartReturn.last.v1',MARKER='fw.smartReturn.redirected.v2';
const enabled=()=>{try{return localStorage.getItem(KEY)==='true';}catch{return false;}};
const last=()=>{try{const v=JSON.parse(localStorage.getItem(LAST)||'null');return v&&typeof v==='object'?v:null;}catch{return null;}};
function canResume(value){
 try{
  const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='semicolonxss.github.io')return false;
  if(/^\/Formwheel_[\w-]+\//i.test(u.pathname))return true;
  const catalog=window.FormwheelHubProjects||[];
  return catalog.some(p=>{try{return new URL(p.url).pathname===u.pathname;}catch{return false;}})||['/Formwheel/edu.html','/Formwheel/calendar.html','/Formwheel/workshop/'].includes(u.pathname);
 }catch{return false;}
}
// If session storage cannot hold the loop guard, keep the visitor in the Hub.
try{
 const saved=last();
 if(enabled()&&!new URL(location.href).searchParams.has('stay')&&!sessionStorage.getItem(MARKER)&&canResume(saved?.url)){
  sessionStorage.setItem(MARKER,'1');location.replace(saved.url);
 }
}catch{}
function init(){
 const panel=document.createElement('section');
 panel.style.cssText='margin:12px auto;padding:12px 16px;max-width:1080px;border:1px solid #cbd5e1;border-radius:14px;background:#f8fafc;color:#243047;font:inherit';
 const label=document.createElement('label'),toggle=document.createElement('input'),detail=document.createElement('div');
 label.style.cssText='display:flex;align-items:center;gap:9px;font-weight:700';toggle.type='checkbox';toggle.id='fw-resume-enabled';
 label.append(toggle,document.createTextNode(' 🧭 스마트 복귀 사용'));detail.id='fw-resume-detail';detail.style.marginTop='8px';detail.setAttribute('role','status');panel.append(label,detail);
 const slot=document.getElementById('fw-settings-resume');if(slot)slot.append(panel);else document.body.insertBefore(panel,document.body.firstChild);
 function render(){
  toggle.checked=enabled();detail.replaceChildren();
  if(!toggle.checked){detail.textContent='기본 꺼짐 · 켜면 다음 방문에 마지막 프로젝트로 자동 복귀합니다.';return;}
  const saved=last();
  if(!canResume(saved?.url)){detail.textContent='아직 최근 프로젝트가 없습니다.';return;}
  const link=document.createElement('a');link.href=saved.url;link.textContent='▶ '+String(saved.name||'최근 프로젝트').slice(0,60)+' 이어서 열기';link.style.cssText='color:#334bb0;font-weight:700;margin-right:14px';
  const remove=document.createElement('button');remove.type='button';remove.textContent='기록 삭제';
  remove.addEventListener('click',()=>{try{localStorage.removeItem(LAST);render();}catch{detail.textContent='최근 프로젝트 기록을 삭제하지 못했어요.';}});detail.append(link,remove);
 }
 toggle.addEventListener('change',()=>{
  const next=toggle.checked;
  try{localStorage.setItem(KEY,String(next));try{sessionStorage.removeItem(MARKER);}catch{}render();}
  catch{toggle.checked=enabled();detail.textContent='스마트 복귀 설정을 저장하지 못했어요. 사이트 저장 공간을 확인해 주세요.';}
 });
 document.addEventListener('click',event=>{
  if(!enabled())return;const link=event.target.closest('a[href]');if(!link)return;
  try{const u=new URL(link.href,location.href);if(canResume(u.href))localStorage.setItem(LAST,JSON.stringify({url:u.href,name:link.textContent.trim().slice(0,60),at:Date.now()}));}catch{}
 },true);
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===LAST||event.key===null)render();});render();
}
window.FormwheelSmartReturn=Object.freeze({canResume});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
