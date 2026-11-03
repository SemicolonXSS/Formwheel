(()=>{'use strict';if(window.__fwDevTools)return;window.__fwDevTools=true;
const logs=[];let panel,output,tab='console',open=false;const max=150;
const clean=v=>{try{return String(v instanceof Error?v.message:typeof v==='string'?v:JSON.stringify(v)).replace(/AIza[\w-]+/g,'[REDACTED]').replace(/(token|password|secret|authorization)(["':=\s]+)[^,\s}"']+/gi,'$1$2[REDACTED]').slice(0,500)}catch{return '[unavailable]'}};
function record(level,args){logs.push({level,time:new Date().toLocaleTimeString(),message:args.map(clean).join(' ')});if(logs.length>max)logs.shift();if(open&&tab==='console')render()}
['log','info','warn','error'].forEach(level=>{const old=console[level];console[level]=function(...args){record(level,args);return old.apply(this,args)}});
window.addEventListener('error',e=>record('error',[e.message||'Script error']));
window.addEventListener('unhandledrejection',e=>record('error',[e.reason||'Unhandled rejection']));
const css=document.createElement('style');css.textContent=`
#fw-dev-toggle{position:fixed;right:12px;bottom:calc(72px + env(safe-area-inset-bottom));z-index:2147483000;border:0;border-radius:99px;background:#292044;color:white;padding:11px 13px;font:700 13px system-ui;box-shadow:0 3px 14px #0005}
#fw-dev-panel{position:fixed;inset:auto 8px calc(8px + env(safe-area-inset-bottom));height:min(55dvh,430px);z-index:2147483001;background:#171525;color:#f5f1ff;border:1px solid #7a6da1;border-radius:15px;display:none;flex-direction:column;font:13px system-ui;box-shadow:0 8px 35px #0009;overflow:hidden}
#fw-dev-panel button{background:#332c4b;color:white;border:1px solid #64597d;border-radius:7px;padding:9px;cursor:pointer}
#fw-dev-panel .fw-head,#fw-dev-panel .fw-tabs{display:flex;align-items:center;gap:5px;padding:7px;overflow-x:auto;flex-shrink:0}
#fw-dev-panel .fw-head{justify-content:space-between;background:#262039}
#fw-dev-panel .fw-body{overflow:auto;flex:1;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere;font:12px ui-monospace,monospace}
#fw-dev-panel .fw-line{border-bottom:1px solid #383148;padding:5px 0}
@media(min-width:850px){#fw-dev-panel{left:auto;right:15px;width:550px;height:420px}}
`;document.head.append(css);
const toggle=document.createElement('button');toggle.id='fw-dev-toggle';toggle.type='button';toggle.textContent='</>';toggle.setAttribute('aria-label','개발자 도구 열기');document.body.append(toggle);
panel=document.createElement('section');panel.id='fw-dev-panel';panel.setAttribute('aria-label','Formwheel 개발자 도구');panel.innerHTML='<div class="fw-head"><strong>⌘ Formwheel DevTools</strong><div><button data-act="copy">복사</button> <button data-act="close">닫기</button></div></div><div class="fw-tabs"></div><div class="fw-body" role="log"></div>';document.body.append(panel);output=panel.querySelector('.fw-body');
function render(){const tabs=panel.querySelector('.fw-tabs');tabs.replaceChildren();['console','network','storage','diagnostics'].forEach(name=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed',String(tab===name));b.onclick=()=>{tab=name;render()};tabs.append(b)});output.replaceChildren();let lines=[];
if(tab==='console')lines=logs.map(x=>`[${x.time}] [${x.level}] ${x.message}`);
if(tab==='network')lines=['네트워크 진단: navigator.onLine = '+navigator.onLine,'요청 내용과 인증 정보는 수집하지 않습니다.','Firebase permission_denied는 Console 탭에서 확인하세요.'];
if(tab==='storage')lines=['localStorage 항목 수: '+safeCount('localStorage'),'sessionStorage 항목 수: '+safeCount('sessionStorage'),'보안상 저장된 값과 키는 표시하지 않습니다.'];
if(tab==='diagnostics')lines=['현재 주소: '+location.pathname,'연결: '+(navigator.onLine?'온라인':'오프라인'),'언어: '+navigator.language,'시간: '+new Date().toLocaleString(),'진단은 읽기 전용입니다.'];if(!lines.length)lines=['기록 없음'];lines.forEach(s=>{const div=document.createElement('div');div.className='fw-line';div.textContent=s;output.append(div)})}
function safeCount(key){try{return window[key].length}catch{return '접근 불가'}}
function show(value){open=value;panel.style.display=value?'flex':'none';toggle.style.display=value?'none':'block';if(value)render()}
toggle.onclick=()=>show(true);panel.addEventListener('click',e=>{const act=e.target.dataset?.act;if(act==='close')show(false);if(act==='copy'){const value=output.innerText;navigator.clipboard?.writeText(value).catch(()=>{});}});
window.addEventListener('keydown',e=>{if((e.key==='F12'||(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'))&&!e.repeat){if(e.key==='F12'&&!(e.ctrlKey||e.metaKey))return; e.preventDefault();show(!open)}});
window.FormwheelDevTools={open:()=>show(true),close:()=>show(false),toggle:()=>show(!open)};
})();