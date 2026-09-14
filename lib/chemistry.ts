export const MBTI_TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'] as const;
export type Person = { nickname: string; mbti: string; relationship?:string|null };
export type Friend = Person & { id: string };
export const categories = [
  {id:'resonance',label:'같은 주파수',description:'관심사와 판단의 결이 닮아 대화를 이어가기 편한 조합이에요.',color:'#b6a1ff',symbol:'✦'},
  {id:'rhythm',label:'편안한 리듬',description:'익숙한 공통점이 있어 서로의 일상을 이해하기 좋은 조합이에요.',color:'#7ce0cd',symbol:'≈'},
  {id:'spark',label:'반짝 티키타카',description:'생각을 받아들이는 방식은 비슷하지만 선택은 달라, 대화가 다채로워질 수 있어요.',color:'#ffc47c',symbol:'ϟ'},
  {id:'growth',label:'새로운 시선',description:'다른 관점으로 세상을 보면서 서로에게 새로운 질문을 건넬 수 있어요.',color:'#8dbaff',symbol:'↗'},
  {id:'adventure',label:'뜻밖의 모험',description:'차이가 많은 만큼 서로의 방식을 천천히 알아가는 재미가 있는 조합이에요.',color:'#ff9fc6',symbol:'◇'},
] as const;
export const profiles: Record<string,string> = {
  INTJ:'생각을 차곡차곡 쌓아 나만의 길을 만드는 사람',INTP:'익숙한 것에도 새로운 질문을 던지는 사람',ENTJ:'함께 갈 방향을 찾고 첫걸음을 내딛는 사람',ENTP:'대화에 새로운 가능성을 불어넣는 사람',
  INFJ:'말 사이의 마음을 오래 들여다보는 사람',INFP:'작은 순간에도 나만의 의미를 발견하는 사람',ENFJ:'서로의 가능성을 발견하고 응원하는 사람',ENFP:'사람과 가능성 사이를 자유롭게 여행하는 사람',
  ISTJ:'꾸준한 행동으로 믿음을 쌓아가는 사람',ISFJ:'작은 배려로 곁을 따뜻하게 채우는 사람',ESTJ:'복잡한 일에 순서를 만들어주는 사람',ESFJ:'함께하는 순간을 세심하게 챙기는 사람',
  ISTP:'직접 해보며 나만의 답을 찾는 사람',ISFP:'일상의 감각을 나만의 색으로 담는 사람',ESTP:'지금의 기회를 발견하고 움직이는 사람',ESFP:'함께 있는 순간에 생기를 더하는 사람',
};
export function validatePerson(input: unknown): Person {
  if (!input || typeof input !== 'object') throw new Error('별명과 MBTI를 입력해 주세요.');
  const { nickname, mbti } = input as Record<string, unknown>;
  if (typeof nickname !== 'string' || !nickname.trim() || [...nickname.trim()].length > 20 || /[<>\p{Cc}\p{Cf}]/u.test(nickname)) throw new Error('별명은 특수 제어문자 없이 1~20자로 입력해 주세요.');
  if (typeof mbti !== 'string' || !MBTI_TYPES.includes(mbti.toUpperCase() as typeof MBTI_TYPES[number])) throw new Error('MBTI 16가지 유형 중 하나를 선택해 주세요.');
  return { nickname: nickname.trim(), mbti: mbti.toUpperCase() };
}
export function chemistry(a: string, b: string) {
  validatePerson({nickname:'검증',mbti:a}); validatePerson({nickname:'검증',mbti:b});
  a=a.toUpperCase(); b=b.toUpperCase();
  const same = [...a].map((letter,i)=>letter===b[i]);
  const count = same.filter(Boolean).length;
  const category = same[1] && same[2] ? categories[0] : count>=3 ? categories[1] : same[1] ? categories[2] : same[2] ? categories[3] : categories[4];
  const score = 60 + (same[0]?6:8) + (same[1]?12:0) + (same[2]?10:0) + (same[3]?6:4);
  return {score,category,version:'playful-v1'};
}
export function rankFriends(ownerMbti: string, friends: Friend[]) {
  const sorted = friends.map(friend=>({...friend,...chemistry(ownerMbti,friend.mbti)})).sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
  return sorted.map(friend=>({...friend,rank:sorted.findIndex(x=>x.score===friend.score)+1}));
}
