/* Formwheel deployment dashboard. Public GitHub metadata; account-gated UI, not an authorization boundary. */
(async () => {
  'use strict';
  const host = document.getElementById('fw-deploy-status');
  if (!host) return;
  const {getApps} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const {getAuth,onAuthStateChanged,getIdTokenResult} = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  // Deferred classic scripts can run before the hub's Firebase module initializes.
  let app = getApps().find(x=>x.name==='[DEFAULT]');
  for(let attempt=0;!app&&attempt<40;attempt++){
    await new Promise(resolve=>setTimeout(resolve,150));
    app=getApps().find(x=>x.name==='[DEFAULT]');
  }
  if (!app) { host.hidden=true; return; }
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
        // On-demand file history: no repository contents or credentials are modified.
        const fileTools=document.createElement('div');
        fileTools.style.cssText='margin:10px 0;padding:9px;border:1px solid #e5e7eb;border-radius:9px';
        const fileLabel=document.createElement('label');
        fileLabel.textContent='파일별 수정·배포 추적';
        fileLabel.style.cssText='display:block;font-weight:600;margin-bottom:6px';
        const fileInput=document.createElement('input');
        fileInput.type='text';fileInput.placeholder='예: index.html 또는 assets/id-core.js';
        fileInput.setAttribute('aria-label',repo.name+' 파일 경로');
        fileInput.style.cssText='box-sizing:border-box;width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:8px';
        const fileButton=document.createElement('button');
        fileButton.type='button';fileButton.textContent='파일 기록 확인';
        fileButton.style.cssText='margin-top:7px;padding:8px 11px;border-radius:8px;cursor:pointer';
        const fileResult=document.createElement('div');
        fileResult.setAttribute('role','status');
        fileResult.style.cssText='margin-top:8px;overflow-wrap:anywhere';
        fileTools.append(fileLabel,fileInput,fileButton,fileResult);
        group.append(fileTools);
        fileButton.addEventListener('click',async()=>{
          const path=fileInput.value.trim();
          if(!path||path.length>300||path.startsWith('/')||path.includes('..')||/[?#\\\\]/.test(path)){
            fileResult.textContent='저장소 기준 상대 경로를 입력해 주세요 (예: assets/app.js).';return;
          }
          fileButton.disabled=true;fileResult.replaceChildren();
          fileResult.textContent='파일 수정 기록 조회 중…';
          try{
            const commits=await fetchJson(api+'/repos/'+owner+'/'+encodeURIComponent(repo.name)+'/commits?path='+encodeURIComponent(path)+'&per_page=1');
            if(ticket!==generation||!allowed)return;
            if(!commits.length){fileResult.textContent='해당 경로의 공개 커밋 기록을 찾지 못했어요.';return;}
            const commit=commits[0];
            const sha=commit.sha;
            const when=commit.commit?.committer?.date||commit.commit?.author?.date;
            fileResult.replaceChildren();
            const headline=document.createElement('p');
            headline.textContent='마지막 파일 수정: '+ago(when)+' · '+sha.slice(0,7);
            fileResult.append(headline);
            const commitLink=document.createElement('a');
            commitLink.href='https://github.com/'+owner+'/'+encodeURIComponent(repo.name)+'/commit/'+sha;
            commitLink.target='_blank';commitLink.rel='noopener noreferrer';
            commitLink.textContent='수정 커밋 확인';
            fileResult.append(commitLink);
            const check=document.createElement('p');
            check.textContent='이 커밋의 Actions 기록 확인 중…';fileResult.append(check);
            try{
              const runs=await fetchJson(api+'/repos/'+owner+'/'+encodeURIComponent(repo.name)+'/actions/runs?head_sha='+encodeURIComponent(sha)+'&per_page=30');
              if(ticket!==generation||!allowed)return;
              const matching=(runs.workflow_runs||[]).filter(r=>r.head_sha===sha);
              if(!matching.length){
                check.textContent='이 커밋에 연결된 Actions 실행 기록 없음 · 파일 배포 여부 미확인';
              }else{
                const succeeded=matching.filter(r=>r.conclusion==='success');
                check.textContent='관련 Actions '+matching.length+'건 · 성공 '+succeeded.length+'건 · 파일의 실제 사이트 반영은 별도 확인 필요';
                for(const run of matching.slice(0,5)){
                  const line=document.createElement('div');
                  line.textContent=(run.name||'Workflow')+' · '+outcome(run)+' · '+ago(run.updated_at||run.created_at);
                  fileResult.append(line);
                }
              }
            }catch(error){check.textContent='커밋은 확인됨 · Actions 상태 조회 실패 ('+error.message+')';}
          }catch(error){fileResult.textContent='파일 기록 조회 실패 ('+error.message+')';}
          finally{fileButton.disabled=false;}
        });
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
