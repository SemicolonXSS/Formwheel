import {getApps} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
const panel=document.getElementById('fw-tester-benefits');
if(panel){
 const css=document.createElement('style');
 css.textContent='body.fw-playtester-theme #fw-tester-benefits{background:linear-gradient(115deg,#ebe6ff,#e0f3ff);border:2px solid #8971e9}body.fw-playtester-theme header{border-bottom:3px solid #9b7ff0}';
 document.head.append(css);
 const app=getApps()[0];
 if(app){
  const auth=getAuth(app),db=getDatabase(app);
  let unsubscribe=()=>{};
  onAuthStateChanged(auth,user=>{
   unsubscribe();panel.hidden=true;document.body.classList.remove('fw-playtester-theme');
   if(!user||user.isAnonymous)return;
   unsubscribe=onValue(ref(db,'formwheelV2/playtesterEntitlements/'+user.uid),snapshot=>{
    const entry=snapshot.val();
    const active=entry?.approved===true&&entry?.revoked!==true;
    panel.hidden=!active;document.body.classList.toggle('fw-playtester-theme',active);
   },()=>{panel.hidden=true;document.body.classList.remove('fw-playtester-theme')});
  });
 }
}
