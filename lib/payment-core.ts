export const ANALYSIS_PRICE=990;
type Settings={TOSS_CLIENT_KEY?:string;TOSS_SECRET_KEY?:string;PAYMENTS_LIVE_ENABLED?:string};
export function paymentConfig(e:Settings){
 const client=e.TOSS_CLIENT_KEY||'',secret=e.TOSS_SECRET_KEY||'';
 const mode=client.startsWith('test_ck_')&&secret.startsWith('test_sk_')?'test':client.startsWith('live_ck_')&&secret.startsWith('live_sk_')&&e.PAYMENTS_LIVE_ENABLED==='true'?'live':null;
 return mode?{client,secret,mode}:null;
}
export type PaymentOrder={id:string;amount:number};
export type Payment={orderId:string;paymentKey:string;totalAmount:number;balanceAmount:number;currency:string;status:string};
export function verifyPayment(p:Payment,o:PaymentOrder,key:string){return p.orderId===o.id&&p.paymentKey===key&&p.totalAmount===o.amount&&p.balanceAmount===o.amount&&p.currency==='KRW'&&p.status==='DONE';}
export async function queryPayment(secret:string,key:string,fetcher:typeof fetch=fetch):Promise<Payment>{
 const r=await fetcher('https://api.tosspayments.com/v1/payments/'+encodeURIComponent(key),{method:'GET',headers:{Authorization:'Basic '+btoa(secret+':')},signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('결제 상태를 확인하지 못했어요. 잠시 뒤 다시 확인해 주세요.');
 return r.json();
}
export async function confirmPayment(secret:string,o:PaymentOrder,key:string,fetcher:typeof fetch=fetch):Promise<Payment>{
 let p:Payment|undefined;
 try{
  const r=await fetcher('https://api.tosspayments.com/v1/payments/confirm',{method:'POST',headers:{Authorization:'Basic '+btoa(secret+':'),'Content-Type':'application/json','Idempotency-Key':o.id},body:JSON.stringify({orderId:o.id,amount:o.amount,paymentKey:key}),signal:AbortSignal.timeout(12000)});
  if(r.ok)p=await r.json();
 }catch{/* Network ambiguity: query the same payment, never create another order. */}
 if(!p)p=await queryPayment(secret,key,fetcher);
 if(!verifyPayment(p,o,key))throw new Error('결제가 완료되지 않았거나 취소된 주문이에요. 결제 내역을 확인해 주세요.');
 return p;
}
