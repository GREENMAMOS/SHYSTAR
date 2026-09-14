import {canManage,deleteFriend,readMap} from '@/db/maps';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string;friendId:string}>}){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'같은 사이트에서 다시 시도해 주세요.'},{status:403});
 try{
  const {id,friendId}=await params;
  if(!await canManage(id,request))return Response.json({error:'지도를 만든 브라우저에서만 삭제할 수 있어요.'},{status:403});
  if(!await deleteFriend(id,friendId))return Response.json({error:'이미 삭제되었거나 없는 친구예요.'},{status:404});
  return Response.json(await readMap(id),{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'삭제하지 못했어요. 잠시 뒤 다시 시도해 주세요.'},{status:503});}
}
