'use strict';
/* ISOLATED example: do not add this to production exports until audited. */
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {getDatabase}=require('firebase-admin/database');
const {apply}=require('./core.cjs');
function createRapidPurchaseCallable({db=getDatabase()}={}){
 return onCall({region:'asia-northeast3',enforceAppCheck:true},async request=>{
  const uid=request.auth?.uid;
  if(!uid||request.auth?.token?.firebase?.sign_in_provider==='anonymous')
   throw new HttpsError('unauthenticated','Sign in with a permanent account.');
  const body=request.data||{};
  // Do not expose refunds until receipt ownership and timeout cases have been audited.
  if(body.type!=='purchase')throw new HttpsError('invalid-argument','Unsupported operation');
  const id=String(body.requestId||''),itemId=String(body.itemId||'');
  if(id.length>100||itemId.length>100)throw new HttpsError('invalid-argument','Invalid input');
  const target=db.ref('rapidV3/'+uid);
  let failure=null;
  const now=Date.now();
  const outcome=await target.transaction(current=>{
   try{return apply(current,{type:'purchase',itemId,requestId:id},now);}
   catch(err){failure=err;return;}
  },undefined,false);
  if(!outcome.committed)
   throw new HttpsError('failed-precondition',failure?.message||'Wallet transaction rejected');
  const data=outcome.snapshot.val();
  return {balance:data.balance,receipt:data.transactions[id],version:data.version};
 });
}
module.exports={createRapidPurchaseCallable};
