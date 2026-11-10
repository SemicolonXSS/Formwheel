/* Formwheel deployment dashboard. Public GitHub metadata; account-gated UI, not an authorization boundary. */
(async () => {
  'use strict';
  const host = document.getElementById('fw-deploy-status');
  if (!host) return;
  const {getApps} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const {getAuth,onAuthStateChanged,getIdTokenResult} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const app = getApps().find(x=>x.name==='[DEFAULT]');
  if (!app) return;
  const auth = getAuth(app);
  const box = document.createElement('div');
  const info = document.createElement('small');
  info.textContent='GitHub 공개 Actions 기록 · 표시 시간은 실행 완료 시각 기준이며 실제 사이트 반영과 다를 수 있습니다.';
  const refresh = document.createElement('button');
  refresh.type='button'; refresh.textContent='↻ 새로고침';
  refresh.style.cssText='padding:9px 12px;border-radius:9px;cursor:pointer;margin:8px 0';
  const message = document.createElement('p');
  message.setAttribute('role','status');
  host.append(info,refresh,message,box);
  const repos=['Formwheel','Formwheel_Clicker','Formwheel_Paint','Formwheel_Whiteboard','Formwheel_Maze','Formwheel_Reflex'];
  const workflows=[{name:'Pages',id:'pages-build-deployment'},{name:'건강검진',id:'automation-healthcheck.yml'},{name:'방문자',id:'visitor-count-sync.yml'}];
  let allowed=false, busy=false, generation=0;
  const ago = iso => {
    const n=Date.parse(iso);
    if(!Number.isFinite(n))return '시각 미확인';
    const minutes=Math.max(0,Math.floor((Date.now()-n)/60000));
    return minutes<1?'방금':minutes<60?minutes+'분 전':minutes<1440?Math.floor(minutes/60)+'시간 전':Math.floor(minutes/1440)+'일 전';
  };
  const outcome = run => !run?'기록 없음':run.status!=='completed'?'진행 중':({success:'성공',failure:'실패',cancelled:'취소',timed_out:'시간 초과'})[run.conclusion]||'완료';
  async function load(){
    if(!allowed||busy)return;
    busy=true;refresh.disabled=true;
    const ticket=generation;
    box.replaceChildren();message.textContent='배포 기록 확인 중…';
    for(const repo of repos){
      if(ticket!==generation)break;
      const group=document.createElement('section');
      group.style.cssText='border:1px solid #dce2ee;border-radius:12px;padding:12px;margin:8px 0';
      const heading=document.createElement('strong');heading.textContent=repo;
      group.append(heading);box.append(group);
      // Workflow discovery uses the public API; missing workflows are simply omitted.
      for(const wf of workflows){
        if(ticket!==generation)break;
        try{
          const url='https://api.github.com/repos/SemicolonXSS/'+encodeURIComponent(repo)+'/actions/workflows/'+encodeURIComponent(wf.id)+'/runs?per_page=1';
          const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
          if(response.status===404)continue;
          if(!response.ok)throw Error('HTTP '+response.status);
          const run=(await response.json()).workflow_runs?.[0];
          if(!run)continue;
          const line=document.createElement('div');
          line.style.cssText='padding:7px 0;overflow-wrap:anywhere';
          const label=document.createElement('span');
          label.textContent=wf.name+' · '+outcome(run)+' · '+ago(run.updated_at||run.created_at);
          line.append(label);
          if(/^https:\/\/github\.com\/SemicolonXSS\/[^/]+\/actions\/runs\/\d+$/.test(run.html_url||'')){
            const link=document.createElement('a');link.href=run.html_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=' · 상세';line.append(link);
          }
          group.append(line);
        }catch(e){
          const error=document.createElement('small');error.textContent=wf.name+' 조회 불가 ('+e.message+')';group.append(error);
        }
      }
      if(group.childElementCount===1){
        const empty=document.createElement('small');empty.textContent='공개 실행 기록 없음';group.append(empty);
      }
    }
    if(ticket===generation)message.textContent='조회 완료 · '+new Date().toLocaleTimeString();
    busy=false;refresh.disabled=false;
  }
  refresh.addEventListener('click',load);
  onAuthStateChanged(auth,async user=>{
    const ticket=++generation;
    allowed=false;box.replaceChildren();host.hidden=true;
    if(!user||user.isAnonymous)return;
    try{
      const token=await getIdTokenResult(user);
      if(ticket!==generation)return;
      // Server-issued custom claims, never a user-editable email or localStorage flag.
      allowed=token.claims.admin===true||token.claims.producer===true;
      host.hidden=!allowed;
      if(allowed){message.textContent='고급 탭에서 상태를 확인하세요.';if(document.querySelector('[data-fw21="advanced"][aria-selected="true"]'))load();}
    }catch(e){if(ticket===generation)console.warn('Deployment status authorization unavailable',e.code||e.message);}
  });
  document.querySelector('[data-fw21="advanced"]')?.addEventListener('click',()=>{if(allowed)load()});
})();
