import {readMap} from '@/db/maps';
import {notFound} from 'next/navigation';
import {Header,Footer} from '@/components/relationship-app';
import MapContent from '@/components/map-content';
import MapShare from '@/components/map-share';
import {profiles} from '@/lib/chemistry';
export const dynamic='force-dynamic';
export default async function MapPage({params}:{params:Promise<{id:string}>}){
  const map=await readMap((await params).id);
  if(!map)notFound();
  return <div className="site-shell"><Header/><main>
    <section className="map-heading"><div><div className="eyebrow">MY FIRST CONSTELLATION</div><h1>{map.owner.nickname}님의 <em>관계 지도</em></h1><p className="map-summary"><span className="pill">{map.owner.mbti}</span> {profiles[map.owner.mbti]}</p></div><a className="secondary" href="/">새 지도 만들기</a></section>
    <MapShare id={map.id} nickname={map.owner.nickname}/>
    <MapContent initialMap={map}/>
  </main><Footer/></div>;
}

