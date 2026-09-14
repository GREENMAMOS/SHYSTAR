import test from 'node:test';
import assert from 'node:assert/strict';
import { chemistry, MBTI_TYPES, validatePerson, rankFriends } from '../lib/chemistry.ts';

test('all 256 pairings are deterministic, symmetric and within the disclosed scale', () => {
  for (const a of MBTI_TYPES) for (const b of MBTI_TYPES) {
    const result = chemistry(a, b);
    assert.deepEqual(result, chemistry(b, a));
    assert.ok(result.score >= 60 && result.score <= 96);
    assert.ok(result.category.label && result.category.description);
    assert.equal(result.version, 'playful-v1');
  }
});
test('rejects malformed profiles and trims a valid nickname', () => {
  assert.deepEqual(validatePerson({ nickname: ' 별이 ', mbti: 'enfp' }), {nickname:'별이',mbti:'ENFP'});
  for (const value of [null, {}, {nickname:' ',mbti:'ENFP'}, {nickname:'별',mbti:'XXXX'}, {nickname:'<script>',mbti:'ENFP'}, {nickname:'a'.repeat(21),mbti:'ENFP'}]) {
    assert.throws(() => validatePerson(value));
  }
});
test('ranking sorts highest first and assigns equal rank to ties', () => {
  const friends = [{id:'1',nickname:'가',mbti:'ENTP'}, {id:'2',nickname:'나',mbti:'ENFP'}, {id:'3',nickname:'다',mbti:'ENFP'}];
  const ranked = rankFriends('ENFP', friends);
  assert.equal(ranked.length, 3);
  assert.ok(ranked.every((x,i)=>i===0 || ranked[i-1].score>=x.score));
  assert.equal(ranked.find(x=>x.id==='2')?.rank, ranked.find(x=>x.id==='3')?.rank);
  assert.equal(friends[0].id,'1');
});
