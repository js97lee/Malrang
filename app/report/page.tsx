'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import EmotionDonutChart from '@/components/report/EmotionDonutChart';
import EmotionTrendChart from '@/components/report/EmotionTrendChart';
import HighlightMoment from '@/components/report/HighlightMoment';
import { generateMonthlyReport } from '@/lib/analytics/emotionAggregator';
import { getTodayConversation, conversationToRecord, getAllConversations } from '@/lib/utils/conversationStorage';
import mockRecords from '@/data/mockRecords.json';
import { Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';

const emotionColors: { [key: string]: string } = {
  joy: '#FBBF24',
  sadness: '#60A5FA',
  anger: '#F87171',
  fear: '#A78BFA',
  surprise: '#34D399',
  love: '#FB7185',
  peace: '#4ADE80',
  excitement: '#F59E0B',
};

export default function ReportPage() {
  const router = useRouter();
  const [todayConversation, setTodayConversation] = useState<any>(null);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  
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
  
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
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
        <Header />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {new Date(currentMonth + '-01').toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
              })}
            </h2>
            <p className="text-gray-700 text-sm font-medium">
              총 {report.totalRecords}개의 기록
              {todayConversation && (
                <span className="ml-2 text-primary-600">• 오늘의 대화 포함</span>
              )}
            </p>
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

          {/* 감정 도넛 차트 */}
          {report.emotions.length > 0 && (
            <div className="bg-surface rounded-material-md p-6">
              <h3 className="font-semibold text-gray-700 mb-4">이달의 감정</h3>
              <div className="flex justify-center mb-6">
                <EmotionDonutChart emotions={report.emotions} />
              </div>
              <div className="space-y-2">
                {report.emotions.map((emotion) => (
                  <div key={emotion.emotion} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: emotionColors[emotion.emotion] || '#9CA3AF' }}
                      />
                      <span className="text-sm text-gray-700 font-medium">{emotion.emotion}</span>
                    </div>
                    <span className="text-sm font-semibold">{emotion.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 감정 추이 */}
          <div className="bg-surface rounded-material-md p-6">
            <EmotionTrendChart emotions={report.emotions} days={30} />
          </div>

          {/* 키워드 */}
          <div className="bg-surface rounded-material-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">이달의 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {report.keywords.map((keyword) => (
                <Tag key={keyword}>{keyword}</Tag>
              ))}
            </div>
          </div>

          {/* 하이라이트 */}
          {todayHighlight ? (
            <HighlightMoment record={todayHighlight} />
          ) : report.highlightMoment ? (
            <HighlightMoment record={report.highlightMoment} />
          ) : null}
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

