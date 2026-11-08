/* Coordinate visible-time samples across tabs on this origin. No account data is changed. */
export async function claimVisibleTime(uid,elapsed,now=Date.now()){
 if(!uid||!Number.isFinite(elapsed)||elapsed<=0)return 0;
 const claim=()=>{
  const key="fw:visitor:time-sample:"+uid;
  try{
   const previous=Number(localStorage.getItem(key))||0;
   const delta=Math.min(elapsed,previous?Math.max(0,now-previous):elapsed);
   // Ignore a stale future timestamp left by a device clock adjustment.
   localStorage.setItem(key,String(previous>now+60000?now:Math.max(previous,now)));
   return previous>now+60000?elapsed:delta;
  }catch{
   // Without shared storage, count only the focused document.
   return document.hasFocus()?elapsed:0;
  }
 };
 if(navigator.locks?.request)return navigator.locks.request("fw:visitor:time:"+uid,claim);
 // Synchronous storage plus focus avoids concurrent foreground writers on older browsers.
 return document.hasFocus()?claim():0;
}
