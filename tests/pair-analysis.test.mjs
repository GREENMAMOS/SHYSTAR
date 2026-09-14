import test from 'node:test';
import assert from 'node:assert/strict';
import {MBTI_TYPES} from '../lib/chemistry.ts';
import {PAIR_STORIES,getPairStory} from '../lib/pair-stories.ts';
import {buildAnalysis} from '../lib/analysis.ts';
test('136 explicitly authored pair stories cover all 256 directed combinations',()=>{
 assert.equal(Object.keys(PAIR_STORIES).length,136);
 const seen=new Set();
 for(const a of MBTI_TYPES)for(const b of MBTI_TYPES){
  const pair=getPairStory(a,b);
  assert.deepEqual(pair,getPairStory(b,a));
  for(const field of ['strength','friction','romance'])assert.ok(pair[field].length>=15,`${a}/${b}: ${field}`);
  seen.add(JSON.stringify(pair));
 }
 assert.equal(seen.size,136);
 assert.throws(()=>getPairStory('XXXX','ENFP'));
});
test('every type and relationship has substantial content, including reversed perspective',()=>{
 for(const a of MBTI_TYPES)for(const b of MBTI_TYPES)for(const relationship of ['친구','선후배','동료','지인','가족','연인','기타',null]){
  const report=buildAnalysis({nickname:'작성자',mbti:a},{nickname:'참여자',mbti:b,relationship});
  assert.equal(report.sections.length,relationship==='가족'?6:7);
  assert.ok(report.sections.every(s=>s.body.length>=450&&s.body.split('\n\n').length===3),`${a}/${b}/${relationship}`);
  assert.ok(report.sections.some(s=>s.body.includes(getPairStory(a,b).strength)));
  assert.ok(report.sections.find(s=>s.title==='잘 맞는데, 왜 서운할까?').body.includes(getPairStory(a,b).friction));
  if(relationship!=='가족')assert.ok(report.sections[0].body.includes(getPairStory(a,b).romance));
  assert.ok(!JSON.stringify(report).includes('undefined'));
  if(relationship==='가족')assert.ok(!report.sections.some(s=>s.title.includes('연애')));
 }
});
test('perspective follows the owner and relationship wording stays specific',()=>{
 const make=(a,b,relationship)=>buildAnalysis({nickname:'작성자',mbti:a},{nickname:'참여자',mbti:b,relationship});
 assert.notEqual(make('INTJ','ENFP','친구').sections[4].body,make('ENFP','INTJ','친구').sections[4].body);
 const reports=['친구','선후배','동료','지인','가족','연인','기타',null].map(r=>make('ENFP','INTJ',r));
 for(const title of ['우리 사이, 어떤 조합일까?','잘 맞는데, 왜 서운할까?','한 걸음 더 가까워지려면?','다퉜을 때, 어떤 말부터 할까?','다음 만남, 뭘 하면 좋을까?']){
  assert.equal(new Set(reports.map(r=>r.sections.find(s=>s.title===title).body)).size,8);
 }
 assert.ok(reports[4].sections.every(s=>!s.body.includes('데이트')&&!s.body.includes('연애')));
 assert.throws(()=>make('ENFP','INTJ','잘못된관계'));
});
