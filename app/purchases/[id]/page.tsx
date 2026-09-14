import {Header,Footer} from '@/components/relationship-app';
import {Purchase} from '@/components/payment-ui';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <div className="site-shell"><Header/><Purchase orderId={id}/><Footer/></div>;}
