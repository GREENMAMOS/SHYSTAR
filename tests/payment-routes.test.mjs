import test from 'node:test';import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import {build} from 'esbuild';import fs from 'node:fs';
const sqlite=new DatabaseSync(':memory:');
for(const name of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('drizzle/'+name,'utf8'));
const env={
 TOSS_CLIENT_KEY:'test_ck_fixture',TOSS_SECRET_KEY:'test_sk_fixture',
 DB:{prepare(sql){
  return {bind(...params){
   return {
    async run(){const r=sqlite.prepare(sql).run(...params);return {meta:{changes:Number(r.changes)}};},
    async first(){return sqlite.prepare(sql).get(...params)||null;},
    async all(){return {results:sqlite.prepare(sql).all(...params)};},
   };
  }};
 }},
};
globalThis.__paymentTestEnv=env;
async function route(name){const r=await build({entryPoints:['app/api/payments/'+name+'/route.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-binding',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'binding',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__paymentTestEnv;'}));}}]});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
const orders=await route('orders'),confirm=await route('confirm'),report=await route('report');
const mapId=crypto.randomUUID(),friendId=crypto.randomUUID();
sqlite.prepare('INSERT INTO maps (id,nickname,mbti,created_at) VALUES (?,?,?,?)').run(mapId,'결제검증','ENFP',Date.now());
sqlite.prepare('INSERT INTO friends (id,map_id,nickname,mbti,created_at,relationship) VALUES (?,?,?,?,?,?)').run(friendId,mapId,'친구검증','INTJ',Date.now(),'친구');
const req=(path,data,cookie='')=>new Request('https://example.test'+path,{method:data?'POST':'GET',headers:{origin:'https://example.test','Content-Type':'application/json',cookie},...(data?{body:JSON.stringify(data)}:{})});
test('real routes: one order per buyer, amount tampering, repeat approval, access isolation and cancellation',async()=>{
 const originalFetch=globalThis.fetch;
 try{
 const res=await orders.POST(req('/api/payments/orders',{mapId,friendId,consent:true,amount:1}));assert.equal(res.status,200);
 const cookie=res.headers.get('set-cookie').split(';')[0];assert.match(res.headers.get('set-cookie'),/HttpOnly/);assert.match(res.headers.get('set-cookie'),/SameSite=Lax/);
 const order=await res.json();assert.equal(order.amount,990);assert.ok(order.customerKey.length<=50);assert.ok(!JSON.stringify(order).includes('test_sk'));
 const repeated=await orders.POST(req('/api/payments/orders',{mapId,friendId,consent:true},cookie));assert.equal((await repeated.json()).orderId,order.orderId);
 const data={orderId:order.orderId,paymentKey:'test_payment_fixture',amount:990};
 assert.equal((await confirm.POST(req('/api/payments/confirm',data))).status,403);
 assert.equal((await confirm.POST(req('/api/payments/confirm',{...data,amount:1},cookie))).status,400);
 let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({orderId:order.orderId,paymentKey:data.paymentKey,totalAmount:990,balanceAmount:990,currency:'KRW',status:'DONE'});};
 assert.equal((await confirm.POST(req('/api/payments/confirm',data,cookie))).status,200);
 assert.equal((await confirm.POST(req('/api/payments/confirm',data,cookie))).status,200);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM orders').get().n,1);
 const readPath='/api/payments/report?orderId='+order.orderId;
 assert.equal((await report.GET(req(readPath))).status,403);
 const good=await report.GET(req(readPath,undefined,cookie));assert.equal(good.status,200);assert.equal((await good.json()).report.sections.length,7);
 sqlite.prepare('DELETE FROM friends WHERE id=?').run(friendId);
 assert.equal((await report.GET(req(readPath,undefined,cookie))).status,200);
 env.TOSS_CLIENT_KEY='live_ck_fixture';env.TOSS_SECRET_KEY='live_sk_fixture';env.PAYMENTS_LIVE_ENABLED='true';
 assert.equal((await report.GET(req(readPath,undefined,cookie))).status,402);
 env.TOSS_CLIENT_KEY='test_ck_fixture';env.TOSS_SECRET_KEY='test_sk_fixture';
 globalThis.fetch=async()=>Response.json({orderId:order.orderId,paymentKey:data.paymentKey,totalAmount:990,balanceAmount:0,currency:'KRW',status:'CANCELED'});
 const canceled=await report.GET(req(readPath,undefined,cookie));assert.equal(canceled.status,402);assert.ok(!(await canceled.text()).includes('sections'));
 assert.equal(sqlite.prepare('SELECT status FROM orders').get().status,'CANCELED');assert.ok(calls>=3);
 }finally{globalThis.fetch=originalFetch;sqlite.close();delete globalThis.__paymentTestEnv;}
});


