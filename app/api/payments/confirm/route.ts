import {env} from 'cloudflare:workers';
import {confirmPayment} from '@/lib/payment-core';
import {config,input,json,ownOrder} from '@/lib/payments-server';
export async function POST(request:Request){
 let data;try{data=await input(request);}catch{return json({error:'요청을 확인해 주세요.'},400);}
 if(typeof data.orderId!=='string'||typeof data.paymentKey!=='string'||data.paymentKey.length>250||data.paymentKey.length<1)return json({error:'결제 정보를 확인해 주세요.'},400);
 const order=await ownOrder(data.orderId,request);if(!order)return json({error:'주문을 만든 브라우저에서 다시 열어 주세요.'},403);
 if(data.amount!==order.amount)return json({error:'결제 금액이 주문과 다릅니다.'},400);
 const c=config();if(!c||c.mode!==order.mode)return json({error:'이 주문의 결제 환경을 확인할 수 없어요.'},503);
 if(order.payment_key&&order.payment_key!==data.paymentKey)return json({error:'다른 결제 정보로 변경할 수 없어요.'},409);
 await env.DB.prepare('UPDATE orders SET payment_key=? WHERE id=? AND payment_key IS NULL').bind(data.paymentKey,order.id).run();
 const bound=await ownOrder(order.id,request);if(bound?.payment_key!==data.paymentKey)return json({error:'이미 확인 중인 주문입니다.'},409);
 try{
  await confirmPayment(c.secret,order,data.paymentKey);
  await env.DB.prepare("UPDATE orders SET status='PAID' WHERE id=?").bind(order.id).run();
  return json({orderId:order.id,url:'/purchases/'+order.id});
 }catch{return json({error:'결제 완료 여부를 확인하지 못했어요. 다시 결제하지 말고 아래 확인 버튼을 눌러 주세요. 계속되면 주문번호와 함께 문의해 주세요.'},502);}
}
