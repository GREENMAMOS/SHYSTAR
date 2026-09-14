'use client';
import {useState} from 'react';
import {ArrowUpRight, Sparkles, ArrowRight, Link2, Orbit} from 'lucide-react';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {RELATIONSHIPS} from '@/lib/relationships';
import {MBTI_TYPES,profiles,rankFriends,type Person,type Friend} from '@/lib/chemistry';
export type MapData = {id:string;owner:Person;friends:Friend[]};
const example:MapData = {id:'demo',owner:{nickname:'별이',mbti:'ENFP'},friends:[{id:'a',nickname:'윤슬',mbti:'INFJ'},{id:'b',nickname:'하루',mbti:'INTJ'},{id:'c',nickname:'도담',mbti:'ENFP'},{id:'d',nickname:'여름',mbti:'ISTP'},{id:'e',nickname:'소이',mbti:'ESFJ'}]};
export function PersonForm({label,onSubmit,busy=false,showRelationship=false}:{label:string;onSubmit:(person:Person)=>void;busy?:boolean;showRelationship?:boolean}){
  const [relationship,setRelationship]=useState('');
  const [nickname,setNickname]=useState(''); const [mbti,setMbti]=useState('');
  return <form onSubmit={e=>{e.preventDefault();if(mbti)onSubmit({nickname,mbti,...(showRelationship?{relationship:relationship||null}:{})});}}>
    <label className="field-label" htmlFor="nickname">별명 <span>실명 대신 별명으로 만나요</span></label>
    <input id="nickname" name="nickname" maxLength={20} required placeholder="어떤 이름으로 불러드릴까요?" value={nickname} onChange={e=>setNickname(e.target.value)} autoComplete="off"/>
    <div className="field-label" id="mbti-label">내 MBTI <span>아는 유형을 골라 주세요</span></div>
    <RadioGroup className="mbti-grid" aria-labelledby="mbti-label" value={mbti} onValueChange={value=>setMbti(String(value))}>
      {MBTI_TYPES.map(type=><label className={`mbti-choice ${mbti===type?'chosen':''}`} key={type}><RadioGroupItem value={type} aria-label={type}/><span>{type}</span></label>)}
    </RadioGroup>
    <p className="selection-note">{mbti?profiles[mbti]:'MBTI를 몰라도 괜찮아요. 확인한 뒤 다시 와 주세요.'}</p>
    <a className="personality-test-link" href="https://www.16personalities.com/ko" target="_blank" rel="noopener noreferrer">무료 성격유형 검사하기 · 16Personalities <ArrowUpRight size={15}/><span className="sr-only"> (새 탭에서 열기)</span></a>
    <p className="test-note">무료 성격유형 검사예요. 소요 시간 약 10분</p>
    {showRelationship&&<><div className="field-label" id="relationship-label">지도 주인과 어떤 사이인가요? <span>선택 사항</span></div><RadioGroup className="mbti-grid" aria-labelledby="relationship-label" value={relationship} onValueChange={value=>setRelationship(String(value))}>{['',...RELATIONSHIPS].map(item=><label className={`mbti-choice ${relationship===item?'chosen':''}`} key={item}><RadioGroupItem value={item} aria-label={item||'선택 안 함'}/><span>{item||'선택 안 함'}</span></label>)}</RadioGroup></>}
    <p className="privacy-note">별명과 MBTI{showRelationship?'·선택한 관계':''}는 지도에 저장되며, 공유 링크를 가진 사람이 볼 수 있어요. 본인 정보만 입력해 주세요. <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보 안내 ↗</a></p>
    <button className="primary" disabled={busy||!mbti||!nickname.trim()} type="submit">{busy?'별을 연결하는 중…':label}<ArrowRight size={18}/></button>
  </form>;
}
export function Constellation({map,demo=false}:{map:MapData;demo?:boolean}){
  const friends=rankFriends(map.owner.mbti,map.friends);
  return <div className="constellation" aria-label={`${map.owner.nickname}님의 관계 지도, 친구 ${friends.length}명`}>
    <div className="map-top"><span><span className="live-dot"/> {demo?'미리 보는 관계 지도':'우리만의 별자리'}</span><Orbit size={18}/></div>
    <svg viewBox="0 0 600 440" role="img" aria-label="중앙의 나와 주변 친구들이 연결된 별자리. 자세한 정보는 아래 케미 순위에서 볼 수 있어요.">
      <defs><radialGradient id="glow"><stop stopColor="#a58dff" stopOpacity=".2"/><stop offset="1" stopColor="#a58dff" stopOpacity="0"/></radialGradient></defs>
      <circle cx="300" cy="220" r="205" fill="url(#glow)"/>
      {[90,150,205].map(r=><circle key={r} cx="300" cy="220" r={r} fill="none" stroke="#ffffff" strokeOpacity=".08" strokeDasharray="3 7"/>)}
      {Array.from({length:28},(_,i)=><circle key={i} cx={(i*137+25)%580+10} cy={(i*83+27)%420+10} r={i%3===0?1.5:1} fill="#c9c5ec" opacity=".35"/>)}
      {friends.slice(0,12).map((f,i)=>{const a=(-100+i*360/Math.max(friends.slice(0,12).length,1))*Math.PI/180;const r=112+(96-f.score)*2;const x=300+Math.cos(a)*r,y=220+Math.sin(a)*r;return <g key={f.id}><line x1="300" y1="220" x2={x} y2={y} stroke={f.category.color} strokeOpacity=".38"/><circle cx={x} cy={y} r="21" fill="#1c233b" stroke={f.category.color} strokeOpacity=".6"/><text x={x} y={y+6} textAnchor="middle" fill={f.category.color} fontSize="20">{f.category.symbol}</text><text x={x} y={y+44} textAnchor="middle" fill="#f4f1ff" fontSize="15">{[...f.nickname].slice(0,5).join('')}{[...f.nickname].length>5?'…':''}</text><text x={x} y={y+62} textAnchor="middle" fill="#adb5d0" fontSize="12">{f.mbti} · {f.score}</text></g>})}
      <circle cx="300" cy="220" r="40" fill="#9e88f6" fillOpacity=".12" stroke="#bba9ff" strokeOpacity=".45"/><circle cx="300" cy="220" r="29" fill="#b6a1ff"/>
      <text x="300" y="228" textAnchor="middle" fill="#17152c" fontSize="23">✦</text><text x="300" y="280" textAnchor="middle" fill="#fff" fontSize="16">{map.owner.nickname} · 나</text>
    </svg>
    <p className="map-caption">{friends.length?'가까운 별일수록 케미 점수가 높아요':'아직은 나만의 별. 친구가 오면 선이 이어져요.'}{friends.length>12?' · 지도에는 상위 12명 표시':''}</p>
  </div>;
}
export default function RelationshipApp(){
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function create(person:Person){setBusy(true);setError('');try{const response=await fetch('/api/maps',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(person)});const data=await response.json() as {id?:string;error?:string};if(!response.ok||!data.id)throw new Error(data.error||'지도를 만들지 못했어요. 다시 시도해 주세요.');window.location.assign(`/m/${data.id}`);}catch(e){setError(e instanceof Error?e.message:'지도를 만들지 못했어요. 다시 시도해 주세요.');setBusy(false);}}
  return <div className="site-shell"><Header/><main className="home-layout"><section className="intro"><div className="eyebrow"><Sparkles size={14}/> MBTI RELATIONSHIP MAP</div><h1>우리 사이에도<br/><em>별자리</em>가 있어.</h1><p className="lead">닮아서 편한 친구, 달라서 재밌는 친구.<br/>흩어진 우리를 하나의 지도로 연결해 보세요.</p><Constellation map={example} demo/><div className="home-foot"><span>01 나의 별 만들기</span><span>02 친구 초대하기</span><span>03 우리 사이 발견하기</span></div></section><section className="create-card"><div className="card-kicker">YOUR FIRST STAR <span>✦</span></div><h2>어떤 별에서 왔나요?</h2><p className="muted">별명과 MBTI, 두 가지만 알려 주세요.</p><PersonForm label="내 관계 지도 만들기" onSubmit={create} busy={busy}/>{error&&<p role="alert" className="error">{error}</p>}<div className="card-bottom"><Link2 size={15}/> 가입 없이 만들고, 링크 하나로 함께해요</div></section></main><Footer/></div>;
}
export function Header(){return <header className="header"><a className="brand" href="/" aria-label="사이별 홈"><span>✳</span> 사이별 <small>SHYSTAR</small></a><span className="header-note">나와 너, 그 사이의 발견 <ArrowUpRight size={15}/></span></header>;}
export function Footer(){return <footer className="footer"><span>✳ 사이별</span><p>MBTI 케미는 자체 규칙으로 만든 재미용 콘텐츠예요.<br/>실제 관계의 좋고 나쁨이나 심리학적 궁합을 예측하지 않아요.</p><div><span>조금 다른 우리, 함께 빛나기.</span><nav className="footer-links" aria-label="운영 안내"><a href="/privacy">개인정보 안내</a><a href="/rules">이용·운영 기준</a></nav></div></footer>;}



