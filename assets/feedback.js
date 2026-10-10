import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getDatabase,ref,push,set,get,update,remove,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
const app=getApps()[0]||initializeApp({apiKey:"AIzaSyBreTSe1m0-xlbF4aupnU5isRZCihR25IE",authDomain:"formwheel.firebaseapp.com",databaseURL:"https://formwheel-default-rtdb.firebaseio.com",projectId:"formwheel",appId:"1:431583088241:web:74e0e34ea1e3e1170c55d0"});
const auth=getAuth(app),db=getDatabase(app),$=id=>document.getElementById(id);
const node=ref(db,"formwheelFeedback/items");
async function user(){return auth.currentUser||(await signInAnonymously(auth)).user;}
$("feedback-form").addEventListener("submit",async e=>{
 e.preventDefault();const b=$("submit");b.disabled=true;$("status").textContent="제출 중…";
 try{const u=await user();await set(push(node),{uid:u.uid,project:$("project").value,subject:$("subject").value.trim().slice(0,80),body:$("body").value.trim().slice(0,2000),createdAt:serverTimestamp()});$("feedback-form").reset();$("status").textContent="제출 완료! 감사합니다.";}
 catch(err){$("status").textContent="제출 실패: "+(err.code||"연결 또는 권한 문제");}
 finally{b.disabled=false;}
});
$("open-admin").addEventListener("click",()=>{$("admin").hidden=!$("admin").hidden});
$("lock").addEventListener("click",()=>{$("items").hidden=true;$("list").replaceChildren();$("code-form").hidden=false;$("admin-status").textContent="";});
$("code-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if($("code").value!=="asdf1340"){$("admin-status").textContent="코드가 올바르지 않습니다.";$("code").value="";return;}
 $("code").value="";$("admin-status").textContent="불러오는 중…";
 try{await user();const s=await get(node),items=[];s.forEach(child=>items.push({key:child.key,value:child.val()}));items.reverse();$("list").replaceChildren();for(const item of items.slice(0,100)){const x=item.value;const a=document.createElement("article"),h=document.createElement("h3"),p=document.createElement("p");h.textContent="["+(x.project||"기타")+"] "+(x.subject||"");p.textContent=x.body||"";const row=document.createElement("div"),check=document.createElement("input"),del=document.createElement("button"),msg=document.createElement("span");
check.type="checkbox";check.checked=x.completed===true;check.setAttribute("aria-label","처리 완료");del.type="button";del.textContent="삭제";del.style.marginLeft="15px";
check.addEventListener("change",async()=>{const next=check.checked;check.disabled=true;try{await update(ref(db,"formwheelFeedback/items/"+item.key),{completed:next});}catch(err){check.checked=!next;msg.textContent="저장 실패: "+(err.code||"권한 오류")}finally{check.disabled=false}});
del.addEventListener("click",async()=>{if(!confirm("이 개선점을 삭제할까요?"))return;del.disabled=true;try{await remove(ref(db,"formwheelFeedback/items/"+item.key));a.remove()}catch(err){msg.textContent="삭제 실패: "+(err.code||"권한 오류");del.disabled=false}});
row.append(check,document.createTextNode(" 처리 완료"),del,msg);a.append(h,p,row);$("list").append(a)}$("items").hidden=false;$("code-form").hidden=true;$("admin-status").textContent="최근 개선점 "+Math.min(items.length,100)+"개";}
 catch(err){$("admin-status").textContent="조회 실패: "+(err.code||"Firebase 읽기 권한 확인 필요");}
});
if(location.hash==="#admin"){$("admin").hidden=false;$("code").focus()}
