import {buildAnalysis} from '@/lib/analysis';
import {Header,Footer} from '@/components/relationship-app';
import AnalysisPreview from '@/components/analysis-preview';
export default function Sample(){return <div className="site-shell"><Header/><AnalysisPreview report={buildAnalysis({nickname:'별이',mbti:'ENFP'},{nickname:'윤슬',mbti:'INTJ',relationship:'친구'})} owner={{nickname:'별이',mbti:'ENFP'}} friend={{nickname:'윤슬',mbti:'INTJ',relationship:'친구'}} backUrl="/"/><Footer/></div>;}

