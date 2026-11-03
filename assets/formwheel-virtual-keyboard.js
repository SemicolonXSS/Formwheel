(()=>{'use strict';if(window.__fwVirtualKeyboard)return;window.__fwVirtualKeyboard=true;
const style=document.createElement('style');style.textContent=`
#fw-vk-toggle{display:none;align-items:center;justify-content:center;margin-left:6px;padding:7px;border:1px solid #9989bb;border-radius:9px;background:#f1eaff;color:#322454;font-size:19px;cursor:pointer;flex-shrink:0}
#fw-vk{display:none;position:fixed;z-index:2147482998;left:6px;right:6px;bottom:calc(6px + env(safe-area-inset-bottom));background:#211b32;color:#fff;border:1px solid #776b95;border-radius:15px;padding:9px;box-shadow:0 5px 35px #0009;max-height:53dvh;overflow:auto;touch-action:pan-y}
#fw-vk.fw-open{display:block}
#fw-vk .fw-vk-row{display:flex;gap:4px;margin:4px 0;justify-content:center}
#fw-vk button{flex:1;min-width:0;padding:10px 1px;background:#3b3352;color:white;border:1px solid #635979;border-radius:6px;font:600 12px system-ui;touch-action:manipulation}
#fw-vk button[aria-pressed=true]{background:#9573e8;color:#100a21}
#fw-vk .fw-vk-title{display:flex;align-items:center;justify-content:space-between;font:600 13px system-ui}
@media(hover:none) and (pointer:coarse){#fw-vk-toggle{display:inline-flex}}
@media(min-width:850px) and (hover:hover) and (pointer:fine){#fw-vk-toggle,#fw-vk{display:none!important}}
`;document.head.append(style);
const logo=document.querySelector('.fw-hub-logo');if(!logo)return;
const toggle=document.createElement('button');toggle.type='button';toggle.id='fw-vk-toggle';toggle.textContent='⌨';toggle.title='가상 단축키 키보드';toggle.setAttribute('aria-label','가상 키보드 열기');toggle.setAttribute('aria-expanded','false');logo.insertAdjacentElement('afterend',toggle);
const panel=document.createElement('section');panel.id='fw-vk';panel.setAttribute('aria-label','Formwheel 가상 키보드');panel.innerHTML='<div class="fw-vk-title"><span>⌨ Formwheel 단축키</span><button type="button" data-close="1" style="flex:none;padding:5px 12px">✕</button></div>';document.body.append(panel);
let modifiers={Control:false,Shift:false,Alt:false};let lastFocus=null;
const rows=[['Ctrl','Shift','Alt','F12','Esc'],['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M','/',';'],['↑','←','↓','→','Enter','Space','Backspace']];
const map={'Ctrl':'Control','Esc':'Escape','↑':'ArrowUp','↓':'ArrowDown','←':'ArrowLeft','→':'ArrowRight','Space':' ','Enter':'Enter','Backspace':'Backspace'};
const buttons=[];
for(const row of rows){const div=document.createElement('div');div.className='fw-vk-row';for(const name of row){const btn=document.createElement('button');btn.type='button';btn.textContent=name;btn.dataset.key=name;btn.addEventListener('pointerdown',e=>e.preventDefault());btn.addEventListener('click',()=>press(name));div.append(btn);buttons.push(btn)}panel.append(div)}
function update(){buttons.forEach(b=>{const key=map[b.dataset.key]||b.dataset.key;b.setAttribute('aria-pressed',String(!!modifiers[key]))})}
function show(on){panel.classList.toggle('fw-open',on);toggle.setAttribute('aria-expanded',String(on));if(on){const active=document.activeElement;if(active!==toggle&&active!==document.body)lastFocus=active} else {modifiers={Control:false,Shift:false,Alt:false};update()}}
toggle.addEventListener('click',()=>show(!panel.classList.contains('fw-open')));panel.querySelector('[data-close]').onclick=()=>show(false);
function press(label){const key=map[label]||label;if(key in modifiers){modifiers[key]=!modifiers[key];update();return}
if(key==='F12'){window.FormwheelDevTools?.toggle?.();return}
const target=lastFocus?.isConnected?lastFocus:document.body;
const options={key:key.length===1&&!modifiers.Shift?key.toLowerCase():key,code:key===' '? 'Space':key==='/'?'Slash':key===';'?'Semicolon':key.length===1?'Key'+key.toUpperCase():key,bubbles:true,cancelable:true,ctrlKey:modifiers.Control,shiftKey:modifiers.Shift,altKey:modifiers.Alt};
const event=new KeyboardEvent('keydown',options);target.dispatchEvent(event);
if(!event.defaultPrevented&&target instanceof HTMLInputElement&&!target.readOnly&&!target.disabled){const start=target.selectionStart??target.value.length,end=target.selectionEnd??start;let insert=key==='Backspace'?'':key==='Enter'?'\n':key.length===1?key:null;if(insert!==null){if(key==='Backspace'){target.setRangeText('',Math.max(0,start-1),end,'end')}else if(key!=='Enter'||target.type==='text'){if(key!=='Enter')target.setRangeText(insert,start,end,'end')}target.dispatchEvent(new Event('input',{bubbles:true}))}}
target.dispatchEvent(new KeyboardEvent('keyup',options));
modifiers={Control:false,Shift:false,Alt:false};update()}
})();