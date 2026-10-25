import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,get} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
const app=getApps()[0]||initializeApp({apiKey:'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',authDomain:'formwheel.firebaseapp.com',databaseURL:'https://formwheel-default-rtdb.firebaseio.com',projectId:'formwheel',appId:'1:431583088241:web:74e0e34ea1e3e1170c55d0'});
const auth=getAuth(app),db=getDatabase(app),$=id=>document.getElementById(id);
async function load(){
 $('find10-admin-status').textContent='통계 조회 중…';$('find10-dashboard').hidden=true;
 try{
 const snapshot=await get(ref(db,'formwheelFeedback/items'));
 const groups=new Map();
 snapshot.forEach(child=>{
  const item=child.val();if(typeof item?.subject!=='string'||!item.subject.startsWith('[10초 챌린지] '))return;
  const target=item.subject.slice('[10초 챌린지] '.length).trim();
  const body=String(item.body||'');
  const state=body.match(/결과: (성공|시간 초과|다른 프로젝트 선택)/)?.[1];
  const seconds=Number(body.match(/소요 시간: ([\d.]+)초/)?.[1]);
  if(!target||!state||!Number.isFinite(seconds)||seconds<0||seconds>86400)return;
  const selected=body.match(/선택한 프로젝트: ([^\n]+)/)?.[1]?.trim()||'';
  const g=groups.get(target)||{n:0,wins:0,seconds:0,timeouts:0,confusions:new Map()};
  if(state!=='성공'&&selected&&selected!=='미기록'&&selected!==target)g.confusions.set(selected,(g.confusions.get(selected)||0)+1);
  g.n++;g.wins+=Number(state==='성공');g.timeouts+=Number(state==='시간 초과');g.seconds+=seconds;groups.set(target,g);
 });
 let total=0,success=0,sum=0;
 const tbody=$('find10-stats');tbody.replaceChildren();
 for(const [target,g] of [...groups].sort((a,b)=>b[1].n-a[1].n)){
  total+=g.n;success+=g.wins;sum+=g.seconds;
  const tr=document.createElement('tr');
  for(const value of [target,String(g.n),(100*g.wins/g.n).toFixed(1)+'%',(g.seconds/g.n).toFixed(2)+'초',String(g.timeouts),[...g.confusions].sort((a,b)=>b[1]-a[1]).map(([name,n])=>name+' ('+n+')').join(', ')||'—']){
   const td=document.createElement('td');td.textContent=value;tr.append(td)
  }tbody.append(tr);
 }
 $('find10-summary').textContent=total?'전체 '+total+'회 · 성공률 '+(100*success/total).toFixed(1)+'% · 평균 '+(sum/total).toFixed(2)+'초':'아직 저장된 10초 챌린지 기록이 없어요.';
 $('find10-dashboard').hidden=false;$('find10-reload').hidden=false;$('find10-admin-status').textContent='조회 완료';
 }catch(e){$('find10-admin-status').textContent='조회 실패: '+(e.code||e.message||'권한/연결 오류')+'. Firebase에서 운영자 조회 권한을 확인해 주세요.'}
}
$('find10-login').addEventListener('click',async()=>{
 $('find10-admin-status').textContent='로그인 중…';
 try{await signInWithPopup(auth,new GoogleAuthProvider());await load()}catch(e){$('find10-admin-status').textContent='로그인/조회 실패: '+(e.code||e.message)}
});
$('find10-reload').addEventListener('click',load);
