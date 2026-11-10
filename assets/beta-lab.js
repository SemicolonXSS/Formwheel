/* BETA LAB v1: fail-closed, device-local, UID-scoped feature flags. */
const FEATURES=Object.freeze([
['hub-next-3','HUB NEXT 3.0','차세대 허브 탐색 실험'],
['fw12-experimental','FW12 EXPERIMENTAL','차세대 진단 기능 실험'],
['smart-login','SMART LOGIN','인증 지속성 실험 (기존 인증 설정은 변경하지 않음)'],
['live-analytics','LIVE ANALYTICS','실시간 통계 표시 실험'],
['theme-engine','THEME ENGINE','새로운 테마 엔진 실험'],
['seren-ai','SEREN AI','추천 아이디어 실험'],
['rapid-next','RAPID NEXT','경제 시스템 샌드박스 실험 (실제 지갑 변경 없음)'],
['secret-lab','SECRET LAB','비공개 콘텐츠 실험']
]);
const PREFIX='fw.betaLab.v1.';
let account='guest',ready=false;
const key=()=>PREFIX+account;
function read(){try{const v=JSON.parse(localStorage.getItem(key())||'{}');if(!v||typeof v!=='object'||Array.isArray(v))return {};return Object.fromEntries(FEATURES.map(([id])=>[id,v[id]===true]));}catch{return {};}}
function save(data){try{localStorage.setItem(key(),JSON.stringify(data));return true;}catch{return false;}}
function render(){const state=read(),root=document.getElementById('experiments');root.replaceChildren();for(const [id,name,description] of FEATURES){const card=document.createElement('article');card.className='item';const title=document.createElement('h3');title.textContent=name;const desc=document.createElement('p');desc.textContent=description;const label=document.createElement('label');const caption=document.createElement('span');caption.textContent='실험 설정';const input=document.createElement('input');input.type='checkbox';input.checked=state[id]===true;input.disabled=!ready;input.setAttribute('aria-label',name+' 활성화');input.addEventListener('change',()=>{const next={...read(),[id]:input.checked};if(!save(next)){input.checked=!input.checked;status('저장 실패: 기존 상태 유지');return;}status(name+(input.checked?' 설정 ON':' 설정 OFF')+' · 실제 기능 연결은 별도 개발 단계입니다.');window.dispatchEvent(new CustomEvent('fw:beta-lab:changed',{detail:{id,enabled:input.checked}}));});label.append(caption,input);const info=document.createElement('small');info.textContent='ALPHA · 플래그만 지원';card.append(title,desc,label,info);root.append(card);}}
function status(message){document.getElementById('status').textContent=message;}
document.getElementById('reset').addEventListener('click',()=>{if(!ready)return;if(!confirm('이 계정의 이 기기에서 모든 실험을 끌까요? 기존 플레이 데이터는 유지됩니다.'))return;if(save({})){render();status('모든 실험 OFF · 기존 플레이 데이터 유지');window.dispatchEvent(new Event('fw:beta-lab:reset'));}else status('초기화 실패: 저장 공간을 확인해 주세요.');});
async function init(){try{const [{getApps,initializeApp},{getAuth,onAuthStateChanged}]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')]);const app=getApps().find(x=>x.name==='[DEFAULT]')||initializeApp({apiKey:'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',authDomain:'formwheel.firebaseapp.com',projectId:'formwheel',appId:'1:431583088241:web:74e0e34ea1e3e1170c55d0'});onAuthStateChanged(getAuth(app),user=>{account=user?'uid:'+user.uid:'guest';ready=true;document.getElementById('identity').textContent=user?'로그인 계정별 이 기기 저장':'비로그인 · 이 브라우저 저장';render();},()=>{ready=false;status('인증 확인 실패: 계정 설정 변경을 막았습니다.');render();});}catch{ready=false;status('인증 모듈을 불러오지 못했습니다. 안전을 위해 설정 변경을 차단했습니다.');render();}}
render();init();
