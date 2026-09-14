import test from 'node:test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
const post=(path,body)=>fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('optional relationships persist without changing chemistry; invalid values are rejected',async()=>{
 const map=await(await post('/api/maps',{nickname:'관계테스트',mbti:'ENFP'})).json();
 const path=`/api/maps/${map.id}/friends`;
 assert.equal((await post(path,{nickname:'동료별',mbti:'INTJ',relationship:'동료'})).status,201);
 assert.equal((await post(path,{nickname:'기존별',mbti:'INTJ'})).status,201);
 const saved=await(await fetch(`${origin}/api/maps/${map.id}`)).json();
 assert.equal(saved.friends.find(x=>x.nickname==='동료별').relationship,'동료');
 assert.equal(saved.friends.find(x=>x.nickname==='기존별').relationship,null);
 assert.equal(saved.ranking[0].score,saved.ranking[1].score);
 assert.equal((await post(path,{nickname:'오류별',mbti:'INTJ',relationship:'unknown'})).status,400);
});
