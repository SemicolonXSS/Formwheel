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
  // Discover repositories dynamically. No hard-coded project limit.
  const owner='SemicolonXSS';
  const api='https://api.github.com';
  async function fetchJson(url){
    const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.json();
  }
  let repos=[];
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
    box.replaceChildren();message.textContent='저장소 목록 확인 중…';
    try{
      // Public repository metadata is sufficient; no GitHub access token is stored.
      const all=[];
      for(let page=1;page<=3;page++){
        const batch=await fetchJson(api+'/users/'+owner+'/repos?per_page=100&page='+page+'&sort=full_name');
        all.push(...batch);
        if(batch.length<100)break;
      }
      if(ticket!==generation)return;
      repos=all.filter(r=>r.name==='FormLab'||r.name==='Formwheel'||r.name.startsWith('Formwheel_'));
      message.textContent=repos.length+'개 프로젝트 연결 · 저장소 업데이트와 실제 배포 시각은 다릅니다.';
      const list=document.createElement('div');list.style.cssText='display:grid;gap:8px';box.append(list);
      for(const repo of repos){
        const group=document.createElement('details');
        group.style.cssText='border:1px solid #dce2ee;border-radius:12px;padding:12px';
        const summary=document.createElement('summary');summary.style.cursor='pointer';
        summary.textContent=repo.name+' · 코드 업데이트 '+ago(repo.pushed_at);
        group.append(summary);list.append(group);
        let loaded=false;
        group.addEventListener('toggle',async()=>{
          if(!group.open||loaded||ticket!==generation||!allowed)return;
          loaded=true;
          const state=document.createElement('p');state.textContent='배포 실행 기록 조회 중…';group.append(state);
          try{
            const data=await fetchJson(api+'/repos/'+owner+'/'+encodeURIComponent(repo.name)+'/actions/runs?per_page=5');
            if(ticket!==generation||!allowed)return;
            const runs=data.workflow_runs||[];
            state.textContent=runs.length?'최근 실행 기록':'공개 Actions 실행 기록 없음';
            for(const run of runs){
              const row=document.createElement('div');row.style.cssText='padding:5px 0;overflow-wrap:anywhere';
              const label=document.createElement('span');
              label.textContent=(run.name||'Workflow')+' · '+outcome(run)+' · '+ago(run.updated_at||run.created_at);
              row.append(label);
              if(/^https:\/\/github\.com\/SemicolonXSS\/[^/]+\/actions\/runs\/\d+$/.test(run.html_url||'')){
                const link=document.createElement('a');link.href=run.html_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=' · 상세';row.append(link);
              }
              group.append(row);
            }
          }catch(error){state.textContent='Actions 조회 불가 ('+error.message+')';}
        });
      }
    }catch(error){if(ticket===generation)message.textContent='저장소 목록 조회 실패 ('+error.message+')';}
    finally{busy=false;refresh.disabled=false;}
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
