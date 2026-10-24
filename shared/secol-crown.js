/* SECOL CROWN cosmetic display: read-only local Rapid Shop entitlement.
   This does not grant items, change balances or replace profile icons. */
(()=>{
"use strict";
const SHOP_KEY="formwheel_rapid_shop_beta_v1";
const css=document.createElement("style");
css.textContent=`
.fw-secol-crown-anchor{position:relative!important;overflow:visible!important}
.fw-secol-crown-decoration{position:absolute;left:50%;bottom:calc(100% - 7px);transform:translateX(-50%);font-size:28px;line-height:1;pointer-events:none;z-index:5;filter:drop-shadow(0 2px 3px #3b215f88);white-space:nowrap}
.fw-profile-trigger .fw-secol-crown-decoration{font-size:24px;bottom:calc(100% - 7px)}
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
