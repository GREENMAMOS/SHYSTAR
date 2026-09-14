import {readMap} from '@/db/maps';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const map=await readMap((await params).id);
    return Response.json(map??{error:'지도를 찾을 수 없어요.'},{status:map?200:404,headers:{'Cache-Control':'no-store'}});
  }catch(error){console.error('Map read failed',error);return Response.json({error:'지도를 불러오지 못했어요.'},{status:503});}
}
