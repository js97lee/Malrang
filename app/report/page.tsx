'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
import EmotionDonutChart from '@/components/report/EmotionDonutChart';
import EmotionFlowChart from '@/components/report/EmotionFlowChart';
import EmotionNotebook from '@/components/report/EmotionNotebook';
import HighlightMoment from '@/components/report/HighlightMoment';
import { generateMonthlyReport } from '@/lib/analytics/emotionAggregator';
import { getTodayConversation, conversationToRecord, getAllConversations } from '@/lib/utils/conversationStorage';
import mockRecords from '@/data/mockRecords.json';
import { Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';

const emotionColors: { [key: string]: string } = {
  joy: '#FBBF24', // 노랑
  sadness: '#3B82F6', // 파랑
  anger: '#F97316', // 주황
  fear: '#1F2937', // 검정
  surprise: '#1F2937', // 검정
  love: '#F97316', // 주황
  peace: '#22C55E', // 초록
  excitement: '#FBBF24', // 노랑
};

const emotionLabels: { [key: string]: string } = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '화남',
  fear: '두려움',
  surprise: '놀람',
  love: '사랑',
  peace: '평온',
  excitement: '흥분',
};

export default function ReportPage() {
  const router = useRouter();
  const [todayConversation, setTodayConversation] = useState<any>(null);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  
  useEffect(() => {
    // 오늘의 대화 가져오기
    const conversation = getTodayConversation();
    if (conversation) {
      setTodayConversation(conversation);
    }
    
    // 모든 대화를 Record로 변환
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    
    // Mock 데이터와 합치기
    const combinedRecords = [...conversationRecords, ...(mockRecords as Record[])];
    setAllRecords(combinedRecords);
  }, []);

  const handlePreviousMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(currentMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date.toISOString().substring(0, 7));
  };
  const report = useMemo(
    () => generateMonthlyReport(allRecords, currentMonth),
    [allRecords, currentMonth]
  );
  
  // 오늘의 대화가 있으면 하이라이트로 표시
  const todayHighlight = useMemo(() => {
    if (!todayConversation) return null;
    return conversationToRecord(todayConversation);
  }, [todayConversation]);

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <PageHeader title="감정리포트" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-6 pb-6 space-y-6">
          <div className="bg-primary-50 px-4 py-4 rounded-full">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                title="이전 달"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {new Date(currentMonth + '-01').toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </h2>
                <p className="text-gray-700 text-xs font-medium mt-1">
                  총 {allRecords.length}개의 기록
                  {report.totalRecords > 0 && (
                    <span className="ml-2 text-primary-600">• 이번 달 {report.totalRecords}개</span>
                  )}
                  {todayConversation && (
                    <span className="ml-2 text-primary-600">• 오늘의 대화 포함</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                title="다음 달"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 오늘의 대화 하이라이트 */}
          {todayHighlight && (
            <div className="bg-primary-50 rounded-material-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-800">오늘의 대화</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">질문</p>
                  <p className="text-gray-900 mb-3">{todayHighlight.question}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">요약</p>
                  <p className="text-gray-800 mb-3">{todayHighlight.summary}</p>
                </div>
                {todayHighlight.emotions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">감정</p>
                    <div className="flex flex-wrap gap-2">
                      {todayHighlight.emotions.map((emotion: string) => (
                        <Tag key={emotion}>{emotion}</Tag>
                      ))}
                    </div>
                  </div>
                )}
                {todayHighlight.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">키워드</p>
                    <div className="flex flex-wrap gap-2">
                      {todayHighlight.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 나의 감정 기록 노트 */}
          <EmotionNotebook records={allRecords} />

          {/* 감정 흐름 */}
          <EmotionFlowChart records={allRecords} days={365} showRepeatingThoughts={false} />

          {/* 키워드 */}
          <div className="bg-gray-50 rounded-material-md p-6 border border-gray-200" style={{ boxShadow: 'none' }}>
            <h3 className="font-bold text-gray-900 mb-4">이달의 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {report.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-gray-900 border border-amber-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 하이라이트 */}
          {todayHighlight ? (
            <HighlightMoment record={todayHighlight} />
          ) : report.highlightMoment ? (
            <HighlightMoment record={report.highlightMoment} />
          ) : null}

          {/* 반복되는 생각 */}
          <EmotionFlowChart records={allRecords} days={365} showEmotionFlow={false} showRepeatingThoughts={true} />
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

