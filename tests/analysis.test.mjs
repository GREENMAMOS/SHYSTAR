import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAnalysis} from '../lib/analysis.ts';
test('sample report has seven substantive sections and responds to relationship and type',()=>{
 const a=buildAnalysis({nickname:'별',mbti:'ENFP'},{nickname:'달',mbti:'INTJ',relationship:'친구'});
 const b=buildAnalysis({nickname:'별',mbti:'ENFP'},{nickname:'달',mbti:'INTJ',relationship:'동료'});
 assert.equal(a.sections.length,7);
 assert.ok(a.sections.every(s=>s.body.length>80));
 assert.notDeepEqual(a.sections,b.sections);
 assert.notDeepEqual(a.sections,buildAnalysis({nickname:'별',mbti:'ENFP'},{nickname:'달',mbti:'ENFP'}).sections);
 assert.equal(a.price,990);assert.equal(a.mode,'sample');
});
test('romance is hypothetical for friends, tailored to partners, and absent for family',()=>{
 const owner={nickname:'별',mbti:'ENFP'};
 const report=relationship=>buildAnalysis(owner,{nickname:'달',mbti:'INTJ',relationship});
 assert.ok(report('친구').sections.some(s=>s.title==='만약, 우리가 연애를 한다면?'));
 assert.ok(report('연인').sections.some(s=>s.title==='우리 연애, 더 잘 맞춰가려면?'));
 assert.equal(report('가족').sections.length,6);
 assert.ok(report('가족').sections.every(s=>!s.title.includes('연애')));
});
