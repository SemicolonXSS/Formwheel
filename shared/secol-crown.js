/* SECOL CROWN cosmetic display: read-only local Rapid Shop entitlement.
   This does not grant items, change balances or replace profile icons. */
(()=>{
"use strict";
const SHOP_KEY="formwheel_rapid_shop_beta_v1";
const css=document.createElement("style");
css.textContent=`
/* One circular avatar system across Hub and the full profile view. */
.fw-profile-trigger,#fw-profile-avatar-wrap{position:relative!important;overflow:visible!important;flex-shrink:0!important}
header .fw-profile-trigger{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important;border-radius:50%!important;display:grid!important;place-items:center!important;overflow:visible!important;flex-shrink:0!important}
#fw-header-avatar{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;border-radius:50%!important;display:grid!important;place-items:center!important;flex-shrink:0!important;box-sizing:border-box!important}
#fw-profile-avatar-wrap{width:76px!important;height:76px!important;min-width:76px!important;min-height:76px!important;display:inline-grid!important;place-items:center!important;vertical-align:middle}
#fw-profile-avatar{width:68px!important;height:68px!important;min-width:68px!important;min-height:68px!important;display:grid!important;place-items:center!important;border-radius:50%!important;box-sizing:border-box!important;flex-shrink:0!important;font-size:32px!important}
.fw-secol-crown-anchor{position:relative!important;overflow:visible!important}
.fw-secol-crown-decoration{position:absolute;left:50%;bottom:calc(100% - 10px);transform:translateX(-50%);font-size:30px;line-height:1;pointer-events:none;z-index:5;filter:drop-shadow(0 2px 3px #3b215f88);white-space:nowrap}
.fw-profile-trigger .fw-secol-crown-decoration{font-size:22px;bottom:calc(100% - 9px)}
@media(max-width:700px){header .fw-profile-trigger{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important}#fw-header-avatar{width:39px!important;height:39px!important;min-width:39px!important;min-height:39px!important}}
`;
document.head.append(css);
function owned(){
 try{const d=JSON.parse(localStorage.getItem(SHOP_KEY)||"null");return Array.isArray(d?.purchases)&&d.purchases.some(p=>p?.item==="secol-crown"&&p.refunded===false)}catch{return false}
}
function render(){
 const visible=owned();
 for(const id of ["fw-profile-avatar-wrap","fw-header-avatar"]){
  const target=document.getElementById(id);if(!target)continue;
  const anchor=id==="fw-header-avatar"?target.closest(".fw-profile-trigger")||target:target;
  let crown=anchor.querySelector(".fw-secol-crown-decoration");
  if(!visible){crown?.remove();anchor.classList.remove("fw-secol-crown-anchor");continue}
  anchor.classList.add("fw-secol-crown-anchor");
  if(!crown){crown=document.createElement("span");crown.className="fw-secol-crown-decoration";crown.setAttribute("aria-label","SECOL CROWN 보유");crown.title="👑 SECOL CROWN";crown.textContent="👑";anchor.append(crown)}
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
window.addEventListener("storage",e=>{if(e.key===SHOP_KEY)render()});
window.addEventListener("pageshow",render);
})();
