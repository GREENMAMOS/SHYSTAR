import {readMap} from '@/db/maps';
import {notFound} from 'next/navigation';
import {Header,Footer} from '@/components/relationship-app';
import {Checkout} from '@/components/payment-ui';
export const dynamic='force-dynamic';
export default async function AnalysisPage({params}:{params:Promise<{id:string;friendId:string}>}){
 const {id,friendId}=await params;const map=await readMap(id);const friend=map?.friends.find(x=>x.id===friendId);
 if(!map||!friend)notFound();
 return <div className="site-shell"><Header/><Checkout mapId={id} friendId={friendId} ownerName={map.owner.nickname} friendName={friend.nickname} family={friend.relationship==='가족'}/><Footer/></div>;
}
