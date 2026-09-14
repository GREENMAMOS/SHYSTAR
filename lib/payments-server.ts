import {env} from 'cloudflare:workers';
import {createToken,tokenHash} from '@/lib/ownership';
import {paymentConfig} from '@/lib/payment-core';
export function config(){return paymentConfig(env);}
export function buyerToken(request:Request){const v=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('shystar_buyer='))?.slice(14);return v&&/^[a-f0-9]{64}$/.test(v)?v:null;}
export async function buyer(request:Request,create=false){const token=buyerToken(request)||(create?createToken():null);return token?{token,hash:await tokenHash(token)}:null;}
export function buyerCookie(token:string,request:Request){return `shystar_buyer=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export function json(data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store',...extra}});}
export async function input(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new Error('같은 사이트에서 다시 시도해 주세요.');
 const raw=await request.text();if(raw.length>4096)throw new Error('입력 내용을 확인해 주세요.');return JSON.parse(raw);
}
export type Order={id:string;buyer_hash:string;map_id:string;friend_id:string;amount:number;mode:string;status:string;payment_key:string|null;report:string;created_at:number};
export async function ownOrder(id:string,request:Request){const b=await buyer(request);if(!b)return null;return env.DB.prepare('SELECT * FROM orders WHERE id=? AND buyer_hash=?').bind(id,b.hash).first<Order>();}
