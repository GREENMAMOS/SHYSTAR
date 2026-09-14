import test from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
test('creates a personal map, reads it back and renders its URL', async () => {
  const response = await fetch(`${origin}/api/maps`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:'테스트별',mbti:'ENFP'})});
  assert.equal(response.status,201);
  const created = await response.json();
  assert.match(created.id,/^[a-f0-9-]{36}$/);
  for(let i=0;i<2;i++) {
    const read = await fetch(`${origin}/api/maps/${created.id}`);
    assert.equal(read.status,200);
    assert.deepEqual((await read.json()).owner,{nickname:'테스트별',mbti:'ENFP'});
  }
  const page = await fetch(`${origin}/m/${created.id}`);
  assert.equal(page.status,200);
  assert.ok((await page.text()).includes('테스트별'));
});
test('invalid profile and absent map return intentional errors', async () => {
  const response = await fetch(`${origin}/api/maps`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:' ',mbti:'XXXX'})});
  assert.equal(response.status,400);
  const missing = await fetch(`${origin}/api/maps/00000000-0000-4000-8000-000000000000`);
  assert.equal(missing.status,404);
});
