'use client';

import React from 'react';
import { Record, Emotion } from '@/lib/types';

interface EmotionFlowChartProps {
  records: Record[];
  days?: number;
  showEmotionFlow?: boolean;
  showRepeatingThoughts?: boolean;
}

const emotionColors: { [key in Emotion]: string } = {
  joy: '#FBBF24', // 노랑
  sadness: '#3B82F6', // 파랑
  anger: '#F97316', // 주황
  fear: '#1F2937', // 검정
  surprise: '#1F2937', // 검정
  love: '#F97316', // 주황
  peace: '#22C55E', // 초록
  excitement: '#FBBF24', // 노랑
};

const emotionLabels: { [key in Emotion]: string } = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '화남',
  fear: '두려움',
  surprise: '놀람',
  love: '사랑',
  peace: '평온',
  excitement: '흥분',
};

export default function EmotionFlowChart({ records, days = 30, showEmotionFlow = true, showRepeatingThoughts = true }: EmotionFlowChartProps) {
  // 디버깅: 데이터 확인
  console.log('📊 EmotionFlowChart 데이터:', {
    totalRecords: records.length,
    days,
    recordsWithEmotions: records.filter(r => r.emotions && r.emotions.length > 0).length,
  });

  // 모든 기록에서 감정 추출 (감정 기록 노트와 동일한 데이터 사용)
  const allEmotionsSet = new Set<Emotion>();
  records.forEach(record => {
    if (record.emotions && record.emotions.length > 0) {
      record.emotions.forEach(emotion => {
        allEmotionsSet.add(emotion);
      });
    }
  });

  // 최근 N일의 기록만 필터링 (또는 모든 기록 사용)
  const recentRecords = records
    .filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      if (isNaN(recordDate.getTime())) return false;
      
      // 최근 N일 필터링 (days가 0보다 클 때만)
      if (days > 0) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        daysAgo.setHours(0, 0, 0, 0); // 시간 초기화
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= daysAgo;
      }
      return true; // days가 0이면 모든 기록 사용
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('📊 필터링된 기록:', {
    recentRecordsCount: recentRecords.length,
    dates: recentRecords.map(r => r.date),
  });

  // 날짜별 감정 집계
  const emotionByDate: { [date: string]: { [emotion: string]: number } } = {};
  
  recentRecords.forEach(record => {
    const dateKey = record.date;
    if (!emotionByDate[dateKey]) {
      emotionByDate[dateKey] = {};
    }
    record.emotions.forEach(emotion => {
      emotionByDate[dateKey][emotion] = (emotionByDate[dateKey][emotion] || 0) + 1;
    });
  });

  const dates = Object.keys(emotionByDate).sort();
  
  console.log('📊 날짜별 감정 집계:', {
    datesCount: dates.length,
    dates,
    emotionByDate,
  });
  
  // 감정 기록 노트와 동일한 감정 목록 사용 (모든 감정 포함)
  const emotionList = Array.from(allEmotionsSet) as Emotion[];
  const maxValue = dates.length > 0 
    ? Math.max(...dates.map(date => 
        Object.values(emotionByDate[date]).reduce((sum, count) => sum + count, 0)
      ), 1)
    : 1;
  
  console.log('📊 그래프 데이터:', {
    emotionList,
    maxValue,
    datesCount: dates.length,
  });

  // 반복되는 생각 패턴 분석
  const thoughtPatterns: { [keyword: string]: number } = {};
  recentRecords.forEach(record => {
    record.tags.forEach(tag => {
      thoughtPatterns[tag] = (thoughtPatterns[tag] || 0) + 1;
    });
  });

  const topThoughts = Object.entries(thoughtPatterns)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 막대 그래프를 위한 좌표 계산
  const chartHeight = 200;
  const baseWidth = 400;
  const calculatedWidth = Math.max(baseWidth, dates.length * 40);
  const chartWidth = calculatedWidth;
  const padding = 50;
  const barWidth = 8; // 막대 굵기를 얇게 고정
  const barSpacing = dates.length > 0 ? (chartWidth - padding * 2) / dates.length : 50;

  const getY = (value: number) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - padding * 2));
  };

  const getX = (index: number) => {
    if (dates.length === 0) return padding;
    return padding + (index * barSpacing) + (barSpacing / 2) - (barWidth / 2);
  };

  return (
    <div className="space-y-6">
      {/* 감정 흐름 차트 - 막대 그래프 */}
      {showEmotionFlow && (
      <div className="bg-gray-50 rounded-material-md p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">감정 흐름</h3>
        {records.length > 0 && emotionList.length > 0 && dates.length > 0 ? (
          <div className="space-y-4">
            <div className="relative" style={{ height: `${chartHeight}px`, width: '100%' }}>
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${Math.max(400, dates.length * 60)} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                {/* 그리드 라인 */}
                {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                  const y = padding + (chartHeight - padding * 2) * (1 - ratio);
                  return (
                    <line
                      key={ratio}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* 각 날짜별 막대 그래프 (감정별로 쌓기) */}
                {dates.map((date, dateIdx) => {
                  const x = getX(dateIdx);
                  let currentY = chartHeight - padding;
                  const dateEmotions = emotionList.filter(emotion => (emotionByDate[date][emotion] || 0) > 0);
                  
                  return (
                    <g key={date}>
                      {dateEmotions.map((emotion) => {
                        const value = emotionByDate[date][emotion] || 0;
                        const barHeight = (value / maxValue) * (chartHeight - padding * 2);
                        const y = currentY - barHeight;
                        currentY = y;
                        
                        return (
                          <rect
                            key={emotion}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={emotionColors[emotion] || '#9CA3AF'}
                            rx="2"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* X축 날짜 레이블 */}
                {dates.map((date, idx) => {
                  const x = getX(idx);
                  return (
                    <text
                      key={date}
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                    >
                      {new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </text>
                  );
                })}

                {/* Y축 레이블 */}
                <text
                  x={15}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                  transform={`rotate(-90, 15, ${chartHeight / 2})`}
                >
                  감정 횟수
                </text>
              </svg>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {emotionList.map(emotion => (
                <div key={emotion} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: emotionColors[emotion] || '#9CA3AF' }}
                  />
                  <span className="text-xs text-gray-700">{emotionLabels[emotion]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            {records.length === 0 ? (
              <p>기록이 없습니다.</p>
            ) : emotionList.length === 0 ? (
              <p>감정 데이터가 없습니다.</p>
            ) : (
              <p>최근 {days}일간의 기록이 없습니다.</p>
            )}
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-gray-300"></div>
      </div>
      )}

      {/* 반복되는 생각 패턴 */}
      {showRepeatingThoughts && topThoughts.length > 0 && (
        <div className="bg-gray-50 rounded-material-md p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">카테고리</h3>
          <div className="space-y-3">
            {topThoughts.map(([thought, count]) => {
              const maxCount = Math.max(...topThoughts.map(([, c]) => c));
              const percentage = (count / maxCount) * 100;
              
              return (
                <div key={thought} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{thought}</span>
                    <span className="text-gray-500">{count}회</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

