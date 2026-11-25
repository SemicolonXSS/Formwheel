import {transact} from './firebase.mjs';
import {operation,view} from './wallet.mjs';

const [uid,id,amount]=process.argv.slice(2);
if(!uid||!id||!amount)throw new Error('Usage: node credit-verified.mjs UID VERIFICATION_ID SCORE_UNITS');
const op=operation({id,amount,action:'credit-verified'},{allowVerifiedCredit:true});
console.log(JSON.stringify(view(await transact(uid,op))));
