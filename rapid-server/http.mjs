import {catalog,operation,view,WalletError} from './wallet.mjs';

const reply=(res,code,body)=>res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(body));
async function body(req){
  let size=0;
  const blocks=[];
  for await(const chunk of req){
    size+=chunk.length;
    if(size>4096)throw new WalletError('요청이 너무 커요.');
    blocks.push(chunk);
  }
  try{return JSON.parse(Buffer.concat(blocks).toString());}
  catch{throw new WalletError('거래 요청 형식이 올바르지 않아요.');}
}
export function rapidHandler({origin,auth,transact,walletRef}){
 return async(req,res)=>{
  if(req.headers.origin===origin){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  }else if(req.headers.origin)return reply(res,403,{error:'허용된 사이트에서 열어 주세요.'});
  if(req.method==='OPTIONS')return res.writeHead(204).end();
  if(req.method==='GET'&&req.url==='/health')return reply(res,200,{ok:true});
  if(!((req.method==='GET'&&req.url==='/wallet')||(req.method==='POST'&&req.url==='/transactions')))return reply(res,404,{error:'경로를 찾을 수 없어요.'});
  const token=req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1];
  let user;
  try{if(token)user=await auth.verifyIdToken(token,true);}catch{}
  if(!user||user.firebase?.sign_in_provider==='anonymous')return reply(res,401,{error:'Formwheel 계정에 로그인해 주세요.'});
  try{
    const wallet=req.method==='GET'?(await walletRef(user.uid).get()).val():await transact(user.uid,operation(await body(req)));
    reply(res,200,{wallet:view(wallet),catalog});
  }catch(error){
    if(error instanceof WalletError)reply(res,409,{error:error.message});
    else{console.error('Rapid operation failed',error.code||error.name);reply(res,500,{error:'거래 확인 중 오류가 발생했어요. 같은 거래 번호로 다시 시도해 주세요.'});}
  }
 };
}
