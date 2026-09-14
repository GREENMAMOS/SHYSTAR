import type {Person} from './chemistry';
import {analysisDetails} from './analysis-details.ts';
import {personalizedParagraphs} from './analysis-personalization.ts';
import {getPairStory} from './pair-stories.ts';
import {validateRelationship} from './relationships.ts';
export function buildAnalysis(owner:Person,friend:Person){
 const [sameEnergy,sameView,sameDecision,samePlan]=[0,1,2,3].map(i=>owner.mbti[i]===friend.mbti[i]);
 const relationship=validateRelationship(friend.relationship)||'아직 알아가는 사이';
 const pair=getPairStory(owner.mbti,friend.mbti);
 const intros=personalizedParagraphs(owner,friend,relationship);
 const situation=relationship==='동료'?'업무를 함께 진행할 때':relationship==='선후배'?'조언을 주고받을 때':relationship==='가족'?'집안일과 일정을 나눌 때':relationship==='연인'?'데이트와 연락 방식을 정할 때':relationship==='지인'?'다음 만남을 제안할 때':'함께 보낼 시간을 정할 때';
 const romanticSection=relationship==='가족'?[]:[{title:relationship==='연인'?'우리 연애, 더 잘 맞춰가려면?':'만약, 우리가 연애를 한다면?',tip:'“나는 이런 표현이 좋더라. 너는 언제 가장 사랑받는다고 느껴?”'}];
 return {mode:'sample' as const,price:990,version:'editorial-pairs-v3',summary:owner.mbti+' × '+friend.mbti+' — '+pair.strength+'에서 서로의 장점을 발견해 보세요.',relationship,sections:[
  ...romanticSection,
  {title:'우리 사이, 어떤 조합일까?',tip:'“우리에게 실제로 맞는 부분은 어디일까?”'},
  {title:'유독 잘 통하는 순간은?',tip:`${situation}, 먼저 서로 기대하는 것을 하나씩 말해 보세요.`},
  {title:'잘 맞는데, 왜 서운할까?',tip:'차이를 애정이나 성의의 부족으로 바로 해석하지 않기.'},
  {title:'한 걸음 더 가까워지려면?',tip:'“지금 잠깐 이야기해도 괜찮아? 네 생각을 듣고 싶어.”'},
  {title:'다퉜을 때, 어떤 말부터 할까?',tip:'“나는 이렇게 느꼈어. 너는 어떤 상황이었어? 다음에는 어떻게 해볼까?”'},
  {title:'다음 만남, 뭘 하면 좋을까?',tip:'다음 만남에서 실천할 작은 약속 하나만 정하기.'},
 ].map(section=>({...section,body:[intros[section.title],...analysisDetails({sameEnergy,sameView,sameDecision,samePlan,relationship,situation})[section.title]].join('\n\n')}))};
}




