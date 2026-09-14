import {env} from 'cloudflare:workers';
import {buyer,config,json} from '@/lib/payments-server';
export async function GET(request:Request){
 const c=config(),b=await buyer(request),q=new URL(request.url).searchParams;
 const order=b&&c?await env.DB.prepare('SELECT id,status FROM orders WHERE buyer_hash=? AND map_id=? AND friend_id=? AND mode=?').bind(b.hash,q.get('mapId')||'',q.get('friendId')||'',c.mode).first<{id:string;status:string}>():null;
 return json({enabled:!!c,mode:c?.mode||'disabled',order:order?{id:order.id,status:order.status}:null});
}
