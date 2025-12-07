'use client';

import React from 'react';
import { Record, Emotion } from '@/lib/types';

interface EmotionFlowChartProps {
  records: Record[];
  days?: number;
  showEmotionFlow?: boolean;
  showRepeatingThoughts?: boolean;
  currentMonth?: string; // YYYY-MM 형식
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

export default function EmotionFlowChart({ records, days = 30, showEmotionFlow = true, showRepeatingThoughts = true, currentMonth }: EmotionFlowChartProps) {
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
  let filteredRecords = records
    .filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      if (isNaN(recordDate.getTime())) return false;
      
      // currentMonth가 있으면 해당 월의 데이터만 필터링
      if (currentMonth) {
        const recordMonth = recordDate.toISOString().substring(0, 7); // YYYY-MM
        if (recordMonth !== currentMonth) return false;
      }
      
      // 최근 N일 필터링 (days가 0보다 클 때만, currentMonth가 없을 때만)
      if (days > 0 && !currentMonth) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        daysAgo.setHours(0, 0, 0, 0); // 시간 초기화
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= daysAgo;
      }
      return true; // days가 0이면 모든 기록 사용
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const recentRecords = filteredRecords;

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
  
  // 감정 기록 노트와 동일한 감정 목록 사용 (모든 감정 포함)
  const emotionList = Array.from(allEmotionsSet) as Emotion[];
  const maxValue = dates.length > 0 
    ? Math.max(...dates.map(date => 
        Object.values(emotionByDate[date]).reduce((sum, count) => sum + count, 0)
      ), 1)
    : 1;

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

  // 주간별로 그룹화
  const weeklyData: { [weekKey: string]: { [emotion: string]: number } } = {};
  
  dates.forEach(date => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 해당 주의 월요일 계산
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6일, 아니면 월요일까지의 오프셋
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    // 주 키: YYYY-MM-DD (월요일 날짜)
    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
    }
    
    Object.keys(emotionByDate[date] || {}).forEach(emotion => {
      weeklyData[weekKey][emotion] = (weeklyData[weekKey][emotion] || 0) + (emotionByDate[date][emotion] || 0);
    });
  });

  const weeks = Object.keys(weeklyData).sort();
  
  // 막대 그래프를 위한 좌표 계산 (확대)
  const chartHeight = 300; // 200 -> 300으로 확대
  const baseWidth = 500; // 400 -> 500으로 확대
  const calculatedWidth = Math.max(baseWidth, weeks.length * 60);
  const chartWidth = calculatedWidth;
  const padding = 50;
  const barWidth = 12; // 8 -> 12로 확대
  const barSpacing = weeks.length > 0 ? (chartWidth - padding * 2) / weeks.length : 60;

  // 주간 데이터의 최대값 계산
  const weeklyMaxValue = weeks.length > 0 
    ? Math.max(...weeks.map(week => 
        Object.values(weeklyData[week]).reduce((sum, count) => sum + count, 0)
      ), 1)
    : 1;

  const getY = (value: number) => {
    return chartHeight - padding - ((value / weeklyMaxValue) * (chartHeight - padding * 2));
  };

  const getX = (index: number) => {
    if (weeks.length === 0) return padding;
    return padding + (index * barSpacing) + (barSpacing / 2) - (barWidth / 2);
  };
  
  // 주 키를 표시용 레이블로 변환 (월요일 날짜 기준)
  const getWeekLabel = (weekKey: string) => {
    const [year, month, day] = weekKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    // 해당 주의 마지막 날 (일요일) 계산
    const sunday = new Date(date);
    sunday.setDate(date.getDate() + 6);
    
    // 같은 달이면 "M월 D일~D일", 다른 달이면 "M월 D일~M월 D일"
    if (date.getMonth() === sunday.getMonth()) {
      return `${monthNum}/${dayNum}~${sunday.getDate()}`;
    } else {
      return `${monthNum}/${dayNum}~${sunday.getMonth() + 1}/${sunday.getDate()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* 감정 흐름 차트 - 막대 그래프 */}
      {showEmotionFlow && (
      <div className="bg-gray-50 rounded-material-md p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">감정 흐름</h3>
        {records.length > 0 && emotionList.length > 0 && weeks.length > 0 ? (
          <div className="space-y-4">
            <div className="relative overflow-x-auto" style={{ height: `${chartHeight}px`, width: '100%' }}>
              <svg width={Math.max(chartWidth, 500)} height={chartHeight} viewBox={`0 0 ${Math.max(chartWidth, 500)} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
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

                {/* 각 주별 막대 그래프 (감정별로 쌓기) */}
                {weeks.map((week, weekIdx) => {
                  const x = getX(weekIdx);
                  let currentY = chartHeight - padding;
                  const weekEmotions = emotionList.filter(emotion => (weeklyData[week][emotion] || 0) > 0);
                  
                  return (
                    <g key={week}>
                      {weekEmotions.map((emotion) => {
                        const value = weeklyData[week][emotion] || 0;
                        const barHeight = (value / weeklyMaxValue) * (chartHeight - padding * 2);
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

                {/* X축 주 레이블 */}
                {weeks.map((week, idx) => {
                  const x = getX(idx);
                  return (
                    <text
                      key={week}
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                    >
                      {getWeekLabel(week)}
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
              <p>최근 주간 기록이 없습니다.</p>
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

