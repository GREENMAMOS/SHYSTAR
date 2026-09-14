export const RELATIONSHIPS=['친구','선후배','동료','지인','가족','연인','기타'] as const;
export function validateRelationship(value:unknown):string|null{
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='string'||!RELATIONSHIPS.includes(value as typeof RELATIONSHIPS[number]))throw new Error('관계 항목 중 하나를 선택해 주세요.');
 return value;
}
