import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'사이별 · 우리 사이의 별자리',description:'MBTI로 연결하는 나와 친구들의 관계 지도. 우리만의 별자리를 만들어 보세요.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="ko"><body>{children}</body></html>; }
