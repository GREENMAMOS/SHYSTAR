export function ownerToken(request:Request){
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('shystar_owner='))?.slice(14);
 return token&&/^[a-f0-9]{64}$/.test(token)?token:null;
}
export async function tokenHash(token:string){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export function createToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');}
export function ownerCookie(token:string,request:Request){return `shystar_owner=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
