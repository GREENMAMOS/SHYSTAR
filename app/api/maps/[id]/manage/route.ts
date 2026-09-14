import {canManage} from '@/db/maps';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 try{return Response.json({canManage:await canManage((await params).id,request)},{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'관리 권한을 확인하지 못했어요.'},{status:503});}
}
