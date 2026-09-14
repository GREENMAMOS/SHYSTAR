import {env} from 'cloudflare:workers';
import {rankFriends,type Person,type Friend} from '@/lib/chemistry';
import {ownerToken,tokenHash} from '@/lib/ownership';
type MapRow = {id:string;nickname:string;mbti:string};
export async function createMap(person:Person,ownerHash:string){
  const id=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO maps (id, nickname, mbti, created_at,owner_hash) VALUES (?, ?, ?, ?,?)').bind(id,person.nickname,person.mbti,Date.now(),ownerHash).run();
  return {id};
}
export async function canManage(id:string,request:Request){
 const token=ownerToken(request);if(!token)return false;
 const result=await env.DB.prepare('SELECT id FROM maps WHERE id = ? AND owner_hash = ?').bind(id,await tokenHash(token)).first();
 return Boolean(result);
}
export async function deleteFriend(mapId:string,friendId:string){
 const result=await env.DB.prepare('DELETE FROM friends WHERE map_id = ? AND id = ?').bind(mapId,friendId).run();
 return result.meta.changes>0;
}
export async function readMap(id:string){
  if(!/^[a-f0-9-]{36}$/.test(id))return null;
  const row=await env.DB.prepare('SELECT id, nickname, mbti FROM maps WHERE id = ?').bind(id).first<MapRow>();
  if(!row)return null;
  const {results:friends}=await env.DB.prepare('SELECT id, nickname, mbti, relationship FROM friends WHERE map_id = ? ORDER BY created_at, id').bind(id).all<Friend>();
  return {id:row.id,owner:{nickname:row.nickname,mbti:row.mbti},friends,ranking:rankFriends(row.mbti,friends)};
}
export async function addFriend(mapId:string,person:Person){
  const id=crypto.randomUUID();
  const result=await env.DB.prepare('INSERT INTO friends (id,map_id,nickname,mbti,created_at,relationship) VALUES (?,?,?,?,?,?) ON CONFLICT(map_id,nickname,mbti) DO NOTHING').bind(id,mapId,person.nickname,person.mbti,Date.now(),person.relationship??null).run();
  return result.meta.changes>0;
}
