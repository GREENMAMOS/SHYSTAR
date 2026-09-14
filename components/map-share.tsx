'use client';
import {useEffect,useState} from 'react';
import {Link2,Share2} from 'lucide-react';

export default function MapShare({id,nickname}:{id:string;nickname:string}){
 const [url,setUrl]=useState('');
 const [local,setLocal]=useState(false);
 const [canShare,setCanShare]=useState(false);
 const [manual,setManual]=useState(false);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  setUrl(new URL(`/m/${encodeURIComponent(id)}`,window.location.origin).href);
  setLocal(['localhost','127.0.0.1','[::1]'].includes(window.location.hostname));
  setCanShare(typeof navigator.share==='function');
 },[id]);
 async function copy(){
  if(!url||busy)return;
  setBusy(true);setMessage('');
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(url);
   setManual(false);setMessage('지도 링크를 복사했어요.');
  }catch{setManual(true);setMessage('아래 주소를 길게 누르거나 선택해서 복사해 주세요.');}
  finally{setBusy(false);}
 }
 async function share(){
  if(!url||busy)return;
  setBusy(true);setMessage('');
  try{await navigator.share({title:`${nickname}님의 관계 지도 · SHYSTAR`,text:'우리 사이의 케미는 어떨까? 내 별을 추가해 봐요.',url});}
  catch(error){if(!(error instanceof Error&&error.name==='AbortError')){setManual(true);setMessage('공유창을 열지 못했어요. 아래 주소를 복사해 주세요.');}}
  finally{setBusy(false);}
 }
 return <section className="share-panel" aria-label="지도 공유">
  <div className="share-heading"><div><h2>우리 별자리에 초대해요</h2><p>링크에서 별명과 MBTI를 입력하면 같은 지도에 참여할 수 있어요.</p></div><div className="map-actions"><button type="button" className="secondary" onClick={copy} disabled={!url||busy}><Link2 size={16}/>링크 복사</button>{canShare&&<button type="button" className="secondary" onClick={share} disabled={!url||busy}><Share2 size={16}/>공유하기</button>}</div></div>
  {local&&<p className="share-local">지금은 이 컴퓨터에서만 열리는 미리보기예요. 친구에게 보내려면 사이트 공개가 필요해요.</p>}
  {manual&&<label className="share-fallback">지도 주소<input aria-label="복사할 지도 주소" readOnly value={url} onFocus={event=>event.currentTarget.select()}/></label>}
  <p className="notice" role="status">{message}</p>
 </section>;
}
