/* Common accessible controls, status and errors; no analytics or data transfer. */
(()=>{'use strict';if(window.FormwheelUI)return;
 let toastTimer,toastNode,errorNode,dialogNode;
 function toast(message){if(!toastNode){toastNode=document.createElement('div');toastNode.className='fw-toast';toastNode.setAttribute('role','status');document.body.append(toastNode);}toastNode.textContent=message;toastNode.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.hidden=true,3500);}
 function error(message){if(!errorNode){errorNode=document.createElement('div');errorNode.className='fw-error';errorNode.setAttribute('role','alert');const text=document.createElement('span'),retry=document.createElement('button'),close=document.createElement('button');retry.textContent='새로고침';retry.onclick=()=>location.reload();close.textContent='닫기';close.onclick=()=>errorNode.hidden=true;errorNode.append(text,retry,close);document.body.append(errorNode);}errorNode.firstChild.textContent=message;errorNode.hidden=false;}
 function errorMessage(value){const code=String(value?.code||value?.message||value||'');if(/permission.denied|permission-denied|PERMISSION_DENIED/i.test(code))return '저장 또는 조회 권한이 없습니다. 프로젝트 관리자에게 문의해주세요.';if(/auth\//i.test(code))return '로그인 연결에 실패했습니다. 다시 로그인해주세요.';if(/api.key|api-key|invalid-api-key/i.test(code))return '서비스 연결 설정에 오류가 있습니다. 프로젝트 관리자에게 문의해주세요.';if(/network|offline|unavailable|disconnected|fetch/i.test(code))return '네트워크 연결에 실패했습니다. 연결을 확인하고 다시 시도해주세요.';return '작업을 완료하지 못했습니다. 현재 화면을 확인하고 다시 시도해주세요.';}
 function modal(title,message){dialogNode?.remove();dialogNode=document.createElement('dialog');dialogNode.className='fw-dialog';const heading=document.createElement('h2'),text=document.createElement('p'),close=document.createElement('button');heading.textContent=title;text.textContent=message;close.textContent='확인';close.onclick=()=>dialogNode.close();dialogNode.append(heading,text,close);document.body.append(dialogNode);dialogNode.showModal();close.focus();}
 function loading(message='불러오는 중…'){const node=document.createElement('div');node.className='fw-loading';node.textContent=message;node.setAttribute('role','status');document.body.append(node);return ()=>node.remove();}
 window.FormwheelUI={toast,error,errorMessage,modal,loading};
 addEventListener('unhandledrejection',event=>error(errorMessage(event.reason)));
 addEventListener('error',event=>{if(event.error)error(errorMessage(event.error));else if(event.target?.tagName==='SCRIPT')error('필요한 프로그램을 불러오지 못했습니다. 연결을 확인해주세요.');},true);
 addEventListener('offline',()=>toast('네트워크 연결이 끊겼습니다. 온라인 저장은 다시 연결한 뒤 확인해주세요.'));
 addEventListener('online',()=>toast('네트워크가 다시 연결되었습니다.'));
 function ready(){
  const app=document.getElementById('app');if(app&&!app.textContent.trim()){const done=loading();const observer=new MutationObserver(()=>{if(app.textContent.trim()){done();observer.disconnect();}});observer.observe(app,{childList:true,subtree:true});setTimeout(()=>{if(!app.textContent.trim()){done();observer.disconnect();error('시작 화면을 불러오지 못했습니다. 다시 시도해주세요.');}},15000);}
  const footer=document.createElement('footer');footer.className='fw-footer';const home=document.createElement('a'),help=document.createElement('button');home.href='https://semicolonxss.github.io/Formwheel/';home.textContent='Formwheel Home';help.textContent='이용 안내';help.onclick=()=>modal('Formwheel 이용 안내','온라인 기능은 닉네임·답안·점수·채팅 등 입력한 내용을 서버에 저장할 수 있습니다.\n기기에 저장하는 기능은 브라우저 데이터 삭제 시 초기화됩니다.\n민감한 개인정보를 입력하지 마세요. 각 프로젝트의 서버 접근 권한 검증 상태는 Check에서 확인할 수 있습니다.');footer.append(home,help);document.body.append(footer);
  const nickIds=/^(nickname|nick|hostName|joinName|soloName|battleName|soloNickname|playerName|n)$/i;
  function adapt(){document.querySelectorAll('input').forEach(input=>{if(nickIds.test(input.id))input.maxLength=12;});}adapt();new MutationObserver(adapt).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
