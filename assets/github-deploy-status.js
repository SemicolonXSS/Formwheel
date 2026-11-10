/* Public GitHub Actions status. Read-only; never use access tokens in the browser. */
(() => {
  'use strict';
  const host = document.getElementById('fw-deploy-status');
  if (!host) return;
  const workflows = [
    {name:'Pages 배포', file:'pages-build-deployment'},
    {name:'자동화 건강검진', file:'automation-healthcheck.yml'},
    {name:'방문자 집계', file:'visitor-count-sync.yml'}
  ];
  const endpoint = 'https://api.github.com/repos/SemicolonXSS/Formwheel/actions/workflows/';
  const box = document.createElement('div');
  box.style.cssText='display:grid;gap:9px;margin:10px 0';
  const info = document.createElement('small');
  info.textContent='공개 GitHub Actions 실행 결과 · 인증 토큰 없이 조회 · 배포 완료와 실제 사이트 반영은 다를 수 있습니다.';
  const refresh = document.createElement('button');
  refresh.type='button';refresh.textContent='↻ 상태 새로고침';
  refresh.style.cssText='padding:9px 12px;border-radius:9px;cursor:pointer';
  host.append(info,refresh,box);
  let busy=false;
  const statusText = run => {
    if (!run) return '실행 내역 없음';
    if (run.status !== 'completed') return '진행 중 (' + run.status + ')';
    return ({success:'성공',failure:'실패',cancelled:'취소',timed_out:'시간 초과',skipped:'건너뜀'})[run.conclusion] || '완료 ('+(run.conclusion||'결과 없음')+')';
  };
  async function update(){
    if(busy)return;
    busy=true;refresh.disabled=true;
    box.replaceChildren();
    await Promise.all(workflows.map(async item=>{
      const line=document.createElement('div');
      line.style.cssText='padding:10px;border:1px solid #dce2ee;border-radius:10px;overflow-wrap:anywhere';
      const name=document.createElement('strong');name.textContent=item.name+' · ';
      const value=document.createElement('span');value.textContent='확인 중…';
      line.append(name,value);box.append(line);
      try{
        const response=await fetch(endpoint+encodeURIComponent(item.file)+'/runs?per_page=1',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
        if(!response.ok)throw Error('HTTP '+response.status);
        const data=await response.json();
        const run=data.workflow_runs?.[0];
        value.textContent=statusText(run);
        if(run?.html_url && /^https:\/\/github\.com\/SemicolonXSS\/Formwheel\/actions\/runs\/\d+$/.test(run.html_url)){
          const link=document.createElement('a');link.href=run.html_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=' · 실행 기록';line.append(link);
        }
        if(run?.updated_at){
          const date=document.createElement('small');date.style.display='block';date.textContent='마지막 업데이트: '+new Date(run.updated_at).toLocaleString();line.append(date);
        }
      }catch(e){value.textContent='조회 불가 ('+(e.message||'네트워크 오류')+')';}
    }));
    refresh.disabled=false;busy=false;
  }
  refresh.addEventListener('click',update);
  let loaded=false;
  document.querySelector('[data-fw21="advanced"]')?.addEventListener('click',()=>{if(!loaded){loaded=true;update()}});
})();
