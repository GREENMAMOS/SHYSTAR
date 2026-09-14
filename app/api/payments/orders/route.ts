import {env} from 'cloudflare:workers';
import {readMap} from '@/db/maps';
import {buildAnalysis} from '@/lib/analysis';
import {ANALYSIS_PRICE} from '@/lib/payment-core';
import {buyer,buyerCookie,config,input,json,type Order} from '@/lib/payments-server';
export async function POST(request:Request){
 let body;try{body=await input(request);}catch{return json({error:'요청을 확인해 주세요.'},400);}
 const c=config();if(!c)return json({error:'결제 서비스를 준비하고 있어요. 아직 결제되지 않습니다.'},503);
 if(body.consent!==true)return json({error:'상품 안내와 이용 조건을 확인해 주세요.'},400);
 const map=await readMap(typeof body.mapId==='string'?body.mapId:'');const friend=map?.friends.find(f=>f.id===body.friendId);
 if(!map||!friend)return json({error:'분석할 친구를 찾지 못했어요.'},404);
 const b=(await buyer(request,true))!;
 const existing=await env.DB.prepare('SELECT * FROM orders WHERE buyer_hash=? AND map_id=? AND friend_id=? AND mode=?').bind(b.hash,map.id,friend.id,c.mode).first<Order>();
 const id=existing?.id||crypto.randomUUID();
 if(!existing)await env.DB.prepare('INSERT INTO orders (id,buyer_hash,map_id,friend_id,amount,mode,status,report,created_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(id,b.hash,map.id,friend.id,ANALYSIS_PRICE,c.mode,'PENDING',JSON.stringify(buildAnalysis(map.owner,friend)),Date.now()).run();
 const order=await env.DB.prepare('SELECT id,status,payment_key FROM orders WHERE buyer_hash=? AND map_id=? AND friend_id=? AND mode=?').bind(b.hash,map.id,friend.id,c.mode).first<{id:string;status:string;payment_key:string|null}>();
 if(!order)return json({error:'주문을 저장하지 못했어요.'},503);
 return json({orderId:order.id,amount:ANALYSIS_PRICE,clientKey:c.client,mode:c.mode,status:order.payment_key?'CHECKING':order.status,orderName:'사이별 상세 궁합 1건',customerKey:'buyer_'+b.hash.slice(0,32)},200,{'Set-Cookie':buyerCookie(b.token,request)});
}



