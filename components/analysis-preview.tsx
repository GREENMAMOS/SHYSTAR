'use client';
import {useState} from 'react';
import type {Person} from '@/lib/chemistry';
import type {buildAnalysis} from '@/lib/analysis';
export default function AnalysisPreview({owner,friend,backUrl,report}:{owner:Person;friend:Person;backUrl:string;report:ReturnType<typeof buildAnalysis>}){
 const [opened,setOpened]=useState(false);
 return <main className="analysis-page"><a className="back-link" href={backUrl}>← 관계 지도로 돌아가기</a><div className="analysis-heading"><span className="pill">상세 궁합 · 샘플 미리보기</span><h1>{owner.nickname}님과<br/><em>{friend.nickname}님 사이의 이야기</em></h1><p className="muted">{owner.mbti} × {friend.mbti} · {report.relationship}</p><p className="analysis-summary">{report.summary}</p></div><section className="analysis-offer"><div><h2>우리 사이, 조금 더 자세히</h2><p className="muted">한 번쯤 궁금했던 우리 사이, {report.sections.length}가지 질문</p></div><div className="analysis-price">990원 <small>출시 예정 · 1회 구매</small></div><ol className="analysis-toc">{report.sections.map((s,i)=><li key={s.title}><span>0{i+1}</span>{s.title}</li>)}</ol><p className="privacy-note">지금은 결제 없이 전체 샘플을 확인할 수 있어요. 구매·결제·재열람 권한 기능은 아직 연결되지 않았어요.</p><button className="primary" aria-expanded={opened} aria-controls="analysis-report" onClick={()=>setOpened(!opened)}>{opened?'전체 샘플 접기':'전체 샘플 무료로 읽기'}</button></section><div id="analysis-report" hidden={!opened}>{report.sections.map((section,i)=><section className="analysis-section" key={section.title}><span className="eyebrow">CHAPTER 0{i+1}</span><h2>{section.title}</h2>{section.body.split('\n\n').map((paragraph,index)=><p key={index}>{paragraph}</p>)}<blockquote>{section.tip}</blockquote></section>)}</div><p className="analysis-note">자체 작성한 예시 문구를 유형과 관계에 맞춰 조합한 샘플입니다. 실제 성격·속마음이나 관계의 미래를 진단하지 않아요. 같은 유형과 관계 조합은 내용이 비슷할 수 있어요.</p></main>;
}



