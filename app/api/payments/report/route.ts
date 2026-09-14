import {env} from 'cloudflare:workers';
import {queryPayment,verifyPayment} from '@/lib/payment-core';
import {config,json,ownOrder} from '@/lib/payments-server';
export async function GET(request:Request){
 const order=await ownOrder(new URL(request.url).searchParams.get('orderId')||'',request);
 if(!order)return json({error:'구매한 브라우저에서 열어 주세요.'},403);
 const c=config();if(!c||c.mode!==order.mode||!order.payment_key)return json({error:'결제가 아직 완료되지 않았어요.'},402);
 try{
  const p=await queryPayment(c.secret,order.payment_key);
  if(!verifyPayment(p,order,order.payment_key)){
   if(['CANCELED','PARTIAL_CANCELED'].includes(p.status)&&p.orderId===order.id)await env.DB.prepare("UPDATE orders SET status='CANCELED' WHERE id=?").bind(order.id).run();
   return json({error:'미결제 또는 취소된 주문이에요.'},402);
  }
  await env.DB.prepare("UPDATE orders SET status='PAID' WHERE id=?").bind(order.id).run();
  return json({report:JSON.parse(order.report),orderId:order.id,mode:order.mode});
 }catch{return json({error:'결제 내역을 확인하지 못했어요. 잠시 뒤 다시 열어 주세요.'},503);}
}
