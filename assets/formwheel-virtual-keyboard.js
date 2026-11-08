(()=>{'use strict';if(window.__fwShortcutPad)return;window.__fwShortcutPad=true;
const css=document.createElement('style');css.textContent=`
#fw-vk-toggle{display:none;align-items:center;justify-content:center;margin-left:6px;padding:7px;border:1px solid #9989bb;border-radius:9px;background:#f1eaff;color:#322454;font-size:19px;cursor:pointer;flex-shrink:0}
#fw-vk{display:none;position:fixed;z-index:2147482998;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));background:#211b32;color:white;border:1px solid #776b95;border-radius:15px;padding:12px;box-shadow:0 5px 35px #0009;max-height:65dvh;overflow:auto}
#fw-vk.fw-open{display:block}
#fw-vk .fw-vk-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;font:700 14px system-ui}
#fw-vk .fw-vk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#fw-vk button{background:#3b3352;color:white;border:1px solid #635979;border-radius:9px;padding:11px 7px;cursor:pointer;font:600 13px system-ui}
#fw-vk .fw-vk-grid button{display:flex;flex-direction:column;gap:5px;align-items:center}
#fw-vk .fw-vk-grid small{font:12px system-ui;color:#d7cdec}
#fw-vk .fw-vk-close{padding:6px 12px}
@media(hover:none) and (pointer:coarse){#fw-vk-toggle{display:inline-flex}}
@media(min-width:850px) and (hover:hover) and (pointer:fine){#fw-vk-toggle,#fw-vk{display:none!important}}
`;document.head.append(css);
const logo=document.querySelector('.fw-hub-logo');if(!logo)return;
const toggle=document.createElement('button');toggle.type='button';toggle.id='fw-vk-toggle';toggle.textContent='⌨';toggle.setAttribute('aria-label','단축키 패널 열기');toggle.setAttribute('aria-expanded','false');logo.insertAdjacentElement('afterend',toggle);
function placeToggle(){const bar=document.getElementById('fw-beta-switch');if(document.body.classList.contains('fw-beta-simple')&&bar)bar.append(toggle);else logo.insertAdjacentElement('afterend',toggle);}
window.addEventListener('fw-hub-display-changed',placeToggle);
if(document.readyState==='loading'||document.readyState==='interactive')document.addEventListener('DOMContentLoaded',placeToggle,{once:true});else placeToggle();
const panel=document.createElement('section');panel.id='fw-vk';panel.setAttribute('aria-label','Formwheel 단축키 모음');
const title=document.createElement('div');title.className='fw-vk-title';const heading=document.createElement('span');heading.textContent='⌨ Formwheel 단축키';const close=document.createElement('button');close.className='fw-vk-close';close.textContent='✕';close.setAttribute('aria-label','닫기');title.append(heading,close);panel.append(title);
const grid=document.createElement('div');grid.className='fw-vk-grid';panel.append(grid);document.body.append(panel);
function show(on){panel.classList.toggle('fw-open',on);toggle.setAttribute('aria-expanded',String(on))}
toggle.onclick=()=>show(!panel.classList.contains('fw-open'));close.onclick=()=>show(false);
function send(key,options={}){const event=new KeyboardEvent('keydown',{key,code:options.code||key,bubbles:true,cancelable:true,ctrlKey:!!options.ctrlKey,shiftKey:!!options.shiftKey});document.dispatchEvent(event);document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true,ctrlKey:!!options.ctrlKey,shiftKey:!!options.shiftKey}));return event.defaultPrevented}
const actions=[
{key:'F12',name:'개발자 도구',run:()=>window.FormwheelDevTools?.toggle?.()},
{key:'Ctrl + /',name:'단축키 목록',run:()=>send('/',{code:'Slash',ctrlKey:true})},
{key:'↑',name:'맨 위로',run:()=>{if(!send('ArrowUp'))window.scrollTo({top:0,behavior:'smooth'})}},
{key:'↓',name:'카드 아래로',run:()=>{if(!send('ArrowDown')){const el=document.querySelector('#projects');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}}},
{key:';',name:'내 지정 기능',run:()=>send(';',{code:'Semicolon'})},
{key:'Esc',name:'패널 닫기',run:()=>{send('Escape');show(false)}}
];
actions.forEach(action=>{const button=document.createElement('button');button.type='button';const key=document.createElement('strong');key.textContent=action.key;const desc=document.createElement('small');desc.textContent=action.name;button.append(key,desc);button.onclick=()=>{action.run();if(action.key!=='Esc')show(false)};grid.append(button)});
})();