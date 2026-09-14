import {createMap} from '@/db/maps';
import {validatePerson} from '@/lib/chemistry';
import {ownerToken,createToken,tokenHash,ownerCookie} from '@/lib/ownership';
export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin)return Response.json({error:'같은 사이트에서 다시 시도해 주세요.'},{status:403});
  let person;
  try{
    const body=await request.text();
    if(body.length>2048)throw new Error('입력 내용이 너무 길어요.');
    person=validatePerson(JSON.parse(body));
  }catch(error){return Response.json({error:error instanceof SyntaxError?'입력 내용을 확인해 주세요.':error instanceof Error?error.message:'입력 내용을 확인해 주세요.'},{status:400});}
  try{const token=ownerToken(request)||createToken();return Response.json(await createMap(person,await tokenHash(token)),{status:201,headers:{'Cache-Control':'no-store','Set-Cookie':ownerCookie(token,request)}});}
  catch(error){console.error('Map creation failed',error);return Response.json({error:'지도를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'},{status:503});}
}
