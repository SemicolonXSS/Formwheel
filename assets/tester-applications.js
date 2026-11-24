import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,getIdTokenResult,signInAnonymously,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,push,set,get,update,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
const app=getApps()[0]||initializeApp({apiKey:'AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE',authDomain:'formwheel.firebaseapp.com',databaseURL:'https://formwheel-default-rtdb.firebaseio.com',projectId:'formwheel',appId:'1:431583088241:web:74e0e34ea1e3e1170c55d0'});
const auth=getAuth(app),db=getDatabase(app);
const root='formwheelFeedback/items';
const $=id=>document.getElementById(id);
async function getReviewOperator(){
 const user=auth.currentUser;
 if(!user||user.isAnonymous)return null;
 const {claims}=await getIdTokenResult(user,true);
 const allowed=claims.producer===true||claims.admin===true||
  (claims.email==='not404spam@gmail.com'&&claims.email_verified===true);
 return allowed&&auth.currentUser?.uid===user.uid?user:null;
}
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
  const operator=await getReviewOperator();
  if(!operator){status.textContent='Firebase 운영자 권한이 있는 계정으로 로그인해 주세요.';list.replaceChildren();return;}
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
    action.disabled=entry.reviewStatus===value&&!(value==='approved'&&entry.uid);
    action.addEventListener('click',async()=>{
     if(!confirm(entry.subject+'을(를) '+label+'할까요?'))return;
     action.disabled=true;status.textContent=label+' 처리 중…';
     try{
      const reviewer=await getReviewOperator();
      if(reviewer?.uid!==operator.uid)throw Error('지원서를 조회한 Firebase 운영자 계정으로 다시 로그인해 주세요.');
      const reviewedAt=serverTimestamp(), item=root+'/'+entry.id;
      const changes={
       [item+'/reviewStatus']:value,
       [item+'/reviewedBy']:reviewer.uid,
       [item+'/reviewedAt']:reviewedAt
      };
      if(value==='approved'&&entry.uid){
       changes['formwheelV2/playtesterEntitlements/'+entry.uid]={
        approved:true,revoked:false,approvedBy:reviewer.uid,approvedAt:reviewedAt
       };
      }
      await update(ref(db),changes);
      state.textContent='현재 상태: '+label;
      if(value==='approved'&&entry.uid){
       status.textContent='승인과 Hub 혜택을 함께 저장했어요. 지원서와 Hub 로그인 UID가 같아야 적용됩니다.';
      }else if(value==='rejected'){
       status.textContent='거절 기록을 저장했어요. 이미 지급된 혜택은 별도로 회수해야 해요.';
      }else{
       status.textContent='승인 기록을 저장했어요. 지원서에 계정 UID가 없어 혜택은 지급되지 않았어요.';
      }
      [...actions.querySelectorAll('button')].forEach(b=>b.disabled=b===action);
     }catch(err){status.textContent=label+' 실패: '+(err.code||err.message||'권한 오류')+'. Firebase Rules에서 관리자만 reviewStatus를 수정할 수 있어야 합니다.';action.disabled=false}
    });
    actions.append(action);
   }
   card.append(title,body,actions);list.append(card);
  }
  status.textContent=entries.length+'건의 지원서를 조회했어요. 승인/거절 기록은 Firebase 관리자 권한과 Rules가 허용할 때 저장됩니다. 승인하면 계정에 Hub 혜택이 함께 지급됩니다.';
 }catch(err){status.textContent='조회 실패: '+(err.code||err.message||'권한 오류')+'. 운영자 Firebase 읽기 권한을 확인해 주세요.'}
 finally{button.disabled=false}
});
