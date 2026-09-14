'use client';
import {useState} from 'react';
import {categories,type Friend} from '@/lib/chemistry';
export function ChemistryGuide(){return <section className="side-card chemistry-guide"><h2>점수와 케미, 이렇게 읽어요</h2><p className="muted">점수는 두 MBTI의 공통점과 차이를 조합한 사이별의 케미 지수예요. 점수가 같으면 순위도 같고, 선택한 관계는 점수에 영향을 주지 않아요.</p><dl>{categories.map(c=><div key={c.id}><dt style={{color:c.color}}>{c.symbol} {c.label}</dt><dd>{c.description}</dd></div>)}</dl></section>;}
export function AnalysisInvitation({mapId,ownerName,friends}:{mapId:string;ownerName:string;friends:Friend[]}){
 const [chosen,setChosen]=useState('');
 const friend=friends.find(f=>f.id===chosen);
 return <section className="analysis-invitation" aria-labelledby="analysis-invitation-title"><div><span className="eyebrow">A LITTLE CLOSER</span><h2 id="analysis-invitation-title">✦ 지도 보고, 더 궁금해졌다면</h2><p>{ownerName}님과 유독 잘 통하는 이유부터 서운해지는 순간, 가까워지는 대화까지.<br/>궁금한 상대를 골라 둘만의 이야기를 읽어보세요.</p><p className="invitation-price">상세 궁합 1건 <strong>990원</strong> <span>한 번 결제 · 정기 결제 없음</span></p></div><div className="invitation-action">{friends.length?<><label htmlFor="analysis-friend">누구와의 궁합이 궁금한가요?</label><select id="analysis-friend" value={friend?.id||''} onChange={e=>setChosen(e.target.value)}><option value="">상대를 선택해 주세요</option>{friends.map(f=><option key={f.id} value={f.id}>{f.nickname} · {f.mbti}{f.relationship?' · '+f.relationship:''}</option>)}</select>{friend?<a className="primary" href={`/m/${mapId}/analysis/${friend.id}`}>상세 궁합 보기 · 990원 →</a>:<button className="primary" disabled>상대를 선택하면 볼 수 있어요</button>}</>:<p className="muted">친구가 지도에 참여하면 상세 궁합을 볼 수 있어요.</p>}<a className="sample-link" href="/analysis-sample">어떤 내용인지 샘플 먼저 읽기 ↗</a></div></section>;
}
