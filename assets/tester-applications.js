import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,signInAnonymously,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,push,set,get,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
const app=getApps()[0]||initializeApp({apiKey:'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',authDomain:'formwheel.firebaseapp.com',databaseURL:'https://formwheel-default-rtdb.firebaseio.com',projectId:'formwheel',appId:'1:431583088241:web:74e0e34ea1e3e1170c55d0'});
const auth=getAuth(app),db=getDatabase(app);
const root='formwheelFeedback/items';
const $=id=>document.getElementById(id);
export async function submitTesterApplication(form){
 const user=auth.currentUser||(await signInAnonymously(auth)).user;
 const clean=(v,max)=>String(v||'').slice(0,max).replace(/[<>]/g,'');
 const nickname=clean(form.nickname,24).trim();
 if(!nickname)throw Error('닉네임을 입력해 주세요.');
 const body=['닉네임: '+nickname,'연령대: '+clean(form.ageGroup,20),'기기: '+clean(form.deviceType,30),'분야: '+clean(form.field,40),'지원 동기: '+clean(form.reason,300),'특이사항: '+clean(form.notes,300)].join('\n');
 await set(push(ref(db,root)),{uid:user.uid,project:'Hub',subject:'[플레이테스터 지원] '+nickname,body,createdAt:serverTimestamp()});
}
const button=$('tester-review-open');
if(button)button.addEventListener('click',async()=>{
 const status=$('tester-review-status'),list=$('tester-review-list');
 status.textContent='운영자 로그인 및 조회 중…';button.disabled=true;
 try{
  if(!auth.currentUser||auth.currentUser.isAnonymous)await signInWithPopup(auth,new GoogleAuthProvider());
  const snapshot=await get(ref(db,root));
  list.replaceChildren();
  const entries=[];
  snapshot.forEach(item=>{const data=item.val();if(typeof data?.subject==='string'&&data.subject.startsWith('[플레이테스터 지원] '))entries.push({id:item.key,...data})});
  entries.reverse();
  for(const entry of entries){
   const card=document.createElement('article');
   card.style.cssText='border:1px solid #d6d3f5;border-radius:12px;padding:12px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere';
   const title=document.createElement('strong');title.textContent=entry.subject;
   const body=document.createElement('p');body.textContent=entry.body||'';body.style.whiteSpace='pre-wrap';
   const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px';
   for(const label of ['승인','거절']){
    const action=document.createElement('button');action.type='button';action.disabled=true;action.textContent=label+' (권한 연동 대기)';
    action.title='서버에서 운영자 권한을 검증하는 승인 API가 준비되어야 활성화할 수 있습니다.';
    actions.append(action);
   }
   card.append(title,body,actions);list.append(card);
  }
  status.textContent=entries.length+'건의 지원서를 조회했어요. 승인/거절은 안전한 서버 권한 연동 후 사용할 수 있습니다.';
 }catch(err){status.textContent='조회 실패: '+(err.code||err.message||'권한 오류')+'. 운영자 Firebase 읽기 권한을 확인해 주세요.'}
 finally{button.disabled=false}
});
