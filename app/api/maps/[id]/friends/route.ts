import {addFriend,readMap} from '@/db/maps';
import {validatePerson} from '@/lib/chemistry';
import {validateRelationship} from '@/lib/relationships';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'같은 사이트에서 다시 시도해 주세요.'},{status:403});
 let person;
 try{
  const text=await request.text();if(text.length>2048)throw new Error('입력 내용이 너무 길어요.');
  const input=JSON.parse(text);
  person={...validatePerson(input),relationship:validateRelationship(input.relationship)};
 }catch(e){return Response.json({error:e instanceof SyntaxError?'입력 내용을 확인해 주세요.':e instanceof Error?e.message:'입력 내용을 확인해 주세요.'},{status:400});}
 try{
  const {id}=await params;
  if(!await readMap(id))return Response.json({error:'지도를 찾을 수 없어요.'},{status:404});
  if(!await addFriend(id,person))return Response.json({error:'같은 별명과 MBTI가 이미 등록되어 있어요.'},{status:409});
  return Response.json(await readMap(id),{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Friend registration failed',e);return Response.json({error:'친구를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'},{status:503});}
}
