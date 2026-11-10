(()=>{'use strict';
if(window.__fwDevTools)return;
window.__fwDevTools=true;
const logs=[],max=600;
let panel,output,tab='console',opened=false,filter='all',search='',paused=false;
let totalCaptured=0;
const startedAt=Date.now();
let lastConnectivity=navigator.onLine?'online':'offline';
const denyPattern=/permission[_ -]?denied/i;
const sessionPattern=/\/formwheelV2\/liveHubSessions\//i;
const safeString=v=>{
 try{
  let s=String(v instanceof Error?(v.stack||v.message):typeof v==='string'?v:JSON.stringify(v));
  return s.replace(/AIza[\w-]+/g,'[API_KEY]')
   .replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+/gi,'$1[REDACTED]')
   .replace(/((?:token|password|secret|authorization|idToken|refreshToken)\s*["':=]+\s*)[^,\s}"']+/gi,'$1[REDACTED]')
   .replace(/(\/liveHubSessions\/)[^/\s]+\/[^/\s]+/g,'$1[UID]/[SESSION]')
   .slice(0,1200);
 }catch{return '[unavailable]'}
};
function classify(message){
 if(/unexpected keyword ['"]?return|expected ['"]?\)|unexpected token|unterminated|missing \)/i.test(message))return 'JavaScript 문법 오류';
 if(/quotaexceedederror|storage quota/i.test(message))return '저장소 용량 오류';
 if(/chunkloaderror|loading chunk|failed to load module script/i.test(message))return '스크립트 로딩 오류';
 if(denyPattern.test(message))return sessionPattern.test(message)?'세션 저장 권한 오류':'Firebase 권한 오류';
 if(/duration_transaction_not_committed|방문 시간 누적 실패/i.test(message))return '방문 시간 누적 오류';
 if(/visitor_transaction_not_committed|방문 등록 실패/i.test(message))return '방문자 기록 오류';
 if(/network|offline|failed to fetch|disconnected/i.test(message))return '네트워크 오류';
 if(/syntaxerror|referenceerror|typeerror/i.test(message))return 'JavaScript 오류';
 return null;
}
function record(level,args){
 totalCaptured++;
 const message=args.map(safeString).join(' ');
 const last=logs[logs.length-1],kind=classify(message);
 if(last&&last.level===level&&last.message===message&&Date.now()-last.stamp<4000){last.repeat++;last.stamp=Date.now()}
 else logs.push({level,time:new Date().toLocaleTimeString(),stamp:Date.now(),message,kind,repeat:1});
 if(logs.length>max)logs.shift();
 if(opened&&!paused&&(tab==='console'||tab==='issues'||tab==='overview'))render();
}
['log','info','warn','error'].forEach(level=>{
 const original=console[level];if(typeof original!=='function')return;
 console[level]=function(...args){record(level,args);return original.apply(this,args)};
});
window.addEventListener('error',e=>{
 const location=[e.filename||'unknown file',Number.isInteger(e.lineno)&&e.lineno>0?e.lineno:'?',Number.isInteger(e.colno)&&e.colno>0?e.colno:'?'].join(':');
 record('error',[e.message||'Script error','Location: '+location,e.error?.stack||'']);
});
window.addEventListener('unhandledrejection',e=>record('error',[e.reason||'Unhandled rejection']));
if(Array.isArray(window.__fwEarlyErrors)){
 for(const error of window.__fwEarlyErrors){
  const where=[error.filename||'unknown file',error.line||'?',error.column||'?'].join(':');
  record('error',[error.message||'Script error','Location: '+where,error.stack||'']);
 }
 window.__fwEarlyErrors=null;
}
function overviewLines(){
 const n=l=>logs.filter(x=>x.level===l).reduce((s,x)=>s+x.repeat,0);
 const denied=logs.filter(x=>x.kind&&x.kind.includes('권한 오류')).reduce((s,x)=>s+x.repeat,0);
 return ['FW12 4.1 · 실시간 요약','로그 '+logs.length+'/'+max+' · 오류 '+n('error')+' · 경고 '+n('warn'),
 'Firebase 권한 오류 '+denied+'회','네트워크 '+(navigator.onLine?'온라인':'오프라인'),
 denied?'권한 오류 감지됨 · 오류 분석 탭을 확인하세요.':'수집된 로그에서 권한 오류가 감지되지 않았습니다. 정상 작동을 보장하지는 않습니다.',
 '전체 수집 이벤트 '+totalCaptured+'회 · 최근 최대 '+max+'개 유지',
 '기록은 이 페이지에서 FW12를 로드한 이후만 포함됩니다.'];
}
function futureLines(){
 const recent=logs.filter(x=>x.stamp>Date.now()-60000);
 const errors=recent.filter(x=>x.level==='error').reduce((n,x)=>n+x.repeat,0);
 const warnings=recent.filter(x=>x.level==='warn').reduce((n,x)=>n+x.repeat,0);
 const denied=recent.filter(x=>x.kind&&x.kind.includes('권한 오류')).reduce((n,x)=>n+x.repeat,0);
 const score=Math.max(0,100-Math.min(60,errors*10)-Math.min(20,warnings*2)-Math.min(20,denied*5));
 return ['FW12 FUTURE · 최근 60초 상태','상태 점수 '+score+'/100 (로그 기반 참고 지표)','오류 '+errors+'회 · 경고 '+warnings+'회 · 권한 거부 '+denied+'회','관측 시간 '+Math.round((Date.now()-startedAt)/1000)+'초','연결 '+(navigator.onLine?'온라인':'오프라인'),
 '주의: 이 점수는 서버 건강 상태를 직접 측정하지 않습니다.',
 '권한 거부가 있다면 오류 분석에서 경로와 인증 상태를 확인하세요.',
 '자동 Rules 변경·데이터 쓰기·삭제는 하지 않습니다.'];
}
window.addEventListener('online',()=>{if(lastConnectivity!=='online'){lastConnectivity='online';record('info',['FW12: network online'])}});
window.addEventListener('offline',()=>{if(lastConnectivity!=='offline'){lastConnectivity='offline';record('warn',['FW12: network offline'])}});
function performanceLines(){
 const nav=performance.getEntriesByType('navigation')[0];
 const resources=performance.getEntriesByType('resource');
 const lines=['브라우저 성능 진단'];
 if(nav)lines.push('DOM 준비 '+Math.round(nav.domContentLoadedEventEnd)+'ms','페이지 로드 '+Math.round(nav.loadEventEnd)+'ms (0이면 미완료)','응답 대기 '+Math.max(0,Math.round(nav.responseStart-nav.requestStart))+'ms');
 lines.push('측정된 리소스 '+resources.length+'개');
 resources.slice().sort((a,b)=>b.duration-a.duration).slice(0,5).forEach(entry=>{
 let name='리소스';try{const u=new URL(entry.name);name=u.origin===location.origin?u.pathname:u.hostname+u.pathname}catch{}
 lines.push('느린 요청 '+safeString(name)+' · '+Math.round(entry.duration)+'ms');
 });
 lines.push('URL 쿼리 및 요청 본문은 수집하지 않습니다.');
 return lines;
}
let fallbackDownloadDay='',fallbackDownloadCount=0;
function nextReportFilename(){
 // Korean calendar day and hour, independent of the device's time-zone setting.
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
  timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',
  hourCycle:'h23'
 }).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 const date=parts.year+'-'+parts.month+'-'+parts.day;
 const key='fw12.report.downloadCount.'+date;
 let count=0;
 try{
  count=Math.max(0,Number(localStorage.getItem(key))||0)+1;
  localStorage.setItem(key,String(count));
 }catch{
  count=(fallbackDownloadDay===date?fallbackDownloadCount:0)+1;
  fallbackDownloadDay=date;fallbackDownloadCount=count;
 }
 return 'FW12-report-'+date+'-'+parts.hour+'-'+String(count).padStart(3,'0')+'.json';
}
function exportReport(){
 const data={version:'4.1',createdAt:new Date().toISOString(),path:location.pathname,overview:overviewLines(),future:futureLines(),issues:issueLines(),triage:triageLines(),health:healthSnapshot(),performance:performanceLines(),logs:logs.map(({level,time,message,kind,repeat})=>({level,time,message,kind,repeat}))};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nextReportFilename();document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const style=document.createElement('style');
style.textContent='#fw-dev-toggle{position:fixed;right:12px;bottom:calc(72px + env(safe-area-inset-bottom));z-index:2147483000;border:0;border-radius:99px;background:#292044;color:white;padding:11px 13px;font:700 13px system-ui;box-shadow:0 3px 14px #0005}'+
'#fw-dev-panel{position:fixed;inset:auto 8px calc(8px + env(safe-area-inset-bottom));height:min(62dvh,520px);z-index:2147483001;background:#171525;color:#f5f1ff;border:1px solid #7a6da1;border-radius:15px;display:none;flex-direction:column;font:13px system-ui;box-shadow:0 8px 35px #0009;overflow:hidden}'+
'#fw-dev-panel button,#fw-dev-panel select,#fw-dev-panel input{background:#332c4b;color:white;border:1px solid #64597d;border-radius:7px;padding:8px;min-height:35px;font:inherit}'+
'#fw-dev-panel button{cursor:pointer}#fw-dev-panel button[aria-pressed=true]{background:#7256ae}'+
'#fw-dev-panel .fw-head,#fw-dev-panel .fw-tabs,#fw-dev-panel .fw-controls{display:flex;align-items:center;gap:5px;padding:7px;overflow-x:auto;flex-shrink:0}'+
'#fw-dev-panel .fw-head{justify-content:space-between;background:#262039}#fw-dev-panel .fw-controls input{flex:1;min-width:100px}'+
'#fw-dev-panel .fw-body{overflow:auto;flex:1;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere;font:12px ui-monospace,monospace}'+
'#fw-dev-panel .fw-line{border-bottom:1px solid #383148;padding:7px 0}#fw-dev-panel .fw-warn{color:#ffd58a}#fw-dev-panel .fw-error{color:#ff9fbd}'+
'@media(min-width:850px){#fw-dev-panel{left:auto;right:15px;width:min(650px,90vw);height:480px}}';
style.textContent+=
'#fw-dev-panel{background:#10121c;color:#e9eaf6;border:1px solid #39445c;border-radius:18px;box-shadow:0 24px 80px #000b;backdrop-filter:blur(12px)}'+
'#fw-dev-panel .fw-head{background:linear-gradient(110deg,#24204a,#171e34);padding:11px 12px;gap:12px;flex-wrap:wrap;border-bottom:1px solid #46506a}'+
'#fw-dev-panel .fw-head strong{font-size:14px;letter-spacing:.2px}'+
'#fw-dev-panel .fw-head>div{display:flex;gap:5px;flex-wrap:wrap}'+
'#fw-dev-panel .fw-tabs{background:#161b2a;border-bottom:1px solid #303a52;padding:9px;gap:6px}'+
'#fw-dev-panel .fw-tabs button{white-space:nowrap;border-radius:10px;background:transparent;border-color:transparent;color:#aebbd3}'+
'#fw-dev-panel .fw-tabs button[aria-pressed=true]{background:#6249a5;color:#fff;border-color:#a78bfa}'+
'#fw-dev-panel .fw-controls{background:#151b29;padding:9px;border-bottom:1px solid #303a52}'+
'#fw-dev-panel button,#fw-dev-panel select,#fw-dev-panel input{background:#242b3e;border:1px solid #49536d;border-radius:9px;color:#f4f5ff}'+
'#fw-dev-panel button:focus-visible,#fw-dev-panel input:focus-visible,#fw-dev-panel select:focus-visible,#fw-dev-toggle:focus-visible{outline:2px solid #bca5ff;outline-offset:2px}'+
'#fw-dev-panel .fw-body{background:#10121c;line-height:1.65;padding:12px}'+
'#fw-dev-panel .fw-line{border:1px solid #283148;background:#181e2e;border-radius:9px;padding:9px 11px;margin-bottom:7px}'+
'#fw-dev-panel .fw-warn{border-left:3px solid #fbbf24;color:#ffe4a5}'+
'#fw-dev-panel .fw-error{border-left:3px solid #fb7185;color:#ffc0cd}'+
'#fw-dev-toggle{background:linear-gradient(120deg,#5438a6,#30275d);border:1px solid #a78bfa;box-shadow:0 8px 28px #0007}'+
'@media(max-width:600px){#fw-dev-panel{inset:auto 0 0;height:min(78dvh,720px);border-radius:18px 18px 0 0;padding-bottom:env(safe-area-inset-bottom)}#fw-dev-panel .fw-head>div{width:100%}#fw-dev-panel .fw-head button{flex:1;font-size:11px;padding:6px 4px}#fw-dev-panel .fw-tabs{scrollbar-width:thin}}'+
'@media(prefers-reduced-motion:no-preference){#fw-dev-panel{animation:fw12enter .18s ease-out}@keyframes fw12enter{from{transform:translateY(12px);opacity:.6}to{transform:translateY(0);opacity:1}}}';
style.textContent+=
'#fw-dev-panel{background:#081725;color:#e8f6ff;border-color:#28638a;box-shadow:0 24px 80px #001a32c9}'+
'#fw-dev-panel .fw-head{background:linear-gradient(110deg,#063e65,#102b4a);border-bottom-color:#287aa8}'+
'#fw-dev-panel .fw-tabs{background:#0c253b;border-bottom-color:#225575}'+
'#fw-dev-panel .fw-tabs button{color:#a7d5ed}'+
'#fw-dev-panel .fw-tabs button[aria-pressed=true]{background:#087bb5;color:white;border-color:#49c6f5;box-shadow:0 0 14px #0ba5e944}'+
'#fw-dev-panel .fw-controls{background:#0b2336;border-bottom-color:#225575}'+
'#fw-dev-panel button,#fw-dev-panel select,#fw-dev-panel input{background:#13354c;border-color:#397491;color:#f0faff}'+
'#fw-dev-panel button:focus-visible,#fw-dev-panel input:focus-visible,#fw-dev-panel select:focus-visible,#fw-dev-toggle:focus-visible{outline-color:#55d4ff}'+
'#fw-dev-panel .fw-body{background:#081725}'+
'#fw-dev-panel .fw-line{background:#10283c;border-color:#244d67}'+
'#fw-dev-toggle{background:linear-gradient(120deg,#067bb8,#103d70);border-color:#54cafa;box-shadow:0 8px 28px #002e52aa}';
document.head.append(style);
const toggle=document.createElement('button');toggle.id='fw-dev-toggle';toggle.type='button';toggle.textContent='</>';toggle.setAttribute('aria-label','FW12 열기 (Ctrl + ;)');document.body.append(toggle);
panel=document.createElement('section');panel.id='fw-dev-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','FW12 개발자 도구');panel.setAttribute('aria-modal','false');
panel.innerHTML='<div class="fw-head"><strong>🛠 FW12 · Developer Tools 4.1</strong><div><button type="button" data-act="copy">복사</button> <button type="button" data-act="export">보고서 ↓</button> <button type="button" data-act="pause">일시정지</button> <button type="button" data-act="clear">지우기</button> <button type="button" data-act="close">닫기</button></div></div><div class="fw-tabs"></div><div class="fw-controls"><select aria-label="로그 수준 필터"><option value="all">전체</option><option value="error">오류</option><option value="warn">경고</option><option value="info">정보</option><option value="log">로그</option></select><input aria-label="로그 검색" placeholder="로그 검색" autocomplete="off"></div><div class="fw-body" role="log" aria-live="off"></div>';
document.body.append(panel);output=panel.querySelector('.fw-body');
const selector=panel.querySelector('select'),query=panel.querySelector('input'),controls=panel.querySelector('.fw-controls');
selector.addEventListener('change',()=>{filter=selector.value;render()});
query.addEventListener('input',()=>{search=query.value.toLowerCase();render()});
function safeCount(name){try{return window[name].length}catch{return '접근 불가'}}
function issueLines(){
 const relevant=logs.filter(x=>x.kind);
 if(!relevant.length)return ['감지된 오류 유형이 없습니다. 새 로그가 발생하면 이곳에 분류됩니다.'];
 const counts=new Map();
 relevant.forEach(x=>counts.set(x.kind,(counts.get(x.kind)||0)+x.repeat));
 const lines=[...counts].map(([kind,n])=>kind+' · '+n+'회');
 if(counts.has('세션 저장 권한 오류'))lines.push(
  '진단: /formwheelV2/liveHubSessions/{uid}/{sessionId} 쓰기가 거부되었습니다.',
  '확인 1: 저장 경로의 uid와 로그인된 auth.uid가 같은지 확인하세요.',
  '확인 2: Firebase Rules의 .write 및 .validate를 확인하세요.',
  '확인 3: 로그인 완료 전에 쓰기를 시도하거나 다른 계정의 세션을 지우고 있지 않은지 확인하세요.',
  '주의: FW12는 Rules를 자동으로 변경하지 않습니다. 전체 공개 쓰기 권한을 부여하지 마세요.'
 );
 if(counts.has('JavaScript 오류')){
  lines.push('JavaScript 오류: 콘솔 탭에서 Location: 파일:줄:열 정보를 확인하세요.');
  const located=logs.filter(x=>x.kind==='JavaScript 오류'&&x.message.includes('Location: ')).slice(-3);
  for(const entry of located){
   const match=entry.message.match(/Location:\s+(https?:\/\/[^\s]+|[^\s]+\.js[^\s]*)/);
   if(match)lines.push('오류 위치: '+match[1]);
  }
  lines.push('SyntaxError가 발생한 스크립트는 실행되지 않을 수 있습니다. 해당 파일의 문법부터 수정하세요.');
 }
 if(counts.has('Firebase 권한 오류'))lines.push('Firebase Rules와 auth.uid, 데이터 검증 조건을 확인하세요.');
 if(counts.has('방문 시간 누적 오류'))lines.push('방문 시간 트랜잭션이 커밋되지 않았습니다. 초기 null 상태·방문자 기록 존재 여부 및 Firebase 연결을 확인하세요.','기록이 반복되면 assets/live-presence.js의 최신 버전과 방문자 저장 권한을 확인하세요.');
 if(counts.has('방문자 기록 오류'))lines.push('방문자 최초 등록 트랜잭션이 중단되었습니다. 인증과 visitorStats/uniqueVisitors 규칙을 확인하세요.');
 return lines;
}
function healthSnapshot(){
 const counts={};for(const entry of logs){if(entry.kind)counts[entry.kind]=(counts[entry.kind]||0)+entry.repeat}
 return {version:'4.1',uptimeMs:Date.now()-startedAt,online:navigator.onLine,captured:totalCaptured,stored:logs.length,errors:logs.filter(x=>x.level==='error').reduce((n,x)=>n+x.repeat,0),warnings:logs.filter(x=>x.level==='warn').reduce((n,x)=>n+x.repeat,0),issueCounts:counts};
}
function triageLines(){
 const snap=healthSnapshot();const lines=['FW12 4.1 · 자동 오류 분류','오류 '+snap.errors+'회 · 경고 '+snap.warnings+'회','로그 '+snap.stored+'/'+max];
 for(const [kind,count] of Object.entries(snap.issueCounts).sort((a,b)=>b[1]-a[1])){
  lines.push(kind+' · '+count+'회');
  if(kind==='JavaScript 문법 오류')lines.push('스크립트의 파일명·줄 번호를 확인하고, 배포 전에 node --check로 검사하세요.');
  if(kind==='세션 저장 권한 오류')lines.push('Firebase liveHubSessions 경로의 auth 및 Rules를 확인하세요. FW12는 규칙을 변경하지 않습니다.');
  if(kind==='스크립트 로딩 오류')lines.push('요청 URL과 캐시 버전, GitHub Pages 배포 상태를 확인하세요.');
  if(kind==='저장소 용량 오류')lines.push('저장 공간 부족 가능성. 사용자 데이터는 자동 삭제하지 않습니다.');
 }
 if(!Object.keys(snap.issueCounts).length)lines.push('현재 수집된 분류 오류 없음 · 정상 작동 보장은 아님');
 return lines;
}
function render(){
 const tabs=panel.querySelector('.fw-tabs');tabs.replaceChildren();
 ['overview','future','triage','console','issues','performance','network','storage','diagnostics'].forEach(name=>{
  const b=document.createElement('button');b.type='button';b.textContent=({overview:'요약',future:'미래 진단',triage:'자동 분류',console:'콘솔',issues:'오류 분석',performance:'성능',network:'네트워크',storage:'저장소',diagnostics:'진단'})[name];
  b.setAttribute('aria-pressed',String(tab===name));b.onclick=()=>{tab=name;render()};tabs.append(b);
 });
 controls.hidden=!(tab==='console');
 output.replaceChildren();let lines=[];
 if(tab==='overview')lines=overviewLines();
 if(tab==='future')lines=futureLines();
 if(tab==='triage')lines=triageLines();
 if(tab==='performance')lines=performanceLines();
 if(tab==='console')lines=logs.filter(x=>(filter==='all'||x.level===filter)&&(!search||x.message.toLowerCase().includes(search))).map(x=>({text:'['+x.time+'] ['+x.level+']'+(x.repeat>1?' x'+x.repeat:'')+' '+x.message,level:x.level}));
 if(tab==='issues')lines=issueLines();
 if(tab==='network')lines=['네트워크 상태: '+(navigator.onLine?'온라인':'오프라인'),'이 화면은 요청 본문·인증 토큰을 수집하지 않습니다.','온라인 상태만으로 Firebase 접속 성공을 보장하지 않습니다.'];
 if(tab==='storage')lines=['localStorage 항목 수: '+safeCount('localStorage'),'sessionStorage 항목 수: '+safeCount('sessionStorage'),'보안상 저장된 키·값을 표시하지 않습니다.'];
 if(tab==='diagnostics')lines=['FW12 버전: 4.1','현재 경로: '+location.pathname,'연결: '+(navigator.onLine?'온라인':'오프라인'),'언어: '+navigator.language,'확인 시각: '+new Date().toLocaleString(),'수집 로그: '+logs.length+' / '+max,'전체 이벤트: '+totalCaptured,'로그 일시정지: '+(paused?'예 (화면 갱신만 중단)':'아니오'),'쓰기/삭제/Rules 변경 없이 실행하는 읽기 전용 진단입니다.'];
 if(!lines.length)lines=['기록 없음'];
 lines.forEach(item=>{const div=document.createElement('div');div.className='fw-line';const level=typeof item==='string'?'':item.level;div.classList.toggle('fw-warn',level==='warn');div.classList.toggle('fw-error',level==='error');div.textContent=typeof item==='string'?item:item.text;output.append(div)});
}
function show(on){opened=on;panel.style.display=on?'flex':'none';toggle.style.display=on?'none':'block';if(on){render();panel.querySelector('.fw-head button[data-act="close"]')?.focus()}}
toggle.addEventListener('click',()=>show(true));
panel.addEventListener('click',e=>{
 const act=e.target.closest('button[data-act]')?.dataset.act;
 if(act==='close')show(false);
 if(act==='clear'){logs.length=0;totalCaptured=0;render()}
 if(act==='export')exportReport();
 if(act==='pause'){paused=!paused;e.target.textContent=paused?'재개':'일시정지';e.target.setAttribute('aria-pressed',String(paused));if(!paused)render()}
 if(act==='copy'){
  const text=output.innerText||output.textContent||'';
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));else fallbackCopy(text);
 }
});
function fallbackCopy(value){
 const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();
 try{document.execCommand('copy')}catch{}area.remove();
}
window.addEventListener('keydown',e=>{
 if(opened&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();tab='console';render();query.focus();return}
 if(e.key==='Escape'&&opened){e.preventDefault();show(false);return}
 if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key===';'||e.code==='Semicolon')){
  if(e.repeat)return;e.preventDefault();show(!opened);
 }
});
window.FormwheelDevTools={open:()=>show(true),close:()=>show(false),toggle:()=>show(!opened),exportReport,version:'4.1',diagnostics:healthSnapshot,triage:triageLines};
})();

