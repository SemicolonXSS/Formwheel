/* Formwheel Hub Quick Launcher v1 — UI-only; no Firebase or game-data writes. */
(() => {
  'use strict';
  function init() {
    const search = document.getElementById('search');
    const projectsSection = document.getElementById('projects');
    if (!search || !projectsSection || document.getElementById('fw-command-open')) return;
    const css = document.createElement('style');
    css.textContent = `
      .fw-command-open{border:1px solid #a7b5e6;background:#f1f4ff;color:#293d86;border-radius:10px;padding:9px 12px;font:inherit;font-size:12px;font-weight:750;cursor:pointer;white-space:nowrap}
      .fw-command-open:hover,.fw-command-open:focus-visible{background:#e4eafe;outline-offset:2px}
      .fw-command-backdrop[hidden]{display:none!important}
      .fw-command-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.58);display:flex;align-items:flex-start;justify-content:center;padding:clamp(20px,12vh,110px) 12px 20px;box-sizing:border-box}
      .fw-command-panel{background:#fff;color:#17233b;width:min(580px,100%);max-height:min(75vh,650px);display:flex;flex-direction:column;border-radius:18px;box-shadow:0 24px 90px #0005;overflow:hidden}
      .fw-command-header{padding:17px 18px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px}
      .fw-command-header strong{font-size:17px}
      .fw-command-close{background:transparent;border:0;border-radius:9px;font-size:23px;cursor:pointer;color:#64748b}
      .fw-command-search{margin:0 14px 10px;padding:12px 14px;border:1px solid #b6c4e1;border-radius:11px;font:inherit;font-size:15px;outline-offset:2px;background:#fff;color:#17233b}
      .fw-command-results{overflow:auto;min-height:45px;padding:0 9px 12px}
      .fw-command-result{width:100%;display:flex;align-items:center;gap:11px;padding:11px 12px;margin:2px 0;border:1px solid transparent;border-radius:10px;background:transparent;text-align:left;color:#25334f;cursor:pointer;font:inherit}
      .fw-command-result[aria-selected="true"],.fw-command-result:hover{background:#edf2ff;border-color:#cdd9fb}
      .fw-command-result span{min-width:0;flex:1}
      .fw-command-result strong{display:block;font-size:13px}
      .fw-command-result small{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#5d697f;font-size:11px}
      .fw-command-footer{padding:9px 15px;border-top:1px solid #e6ebf3;font-size:11px;color:#59667c}
      @media(max-width:480px){.fw-command-panel{max-height:80vh}.fw-command-open{padding:9px 10px}}
    `;
    document.head.append(css);
    const openButton = document.createElement('button');
    openButton.id = 'fw-command-open';
    openButton.type = 'button';
    openButton.className = 'fw-command-open';
    openButton.textContent = '⌘ 빠른 실행';
    openButton.title = 'Ctrl+K로 프로젝트 및 허브 기능 찾기';
    openButton.setAttribute('aria-haspopup','dialog');openButton.setAttribute('aria-expanded','false');
    const toolbar = document.getElementById('fw-beta-switch') || search.closest('.toolbar');
    if (toolbar) toolbar.append(openButton);
    else search.insertAdjacentElement('afterend', openButton);
    // The display switch may mount on DOMContentLoaded after deferred scripts run.
    if(!document.getElementById('fw-beta-switch'))document.addEventListener('DOMContentLoaded',()=>{document.getElementById('fw-beta-switch')?.append(openButton);},{once:true});

    const backdrop = document.createElement('div');
    backdrop.className = 'fw-command-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="fw-command-panel" role="dialog" aria-modal="true" aria-labelledby="fw-command-title"><div class="fw-command-header"><strong id="fw-command-title">🚀 Formwheel 빠른 실행</strong><button type="button" class="fw-command-close" aria-label="닫기">×</button></div><input class="fw-command-search" type="search" autocomplete="off" aria-label="프로젝트 또는 기능 검색" placeholder="게임 · 도구 · 허브 기능 검색"><div class="fw-command-results" role="listbox" aria-label="빠른 실행 결과"></div><div class="fw-command-footer">↑ ↓ 이동 · Enter 실행 · Esc 닫기 · Ctrl+K 열기</div></section>';
    document.body.append(backdrop);
    const field = backdrop.querySelector('.fw-command-search');
    const results = backdrop.querySelector('.fw-command-results');
    let previousFocus = null, selected = 0, visible = [], previousOverflow = '';
    const closeButton=backdrop.querySelector('.fw-command-close');
    results.id='fw-command-results';field.setAttribute('role','combobox');field.setAttribute('aria-controls',results.id);field.setAttribute('aria-expanded','true');
    function focusCatalog(){
      let input=search;
      if(document.body.classList.contains('fw-beta-simple')){
        document.querySelector('#fw-beta-simple-view button[data-tab="explore"]')?.click();
        input=document.getElementById('fw-b-search')||search;
      }
      input.scrollIntoView({block:'center'});input.focus();
    }
    const fixed = [
      {name:'프로젝트 전체 보기',detail:'허브 프로젝트 목록으로 이동',action:focusCatalog},
      {name:'프로젝트 검색',detail:'기존 검색창에서 필터 검색',action:focusCatalog},
      {name:'설정',detail:'Formwheel 허브 설정 열기',action:()=>{const button=document.getElementById('fw-settings-button');if(button?.getAttribute('aria-expanded')!=='true')button?.click();}},
      {name:'명예의 전당',detail:'업적과 기록',url:'./hall-of-fame.html'},
      {name:'더보기',detail:'Formwheel 서비스 메뉴',url:'./more.html'}
    ];
    function catalog() {
      const list = Array.isArray(typeof projects === 'undefined' ? null : projects) ? projects : [];
      const valid = list.filter(p=>p && typeof p.name==='string' && typeof p.url==='string' && /^https?:\/\//.test(p.url));
      return fixed.concat(valid.map(p=>({name:(p.icon||'🎮')+' '+p.name,detail:p.description||p.category||'',keywords:p.keywords||'',url:p.url})));
    }
    function close() {
      if (backdrop.hidden) return;
      backdrop.hidden = true;
      document.body.style.overflow=previousOverflow;openButton.setAttribute('aria-expanded','false');
      field.value = '';field.removeAttribute('aria-activedescendant');
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
    function run(item) {
      close();
      if (item.action) item.action();
      else if (item.url) window.location.assign(item.url);
    }
    function draw() {
      const q = field.value.trim().toLocaleLowerCase();
      visible = catalog().filter(item=>[item.name,item.detail,item.keywords].some(v=>String(v||'').toLocaleLowerCase().includes(q))).slice(0,24);
      selected = 0;
      results.replaceChildren();
      if (!visible.length) {
        field.removeAttribute('aria-activedescendant');
        const p = document.createElement('p');p.textContent='검색 결과가 없어요. 다른 단어를 입력해 보세요.';p.style.cssText='padding:12px;color:#5d697f;font-size:13px';results.append(p);return;
      }
      visible.forEach((item,i)=>{
        const b=document.createElement('button');b.type='button';b.className='fw-command-result';b.id='fw-command-option-'+i;b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===selected));
        const info=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
        strong.textContent=item.name;small.textContent=item.detail;info.append(strong,small);b.append(info);
        b.addEventListener('click',()=>run(item));b.addEventListener('mouseenter',()=>choose(i));results.append(b);
      });
      field.setAttribute('aria-activedescendant','fw-command-option-0');
    }
    function choose(i) {
      if (!visible.length) return;
      selected=(i+visible.length)%visible.length;
      field.setAttribute('aria-activedescendant','fw-command-option-'+selected);
      results.querySelectorAll('.fw-command-result').forEach((b,j)=>b.setAttribute('aria-selected',String(j===selected)));
      results.querySelectorAll('.fw-command-result')[selected]?.scrollIntoView({block:'nearest'});
    }
    function open() {
      if (!backdrop.hidden) {field.focus();return;}
      previousFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';openButton.setAttribute('aria-expanded','true');backdrop.hidden=false;field.value='';draw();field.focus();
    }
    openButton.addEventListener('click',open);
    backdrop.querySelector('.fw-command-close').addEventListener('click',close);
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
    field.addEventListener('input',draw);
    field.addEventListener('keydown',e=>{
      if(e.isComposing||e.keyCode===229)return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();choose(selected+(e.key==='ArrowDown'?1:-1))}
      else if(e.key==='Enter'&&visible.length){e.preventDefault();run(visible[selected])}
      else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}
    });
    document.addEventListener('keydown',e=>{
      if(e.isComposing||e.keyCode===229)return;
      if(e.key==='Tab'&&!backdrop.hidden){
        const controls=[closeButton,field,...results.querySelectorAll('button')];
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        return;
      }
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(backdrop.hidden)open();else close()}
      else if(e.key==='Escape'&&!backdrop.hidden){e.preventDefault();close()}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
