import {readFileSync} from 'node:fs';

export const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url)));
const items = new Map(catalog.map(item => [item.id, item]));
const amountPattern = /^(0|[1-9][0-9]{0,499})$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{9,99}$/;
export const priceInScoreUnits = 1000n;
export class WalletError extends Error {}

function units(value) {
  if (typeof value !== 'string' || !amountPattern.test(value)) throw new WalletError('잘못된 잔액 또는 수량입니다.');
  return BigInt(value);
}
function stored(value) {
  const result = String(value);
  units(result);
  return result;
}
function safeMap(value) {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) throw new WalletError('저장된 거래 기록을 확인해 주세요.');
  return value;
}
export function view(wallet) {
  if (wallet !== null && wallet !== undefined && (typeof wallet !== 'object' || Array.isArray(wallet))) {
    throw new WalletError('기존 계정 지갑을 확인해 주세요.');
  }
  const balance = wallet ? stored(units(wallet.balance)) : '0';
  const eligible = units(wallet?.verifiedScoreUnits ?? '0');
  return {balance, exchangeable: String(eligible / priceInScoreUnits), purchases: Object.values(safeMap(wallet?.purchases))};
}

export function operation(body, {allowVerifiedCredit = false} = {}) {
  if (!body || typeof body !== 'object' || !idPattern.test(body.id ?? '') || typeof body.id !== 'string') {
    throw new WalletError('거래 번호가 올바르지 않아요.');
  }
  const {action,id} = body;
  if (action === 'exchange' || (allowVerifiedCredit && action === 'credit-verified')) {
    const value = units(body.amount);
    if (value < 1n) throw new WalletError('수량은 1 이상이어야 해요.');
    return {action,id,value:stored(value)};
  }
  if (action === 'buy' && items.has(body.productId)) return {action,id,value:body.productId};
  if (action === 'refund' && typeof body.purchaseId === 'string' && idPattern.test(body.purchaseId)) {
    return {action,id,value:body.purchaseId};
  }
  throw new WalletError('지원하지 않는 거래입니다.');
}

export function apply(current, op, now) {
  if (!Number.isSafeInteger(now)) throw new WalletError('서버 시각 오류');
  view(current);
  const wallet = current ?? {balance:'0'};
  const receipts = safeMap(wallet.rapidReceipts), purchases = safeMap(wallet.purchases);
  if (Object.hasOwn(receipts,op.id)) {
    const previous = receipts[op.id];
    if (previous.action !== op.action || previous.value !== op.value) throw new WalletError('같은 거래 번호에 다른 요청을 사용할 수 없어요.');
    return wallet;
  }
  if (Object.keys(receipts).length >= 5000) throw new WalletError('거래 기록 한도에 도달했어요. 관리자에게 문의해 주세요.');
  let balance = units(wallet.balance), eligible = units(wallet.verifiedScoreUnits ?? '0');
  const nextPurchases = {...purchases};
  if (op.action === 'credit-verified') {
    eligible += units(op.value);
  } else if (op.action === 'exchange') {
    const debit = units(op.value) * priceInScoreUnits;
    if (eligible < debit) throw new WalletError('서버에서 확인한 교환 가능 점수가 부족해요.');
    eligible -= debit;
    balance += units(op.value);
  } else if (op.action === 'buy') {
    const item = items.get(op.value), price = units(item.price);
    if (Object.values(purchases).some(record => record.productId === item.id && !record.refundedAt)) {
      throw new WalletError('이미 구매한 상품이에요.');
    }
    if (balance < price) throw new WalletError('계정 Rapid 잔액이 부족해요.');
    balance -= price;
    nextPurchases[op.id] = {id:op.id, productId:item.id, name:item.name, price:item.price, purchasedAt:now};
  } else if (op.action === 'refund') {
    const record = Object.hasOwn(purchases,op.value) ? purchases[op.value] : null;
    if (!record || record.refundedAt || !Number.isSafeInteger(record.purchasedAt) ||
        now < record.purchasedAt || now - record.purchasedAt > 86400000) {
      throw new WalletError('구매 후 24시간 안에 한 번만 전액 환불할 수 있어요.');
    }
    balance += units(record.price);
    nextPurchases[op.value] = {...record,refundedAt:now};
  } else throw new WalletError('지원하지 않는 거래입니다.');
  return {...wallet,balance:stored(balance),verifiedScoreUnits:stored(eligible),updatedAt:now,purchases:nextPurchases,
    rapidReceipts:{...receipts,[op.id]:{action:op.action,value:op.value,at:now}}};
}
