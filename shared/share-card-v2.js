/* Formwheel Share Card v2 — self-contained, opt-in, no database writes. */
(()=>{'use strict';if(window.__fwShareCardV2)return;window.__fwShareCardV2=true;
function init(){if(document.getElementById('fw-share-v2'))return;
const root=document.createElement('div');root.id='fw-share-v2';document.body.appendChild(root);const sh=root.attachShadow({mode:'open'});
sh.innerHTML=`<style>
*{box-sizing:border-box}button,a{font:inherit}button{cursor:pointer}
.launch{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));z-index:2147483000;border:1px solid #f3c7ff80;border-radius:999px;padding:13px 19px;background:linear-gradient(115deg,#7945f5,#b35ce3);color:white;box-shadow:0 9px 27px #170e4099;font:800 14px/1.2 system-ui,sans-serif;min-height:46px}
.launch:hover{filter:brightness(1.13);transform:translateY(-2px)}
.backdrop{position:fixed;inset:0;background:#09051bb8;z-index:2147483001;display:none;align-items:center;justify-content:center;padding:16px;font:15px/1.5 system-ui,sans-serif;color:#f9f7ff}
.backdrop.open{display:flex}.panel{position:relative;width:min(100%,430px);max-height:min(92vh,780px);overflow:auto;background:linear-gradient(150deg,#30204f,#141126 72%);border:1px solid #8165ae;border-radius:24px;box-shadow:0 30px 90px #05020bcc;padding:23px}
.close{position:absolute;top:13px;right:13px;border:0;background:#ffffff1c;color:white;border-radius:50%;width:36px;height:36px;font-size:20px}
.eyebrow{font-size:11px;letter-spacing:.16em;color:#c5b0ff;font-weight:900}.title{font-size:25px;font-weight:900;letter-spacing:-.04em;margin:7px 35px 6px 0}
.desc{color:#c9bfde;margin:0 0 14px}.preview{padding:20px;border-radius:18px;background:radial-gradient(circle at 95% 10%,#aa62ff88,transparent 52%),linear-gradient(135deg,#5a31b8,#2b1b58);border:1px solid #ab83ff;color:#fff}
.brand{font-weight:900;font-size:12px;letter-spacing:.12em;color:#ffcf7c}.game{font-size:clamp(22px,6vw,31px);font-weight:900;margin:14px 0 4px;overflow-wrap:anywhere}.tag{font-size:13px;color:#e5d9ff}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:15px}.action{border:1px solid #8269a6;border-radius:12px;padding:12px 9px;min-height:46px;color:white;background:#3a2b60;font-weight:800}.action.primary{background:#ffc46e;border-color:#ffc46e;color:#241431}
.action.wide{grid-column:1/-1}.status{min-height:20px;font-size:13px;color:#ffe4a9;margin:12px 0 0;overflow-wrap:anywhere}
a{color:#e6c8ff}.foot{font-size:12px;color:#c3b7d8;margin:14px 0 0}
button:focus-visible,a:focus-visible{outline:3px solid #ffd67c;outline-offset:3px}
@media(prefers-reduced-motion:reduce){.launch{transition:none}.launch:hover{transform:none}}
</style>
<button class="launch" type="button" aria-haspopup="dialog" aria-expanded="false">↗ 공유 카드</button>
<div class="backdrop"><section class="panel" role="dialog" aria-modal="true" aria-labelledby="fw-share-title"><button class="close" type="button" aria-label="닫기">×</button><div class="eyebrow">FORMWHEEL · SHARE</div><div id="fw-share-title" class="title">친구에게 도전장 보내기</div><p class="desc">게임을 공유하고 같이 플레이해 보세요.</p><div class="preview"><div class="brand">🎡 FORMWHEEL</div><div class="game"></div><div class="tag">PLAY · CHALLENGE · SHARE</div></div><div class="actions"><button class="action primary" id="native" type="button">📤 공유하기</button><button class="action" id="copy" type="button">🔗 링크 복사</button><button class="action" id="png" type="button">🖼️ 카드 저장</button><a class="action" id="custom" target="_blank" rel="noopener" style="text-align:center;text-decoration:none" href="https://semicolonxss.github.io/Formwheel/promotion.html">✨ 카드 꾸미기</a></div><p class="status" role="status" aria-live="polite"></p><p class="foot">선택한 경우에만 공유됩니다. 로그인이나 기록 제출은 필요하지 않아요.</p></section></div>`;
const $=s=>sh.querySelector(s),launch=$('.launch'),back=$('.backdrop'),close=$('.close'),status=$('.status');
const raw=(document.querySelector('h1')?.textContent||document.title||'Formwheel Game').trim().replace(/\s+/g,' ').slice(0,60);
const game=raw||'Formwheel Game';$('.game').textContent=game;
let result='';let manualResult=null;
function currentResult(){
const explicit=document.querySelector('[data-fw-share-result]');
const rawValue=explicit?.getAttribute('data-fw-share-result')||((location.pathname.toLowerCase().includes('clicker')||location.hostname.toLowerCase().includes('formwheel_clicker'))?document.getElementById('score')?.textContent:'')||'';
const value=String(rawValue).trim().slice(0,35);
return value&&/^[\p{L}\p{N}.,+%: _-]+$/u.test(value)?value:'';
}
function refreshResult(){result=manualResult===null?currentResult():manualResult;$('.tag').textContent=result?'MY RESULT · '+result:'PLAY · CHALLENGE · SHARE'}
refreshResult();
window.FormwheelShare={setResult(value){const v=String(value??'').trim().slice(0,35);manualResult=v;result=v;$('.tag').textContent=v?'MY RESULT · '+v:'PLAY · CHALLENGE · SHARE'},open(){show()}};

const url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('utm_source','game_share');url.searchParams.set('utm_medium','friend');const link=url.href;
const landing=new URL('https://semicolonxss.github.io/Formwheel/promotion.html');landing.searchParams.set('game_url',location.origin+location.pathname);landing.searchParams.set('game_name',game);$('#custom').href=landing.href;
let previous=null;function hide(){back.classList.remove('open');launch.setAttribute('aria-expanded','false');(previous&&previous.isConnected?previous:launch).focus()}function show(){refreshResult();previous=document.activeElement;back.classList.add('open');launch.setAttribute('aria-expanded','true');close.focus()}
launch.onclick=show;close.onclick=hide;back.addEventListener('click',e=>{if(e.target===back)hide()});sh.addEventListener('keydown',e=>{if(e.key==='Escape'&&back.classList.contains('open'))hide();if(e.key==='Tab'&&back.classList.contains('open')){const focus=[close,$('#native'),$('#copy'),$('#png'),$('#custom')];const i=focus.indexOf(sh.activeElement);if(e.shiftKey&&i===0){e.preventDefault();focus.at(-1).focus()}else if(!e.shiftKey&&i===focus.length-1){e.preventDefault();focus[0].focus()}}});
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(link);status.textContent='링크를 복사했어요!'}catch{status.textContent='복사할 주소: '+link}};
$('#native').onclick=async()=>{try{if(navigator.share){await navigator.share({title:game,text:'🎮 '+game+(result?' · 기록 '+result:'')+' — 같이 도전해 봐!',url:link});status.textContent='공유 메뉴를 열었어요.'}else $('#copy').click()}catch(e){if(e.name!=='AbortError')status.textContent='공유할 수 없어요. 링크 복사를 이용해 주세요.'}};
$('#png').onclick=()=>{try{const c=document.createElement('canvas');c.width=1080;c.height=675;const ctx=c.getContext('2d');if(!ctx)throw Error('canvas');const bg=ctx.createLinearGradient(0,0,1080,675);bg.addColorStop(0,'#7546df');bg.addColorStop(1,'#191133');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,675);ctx.fillStyle='#ffd18a';ctx.font='bold 34px system-ui';ctx.fillText('🎡 FORMWHEEL',68,105);ctx.fillStyle='#ffffff';ctx.font='bold 64px system-ui';let line='';let y=285;for(const word of game.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>930&&line){ctx.fillText(line,68,y);y+=82;line=word}else line=next}ctx.fillText(line.slice(0,55),68,y);ctx.font='28px system-ui';ctx.fillStyle='#e4d4ff';ctx.fillText(result?'MY RESULT · '+result:'PLAY · CHALLENGE · SHARE',68,Math.min(y+90,520));ctx.font='24px system-ui';ctx.fillStyle='#ffd18a';ctx.fillText((location.hostname+location.pathname).slice(0,65),68,612);const a=document.createElement('a');a.download='formwheel-share-card.png';a.href=c.toDataURL('image/png');a.click();status.textContent='공유 카드 이미지를 저장했어요.'}catch{status.textContent='이미지 저장에 실패했어요.'}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();