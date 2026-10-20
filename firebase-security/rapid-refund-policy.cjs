/* Rapid refund rules. Pure, server-side reusable policy; never trust a browser's balance. */
"use strict";
function refundQuote(purchase, percent) {
  if (!purchase || !Number.isSafeInteger(purchase.price) || purchase.price<=0)
    throw new Error("INVALID_PURCHASE_PRICE");
  if (!Number.isInteger(percent) || percent<1 || percent>100)
    throw new Error("INVALID_REFUND_PERCENT");
  if (purchase.status!=="active") throw new Error("PURCHASE_NOT_ACTIVE");
  if (purchase.refundStatus==="refunded" || purchase.refundStatus==="partial")
    throw new Error("ALREADY_REFUNDED");
  const amount=Math.floor(purchase.price*percent/100);
  if(amount<1) throw new Error("REFUND_TOO_SMALL");
  return {percent,amount,remaining:purchase.price-amount,revokeItem:percent===100,
    partialRefundKeepsItem:percent<100};
}
function autoRefundAllowed(purchase, now) {
  return !!purchase && Number.isFinite(purchase.purchasedAt) &&
    now>=purchase.purchasedAt && now-purchase.purchasedAt<=86400000 &&
    purchase.status==="active" && !purchase.refundStatus;
}
if(typeof module!=="undefined")module.exports={refundQuote,autoRefundAllowed};
