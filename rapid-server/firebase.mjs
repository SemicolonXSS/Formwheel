import {cert,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getDatabase} from 'firebase-admin/database';
import {apply, WalletError} from './wallet.mjs';

const credential=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (credential.project_id !== 'formwheel') throw new Error('A Formwheel Firebase service account is required');
const app=initializeApp({credential:cert(credential),databaseURL:'https://formwheel-default-rtdb.firebaseio.com'});
export const auth=getAuth(app);
export function walletRef(uid){
  if(typeof uid !== 'string'||!uid||uid.length>128||/[.#$\[\]/\x00-\x1f\x7f]/.test(uid))throw new WalletError('올바르지 않은 계정이에요.');
  return getDatabase(app).ref('formwheelV2/rapidWallets/'+uid);
}
export async function transact(uid,op){
  const target=walletRef(uid);
  // Prime the cache before testing funds on a transaction that can initially receive null.
  const snapshot=await target.get();
  const now=Date.now(),initial=snapshot.val();
  let first=true, failure;
  const result=await target.transaction(current=>{
    if(first&&current===null&&initial!==null){first=false;return null;}
    const before=current;
    first=false;failure=null;
    try{return apply(before,op,now);}
    catch(e){failure=e;return undefined;}
  },undefined,false);
  if(!result.committed||!result.snapshot.exists())throw failure??new WalletError('거래 상태가 바뀌었어요. 다시 시도해 주세요.');
  return result.snapshot.val();
}
