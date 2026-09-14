import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentConfig,verifyPayment,confirmPayment} from '../lib/payment-core.ts';
test('checkout is closed without keys or explicit live activation',()=>{
 assert.equal(paymentConfig({}),null);
 assert.equal(paymentConfig({TOSS_CLIENT_KEY:'live_ck_a',TOSS_SECRET_KEY:'live_sk_b'}),null);
 assert.equal(paymentConfig({TOSS_CLIENT_KEY:'test_ck_a',TOSS_SECRET_KEY:'live_sk_b'}),null);
 assert.equal(paymentConfig({TOSS_CLIENT_KEY:'test_ck_a',TOSS_SECRET_KEY:'test_sk_b'})?.mode,'test');
});
const order={id:'order_123',amount:990};
const done={orderId:order.id,totalAmount:990,balanceAmount:990,status:'DONE',currency:'KRW',paymentKey:'key_123'};
test('amount, order, currency, payment key and cancellation are checked',()=>{
 assert.equal(verifyPayment(done,order,'key_123'),true);
 for(const patch of [{totalAmount:1},{balanceAmount:0},{orderId:'other'},{currency:'USD'},{status:'CANCELED'},{paymentKey:'other'}]) assert.equal(verifyPayment({...done,...patch},order,'key_123'),false);
});
test('ambiguous confirm response queries provider before unlocking and preserves idempotency',async()=>{
 const calls=[];
 const fake=async(url,init)=>{calls.push([url,init]);if(calls.length===1)throw new Error('timeout');return Response.json(done);};
 assert.deepEqual(await confirmPayment('test_sk_example',order,'key_123',fake),done);
 assert.equal(calls[0][1].headers['Idempotency-Key'],order.id);
 assert.equal(calls[1][1].method,'GET');
 await assert.rejects(()=>confirmPayment('test_sk_example',order,'key_123',async()=>Response.json({...done,status:'CANCELED'})));
});
