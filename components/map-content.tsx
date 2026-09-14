'use client';
import {useEffect,useState} from 'react';
import {ChemistryGuide,AnalysisInvitation} from '@/components/map-analysis-invitation';
import {Constellation,PersonForm,type MapData} from '@/components/relationship-app';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel} from '@/components/ui/alert-dialog';
import {categories,rankFriends,type Person} from '@/lib/chemistry';
export default function MapContent({initialMap}:{initialMap:MapData}){
 const [map,setMap]=useState(initialMap);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [formKey,setFormKey]=useState(0);
 const [canManage,setCanManage]=useState(false);
 const [deleting,setDeleting]=useState<{id:string;nickname:string}|null>(null);
 useEffect(()=>{let active=true;fetch(`/api/maps/${initialMap.id}/manage`).then(r=>r.json()).then(data=>{if(active)setCanManage((data as {canManage?:boolean}).canManage===true);}).catch(()=>{});return()=>{active=false;};},[initialMap.id]);
 async function remove(){
  if(!deleting||busy)return;setBusy(true);setError('');
  try{const response=await fetch(`/api/maps/${map.id}/friends/${deleting.id}`,{method:'DELETE'});const data=await response.json() as MapData&{error?:string};if(!response.ok)throw new Error(data.error||'삭제하지 못했어요.');setMap(data);setNotice(`${deleting.nickname}님의 별을 삭제했어요.`);setDeleting(null);}
  catch(e){setError(e instanceof Error?e.message:'삭제하지 못했어요.');setDeleting(null);}finally{setBusy(false);}
 }
 const ranked=rankFriends(map.owner.mbti,map.friends);
 async function join(person:Person){
  if(busy)return;setBusy(true);setError('');setNotice('');
  try{
   const response=await fetch(`/api/maps/${map.id}/friends`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(person)});
   const data=await response.json() as MapData&{error?:string};
   if(!response.ok)throw new Error(data.error||'등록하지 못했어요.');
   setMap(data);setFormKey(key=>key+1);setNotice(`${person.nickname}님의 별이 연결됐어요. 지도와 케미 순위를 확인해 보세요.`);
  }catch(e){setError(e instanceof Error?e.message:'등록하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}
 }
 return <><AlertDialog open={Boolean(deleting)} onOpenChange={open=>{if(!open&&!busy)setDeleting(null);}}><AlertDialogContent className="delete-dialog"><AlertDialogTitle>{deleting?.nickname}님의 별을 삭제할까요?</AlertDialogTitle><AlertDialogDescription>별명·MBTI·관계가 지도와 저장소에서 삭제돼요. 다시 참여할 수 있지만 이 작업은 되돌릴 수 없어요.</AlertDialogDescription><div className="map-actions"><AlertDialogCancel disabled={busy} className="secondary">취소</AlertDialogCancel><button className="secondary danger" disabled={busy} onClick={remove}>{busy?'삭제 중…':'삭제하기'}</button></div></AlertDialogContent></AlertDialog><div className="map-layout"><section className="map-main"><Constellation map={map}/>
  <div className="legend">{categories.map(category=><span key={category.id} style={{color:category.color}}>{category.symbol} {category.label} {ranked.filter(friend=>friend.category.id===category.id).length}</span>)}</div>
  {canManage&&<p className="management-note">내 지도 관리 · 잘못 등록된 친구는 삭제할 수 있어요. 관리 권한은 이 브라우저에 저장돼요.</p>}<div className="rank-header"><h2>함께하는 별 <span>{ranked.length}명</span></h2><span>케미 높은 순</span></div>
  {ranked.length?<ol className="rank-list" aria-label="친구 케미 순위">{ranked.map(friend=><li className="rank-row" key={friend.id}><span className="rank-number" aria-label={`${friend.rank}위`}>{friend.rank}</span><span className="friend-icon" style={{color:friend.category.color,background:friend.category.color+'15'}} aria-hidden="true">{friend.category.symbol}</span><div className="friend-info"><strong>{friend.nickname}</strong><small>{friend.mbti}{friend.relationship&&<> · {friend.relationship}</>}</small><p style={{color:friend.category.color}}>{friend.category.label}</p><a className="analysis-link" href={`/m/${map.id}/analysis/${friend.id}`}>상세 궁합 보기 · 990원 <span>↗</span></a></div><span className="score">{friend.score}<small>점</small></span>{canManage&&<button className="delete-friend" type="button" disabled={busy} aria-label={`${friend.nickname} 삭제`} onClick={()=>setDeleting(friend)}>삭제</button>}</li>)}</ol>:<div className="empty-state"><strong>첫 번째 친구를 기다리고 있어요.</strong>이 지도에 참여하면 우리 사이의 케미가 나타나요.</div>}
  <details className="method"><summary>관계 이름과 점수는 어떻게 정하나요?</summary><p>네 가지 MBTI 선호의 공통점과 차이를 자체 규칙으로 조합해요. 같은 조합은 항상 같은 점수이며, 동점은 같은 순위예요. 실제 관계를 예측하는 검사는 아니에요.</p>{categories.map(category=><p key={category.id} style={{marginTop:12}}><strong style={{color:category.color}}>{category.symbol} {category.label}</strong><br/>{category.description}</p>)}</details>
 </section><aside className="map-sidebar"><section className="side-card"><div className="card-kicker">ONE MORE STAR <span>✦</span></div><h2>우리는 어떤 사이일까?</h2><p className="muted">내 정보를 입력하고 {map.owner.nickname}님의 지도에 참여해 보세요.</p><PersonForm showRelationship key={formKey} label="지도에 내 별 추가하기" onSubmit={join} busy={busy}/>{error&&<p className="error" role="alert">{error}</p>}<p className="notice" role="status">{notice}</p></section><ChemistryGuide/></aside></div><AnalysisInvitation mapId={map.id} ownerName={map.owner.nickname} friends={ranked}/></>;
}





