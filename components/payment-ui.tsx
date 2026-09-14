'use client';
import {useEffect,useState} from 'react';
type Report={summary:string;relationship:string;sections:{title:string;body:string;tip:string}[]};
type TossFactory=(key:string)=>{payment:(o:{customerKey:string})=>{requestPayment:(o:unknown)=>Promise<void>}};
async function toss(){
 const w=window as typeof window&{TossPayments?:TossFactory};if(w.TossPayments)return w.TossPayments;
 await new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src='https://js.tosspayments.com/v2/standard';script.onload=()=>resolve();script.onerror=()=>{script.remove();reject(new Error('결제창을 불러오지 못했어요. 다시 시도해 주세요.'));};document.head.appendChild(script);});
 if(!w.TossPayments)throw new Error('결제창을 불러오지 못했어요.');return w.TossPayments;
}
export function Checkout({mapId,friendId,ownerName,friendName,family}:{mapId:string;friendId:string;ownerName:string;friendName:string;family:boolean}){
 const [state,setState]=useState<{enabled:boolean;mode:string;order?:{id:string;status:string}}|null>(null),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{fetch(`/api/payments/status?mapId=${mapId}&friendId=${friendId}`).then(r=>r.json() as Promise<{enabled:boolean;mode:string;order?:{id:string;status:string}}>).then(setState).catch(()=>setError('연결을 확인한 뒤 새로고침해 주세요.'));},[mapId,friendId]);
 async function pay(){setBusy(true);setError('');try{
  const r=await fetch('/api/payments/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mapId,friendId,consent})});const o=await r.json() as {error:string;orderId:string;amount:number;clientKey:string;mode:string;status:string;orderName:string;customerKey:string};if(!r.ok)throw new Error(o.error);
  if(o.status!=='PENDING'){window.location.assign('/purchases/'+o.orderId);return;}
  const factory=await toss();sessionStorage.setItem('shystar_checkout',`/m/${mapId}/analysis/${friendId}`);
  await factory(o.clientKey).payment({customerKey:o.customerKey}).requestPayment({method:'CARD',amount:{currency:'KRW',value:o.amount},orderId:o.orderId,orderName:o.orderName,successUrl:location.origin+'/payment/success',failUrl:location.origin+'/payment/fail'});
 }catch(e){setError(e instanceof Error?e.message:'결제창을 열지 못했어요.');}finally{setBusy(false);}}
 const chapters=[...(!family?['만약, 우리가 연애를 한다면?']:[]),'우리 사이, 어떤 조합일까?','유독 잘 통하는 순간은?','잘 맞는데, 왜 서운할까?','한 걸음 더 가까워지려면?','다퉜을 때, 어떤 말부터 할까?','다음 만남, 뭘 하면 좋을까?'];
 return <main className="analysis-page"><a className="back-link" href={`/m/${mapId}`}>← 관계 지도로 돌아가기</a><div className="analysis-heading"><span className="pill">상세 궁합</span><h1>{ownerName}님과<br/><em>{friendName}님 사이의 이야기</em></h1><p>두 사람의 유형과 관계에 맞춘 장점, 서운한 순간, 대화 예시를 만나보세요.</p></div><section className="analysis-offer"><h2>우리 사이, 조금 더 자세히</h2><div className="analysis-price">990원 <small>1건 · 1회 결제</small></div><ol className="analysis-toc">{chapters.map((t,i)=><li key={t}><span>0{i+1}</span>{t}</li>)}</ol><p><a href="/analysis-sample">완성된 분석 샘플 먼저 읽기 ↗</a></p><p className="privacy-note">구매 시점의 분석을 저장합니다. 구매한 브라우저에서 1년 동안 다시 열 수 있어요. 쿠키를 삭제하거나 기기를 바꾸면 주문번호와 함께 문의해 주세요.</p><p className="privacy-note">운영: 사이별 · 문의/환불 요청: shystar2465@gmail.com<br/>샘플과 같은 구성의 디지털 콘텐츠입니다. <a href="/rules">이용·환불 안내</a> · <a href="/privacy">개인정보 안내</a></p>{state?.mode==='test'&&<p role="status">테스트 결제입니다. 실제 돈은 청구되지 않습니다.</p>}{state&&!state.enabled?<p role="status">결제 서비스를 준비하고 있어요. 지금은 무료 샘플을 확인해 주세요.</p>:<><label className="privacy-note"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> 상품 구성·가격·재열람 방법을 확인했고, 결제 후 바로 콘텐츠 제공을 요청합니다.</label>{state?.order?<p><a href={'/purchases/'+state.order.id}>이전 주문 상태 확인 / 구매한 분석 다시 보기 →</a></p>:null}<button className="primary" disabled={!state?.enabled||!consent||busy} onClick={pay}>{busy?'결제창을 준비하고 있어요…':state?.mode==='test'?'990원 테스트 결제하기':'990원으로 상세 궁합 보기'}</button></>}{error&&<p role="alert">{error}</p>}</section></main>;
}
export function Purchase({orderId}:{orderId:string}){
 const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(''),[mode,setMode]=useState('');
 async function load(){setError('');try{const r=await fetch('/api/payments/report?orderId='+encodeURIComponent(orderId));const d=await r.json() as {error:string;report:Report;mode:string;url:string};if(!r.ok)throw new Error(d.error);setReport(d.report);setMode(d.mode);}catch(e){setError(e instanceof Error?e.message:'다시 확인해 주세요.');}}
 useEffect(()=>{void load();},[orderId]);
 return <main className="analysis-page"><a href="/">← 사이별 홈</a><h1>구매한 상세 궁합</h1><p className="privacy-note">주문번호: {orderId}</p>{mode==='test'&&<p>테스트 주문 · 실제 결제 없음</p>}{error?<><p role="alert">{error}</p><button className="primary" onClick={load}>주문 상태 다시 확인</button><p>문의: shystar2465@gmail.com</p></>:!report?<p role="status">결제 내역을 확인하고 있어요…</p>:<><p>{report.summary}</p>{report.sections.map((s,i)=><section className="analysis-section" key={s.title}><span className="eyebrow">CHAPTER 0{i+1}</span><h2>{s.title}</h2>{s.body.split('\n\n').map((p,j)=><p key={j}>{p}</p>)}<blockquote>{s.tip}</blockquote></section>)}</>}</main>;
}
export function PaymentReturn({failed=false}:{failed?:boolean}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[back,setBack]=useState('/');
 async function confirm(){setBusy(true);setError('');try{const q=new URLSearchParams(location.search);const r=await fetch('/api/payments/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:q.get('orderId'),paymentKey:q.get('paymentKey'),amount:Number(q.get('amount'))})});const d=await r.json() as {error:string;report:Report;mode:string;url:string};if(!r.ok)throw new Error(d.error);location.replace(d.url);}catch(e){setError(e instanceof Error?e.message:'결제 상태를 확인하지 못했어요.');}finally{setBusy(false);}}
 useEffect(()=>{setBack(sessionStorage.getItem('shystar_checkout')||'/');if(!failed)void confirm();},[failed]);
 return <main className="analysis-page"><h1>{failed?'결제가 완료되지 않았어요':'결제 확인'}</h1>{failed?<p>결제를 취소했거나 인증이 끝나지 않았어요. 주문 화면에서 다시 시도할 수 있어요.</p>:<><p role="status">{busy?'결제 승인 결과를 확인하고 있어요…':error}</p>{error&&<button className="primary" disabled={busy} onClick={confirm}>같은 주문 다시 확인</button>}</>}<p><a href={back}>주문 화면으로 돌아가기</a></p></main>;
}

