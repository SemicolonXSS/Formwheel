import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,signInAnonymously,GoogleAuthProvider,signInWithPopup,getIdTokenResult} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,push,set,get,update,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
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
  const token=await getIdTokenResult(auth.currentUser,true);
  const canReview=token.claims.admin===true || token.claims.formwheelAdmin===true;
  if(!canReview){status.textContent='Google 로그인은 완료됐지만 관리자 권한이 확인되지 않았어요. 관리자 custom claim 설정이 필요합니다.';list.replaceChildren();return;}
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
   const state=document.createElement('p');state.textContent='현재 상태: '+(entry.reviewStatus==='approved'?'승인':entry.reviewStatus==='rejected'?'거절':'대기');card.append(state);
   for(const [label,value] of [['승인','approved'],['거절','rejected']]){
    const action=document.createElement('button');action.type='button';action.textContent=label;
    action.disabled=entry.reviewStatus===value;
    action.addEventListener('click',async()=>{
     if(!confirm(entry.subject+'을(를) '+label+'할까요?'))return;
     action.disabled=true;status.textContent=label+' 처리 중…';
     try{
      const verified=await getIdTokenResult(auth.currentUser,true);
      if(verified.claims.admin!==true&&verified.claims.formwheelAdmin!==true)throw Error('관리자 권한이 없습니다.');
      await update(ref(db,root+'/'+entry.id),{reviewStatus:value,reviewedBy:auth.currentUser.uid,reviewedAt:serverTimestamp()});
      state.textContent='현재 상태: '+label;status.textContent=label+' 기록을 저장했어요. 배지·테마·Rapid 혜택은 별도 권한 연동이 필요합니다.';
      [...actions.querySelectorAll('button')].forEach(b=>b.disabled=b===action);
     }catch(err){status.textContent=label+' 실패: '+(err.code||err.message||'권한 오류')+'. Firebase Rules에서 관리자만 reviewStatus를 수정할 수 있어야 합니다.';action.disabled=false}
    });
    actions.append(action);
   }
   card.append(title,body,actions);list.append(card);
  }
  status.textContent=entries.length+'건의 지원서를 조회했어요. 승인/거절 기록은 Firebase 관리자 권한과 Rules가 허용할 때 저장됩니다. 혜택은 아직 지급되지 않습니다.';
 }catch(err){status.textContent='조회 실패: '+(err.code||err.message||'권한 오류')+'. 운영자 Firebase 읽기 권한을 확인해 주세요.'}
 finally{button.disabled=false}
});
