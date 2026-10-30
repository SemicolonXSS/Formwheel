/* Formwheel SNS Traffic v1.0. Per-browser, per-channel first entry only. */
(async function(){
 const hub='/Formwheel/';
 const channel=document.documentElement.dataset.snsChannel;
 const allowed=['threads','x','youtube','instagram'];
 if(!allowed.includes(channel)){location.replace(hub);return;}
 const key='fw_sns_first_visit_v1_'+channel;
 const done=()=>location.replace(hub);
 const timer=setTimeout(done,2200);
 try {
   if(localStorage.getItem(key)==='1'){clearTimeout(timer);done();return;}
   const {initializeApp,getApps}=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
   const {getDatabase,ref,runTransaction}=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js');
   const app=getApps().find(a=>a.name==='fw-sns-traffic')||initializeApp({"apiKey":"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE","databaseURL":"https://formwheel-default-rtdb.firebaseio.com","projectId":"formwheel","appId":"1:431583088241:web:74e0e34ea1e3e1170c55d0"},'fw-sns-traffic');
   const db=getDatabase(app);
   const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
   // A permanent browser marker is set only after successful counting.
   const result=await runTransaction(ref(db,'snsTraffic/v1/totals/'+channel),n=>(Number(n)||0)+1,{applyLocally:false});
   if(result.committed){
     localStorage.setItem(key,'1');
     // Daily count is best-effort; total is the authoritative count.
     await runTransaction(ref(db,'snsTraffic/v1/daily/'+date+'/'+channel),n=>(Number(n)||0)+1,{applyLocally:false}).catch(()=>{});
   }
 }catch(e){console.warn('[Formwheel SNS] Count unavailable:',e);}
 finally{clearTimeout(timer);done();}
})();