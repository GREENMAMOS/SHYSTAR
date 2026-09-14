import test from 'node:test';import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
test('payment endpoints fail closed without an account and never reveal report to strangers',async()=>{
 const status=await fetch(base+'/api/payments/status');assert.equal(status.status,200);assert.match(status.headers.get('cache-control'),/no-store/);
 const config=await status.json();assert.ok(!('secret' in config));
 const report=await fetch(base+'/api/payments/report?orderId=unknown');assert.equal(report.status,403);assert.ok(!(await report.text()).includes('sections'));
 const forged=await fetch(base+'/api/payments/confirm',{method:'POST',headers:{'content-type':'application/json',origin:base},body:JSON.stringify({orderId:'unknown',paymentKey:'fake',amount:990})});assert.equal(forged.status,403);
 const cross=await fetch(base+'/api/payments/orders',{method:'POST',headers:{'content-type':'application/json',origin:'https://other.example'},body:'{}'});assert.ok([400,403].includes(cross.status));
 if(!config.enabled){const create=await fetch(base+'/api/payments/orders',{method:'POST',headers:{'content-type':'application/json',origin:base},body:'{}'});assert.equal(create.status,503);}
});

