'use client';

import React, { useState } from 'react';
import { Record, Emotion } from '@/lib/types';

interface EmotionFlowChartProps {
  records: Record[];
  days?: number;
  showEmotionFlow?: boolean;
  showRepeatingThoughts?: boolean;
  currentMonth?: string; // YYYY-MM 형식
}

const emotionColors: { [key in Emotion]: string } = {
  joy: '#C84470', // 핑크
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
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  
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

  // 지난달 데이터 계산 (currentMonth가 있을 때만)
  let lastMonthData: { [weekKey: string]: { [emotion: string]: number } } = {};
  let lastMonthRecords: Record[] = [];
  
  if (currentMonth) {
    const currentDate = new Date(currentMonth + '-01');
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStr = lastMonthDate.toISOString().substring(0, 7); // YYYY-MM
    
    // 지난달 기록 필터링
    lastMonthRecords = records.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      if (isNaN(recordDate.getTime())) return false;
      const recordMonth = recordDate.toISOString().substring(0, 7);
      return recordMonth === lastMonthStr;
    });
    
    // 지난달 날짜별 감정 집계
    const lastMonthEmotionByDate: { [date: string]: { [emotion: string]: number } } = {};
    lastMonthRecords.forEach(record => {
      const dateKey = record.date;
      if (!lastMonthEmotionByDate[dateKey]) {
        lastMonthEmotionByDate[dateKey] = {};
      }
      record.emotions.forEach(emotion => {
        lastMonthEmotionByDate[dateKey][emotion] = (lastMonthEmotionByDate[dateKey][emotion] || 0) + 1;
      });
    });
    
    // 지난달 주간별로 그룹화 (이번달과 동일한 방식)
    Object.keys(lastMonthEmotionByDate).forEach(date => {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return;
      
      const dayOfWeek = dateObj.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(dateObj);
      monday.setDate(dateObj.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      
      // 주차 키: YYYY-MM-DD (월요일 날짜) - 이번달과 동일한 형식
      const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      
      if (!lastMonthData[weekKey]) {
        lastMonthData[weekKey] = {};
      }
      
      Object.keys(lastMonthEmotionByDate[date] || {}).forEach(emotion => {
        lastMonthData[weekKey][emotion] = (lastMonthData[weekKey][emotion] || 0) + (lastMonthEmotionByDate[date][emotion] || 0);
      });
    });
  }

  // 이번달 주간별로 그룹화 (주차별로 단순화)
  const weeklyData: { [weekKey: string]: { [emotion: string]: number } } = {};
  const weekLabels: { [weekKey: string]: string } = {}; // 주차 레이블 저장
  
  dates.forEach(date => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return;
    
    const dayOfWeek = dateObj.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 해당 주의 월요일 계산
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    // 주차 키: YYYY-MM-DD (월요일 날짜) - 단순화
    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    
    // 레이블 저장 (첫 번째 날짜 기준)
    if (!weekLabels[weekKey]) {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const monthNum = monday.getMonth() + 1;
      const dayNum = monday.getDate();
      if (monday.getMonth() === sunday.getMonth()) {
        weekLabels[weekKey] = `${monthNum}/${dayNum}~${sunday.getDate()}`;
      } else {
        weekLabels[weekKey] = `${monthNum}/${dayNum}~${sunday.getMonth() + 1}/${sunday.getDate()}`;
      }
    }
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
    }
    
    Object.keys(emotionByDate[date] || {}).forEach(emotion => {
      weeklyData[weekKey][emotion] = (weeklyData[weekKey][emotion] || 0) + (emotionByDate[date][emotion] || 0);
    });
  });

  // 주차를 날짜순으로 정렬
  const weeks = Object.keys(weeklyData).sort((a, b) => {
    return a.localeCompare(b);
  });
  
  // 월간 종합 데이터 계산
  const monthlyData: { [emotion: string]: number } = {};
  recentRecords.forEach(record => {
    record.emotions.forEach(emotion => {
      monthlyData[emotion] = (monthlyData[emotion] || 0) + 1;
    });
  });
  
  // 지난달 월간 종합 데이터
  const lastMonthMonthlyData: { [emotion: string]: number } = {};
  if (currentMonth && lastMonthRecords.length > 0) {
    lastMonthRecords.forEach(record => {
      record.emotions.forEach(emotion => {
        lastMonthMonthlyData[emotion] = (lastMonthMonthlyData[emotion] || 0) + 1;
      });
    });
  }
  
  // 표시할 데이터 결정
  const displayData = viewMode === 'monthly' 
    ? { 'monthly': monthlyData }
    : weeklyData;
  const displayKeys = viewMode === 'monthly' 
    ? ['monthly']
    : weeks;
  const displayLabels = viewMode === 'monthly'
    ? { 'monthly': currentMonth ? new Date(currentMonth + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) : '전체' }
    : weekLabels;
  
  // 막대 그래프를 위한 좌표 계산 (개별 막대용)
  const chartHeight = 400;
  const baseWidth = 500;
  const calculatedWidth = Math.max(baseWidth, displayKeys.length * 100);
  const chartWidth = calculatedWidth;
  const padding = 50;
  const barWidth = 12;
  const barSpacing = displayKeys.length > 0 ? (chartWidth - padding * 2) / displayKeys.length : 100;
  const emotionBarSpacing = 4;

  // 데이터의 최대값 계산
  const maxValue = viewMode === 'monthly'
    ? Math.max(...Object.values(monthlyData), 1)
    : (weeks.length > 0 
        ? Math.max(...weeks.map(week => 
            Object.values(weeklyData[week]).reduce((sum, count) => sum + count, 0)
          ), 1)
        : 1);
  
  // 곡선 그래프용 주차별 최대값 (주차별 데이터 사용)
  const weeklyMaxValue = weeks.length > 0 
    ? Math.max(...weeks.map(week => 
        Object.values(weeklyData[week]).reduce((sum, count) => sum + count, 0)
      ), 1)
    : 1;

  const getY = (value: number) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - padding * 2));
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">감정 흐름</h3>
          {currentMonth && (
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'monthly' | 'weekly')}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="monthly">월간 종합</option>
              <option value="weekly">주차별</option>
            </select>
          )}
        </div>
        {records.length > 0 && emotionList.length > 0 && displayKeys.length > 0 ? (
          <div>
            <div className="relative rounded-lg" style={{ height: `${chartHeight}px`, width: '100%', overflow: 'hidden', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${Math.max(chartWidth, 500)} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
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

                {/* 막대 그래프 - 월간 종합 또는 주차별 */}
                {displayKeys.map((key, keyIdx) => {
                  const baseX = getX(keyIdx);
                  const totalBars = emotionList.length;
                  const groupWidth = barWidth * totalBars + emotionBarSpacing * (totalBars - 1);
                  const startX = baseX - (groupWidth / 2) + (barWidth / 2);
                  
                  const currentData = viewMode === 'monthly' 
                    ? monthlyData
                    : weeklyData[key];
                  
                  return (
                    <g key={key}>
                      {/* 각 감정별 막대 */}
                      {emotionList.map((emotion, emotionIdx) => {
                        const x = startX + emotionIdx * (barWidth + emotionBarSpacing);
                        const value = currentData[emotion] || 0;
                        const barHeight = (value / maxValue) * (chartHeight - padding * 2);
                        const y = chartHeight - padding - barHeight;
                        
                        // 지난달 데이터 (오퍼시티 낮게, 배경)
                        let lastMonthValue = 0;
                        let lastMonthTotal = 0;
                        if (currentMonth) {
                          if (viewMode === 'monthly') {
                            // 월간 종합: 지난달 전체 데이터
                            lastMonthValue = lastMonthMonthlyData[emotion] || 0;
                            lastMonthTotal = Object.values(lastMonthMonthlyData).reduce((sum, count) => sum + count, 0);
                          } else {
                            // 주차별: 같은 주차 위치 찾기
                            const lastMonthWeeks = Object.keys(lastMonthData).sort();
                            if (keyIdx < lastMonthWeeks.length) {
                              const matchingLastMonthWeek = lastMonthWeeks[keyIdx];
                              if (lastMonthData[matchingLastMonthWeek]) {
                                lastMonthValue = lastMonthData[matchingLastMonthWeek][emotion] || 0;
                                lastMonthTotal = Object.values(lastMonthData[matchingLastMonthWeek]).reduce((sum, count) => sum + count, 0);
                              }
                            }
                          }
                        }
                        
                        const lastMonthMaxValue = Math.max(lastMonthTotal || 0, maxValue);
                        const lastMonthBarHeight = lastMonthValue > 0 
                          ? (lastMonthValue / lastMonthMaxValue) * (chartHeight - padding * 2)
                          : 0;
                        const lastMonthY = chartHeight - padding - lastMonthBarHeight;
                        
                        return (
                          <g key={emotion}>
                            {/* 지난달 막대 (배경) */}
                            {currentMonth && lastMonthValue > 0 && (
                              <rect
                                x={x - barWidth / 2}
                                y={lastMonthY}
                                width={barWidth}
                                height={lastMonthBarHeight}
                                fill={emotionColors[emotion] || '#9CA3AF'}
                                opacity="0.3"
                                rx="2"
                              />
                            )}
                            {/* 이번달 막대 (앞) */}
                            {value > 0 && (
                              <rect
                                x={x - barWidth / 2}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={emotionColors[emotion] || '#9CA3AF'}
                                opacity="1"
                                rx="2"
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* X축 레이블 */}
                {displayKeys.map((key, idx) => {
                  const x = getX(idx);
                  return (
                    <text
                      key={key}
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                    >
                      {displayLabels[key] || key}
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
        
        {/* 곡선 그래프 추가 - 주차별 */}
        {records.length > 0 && emotionList.length > 0 && weeks.length > 0 && maxValue > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">감정 변화 추이</h4>
            {(() => {
              try {
                // 곡선 그래프용 너비 계산 (weeks 기반, 스크롤 없이)
                const lineChartWidth = Math.max(500, weeks.length * 60);
                const lineChartPadding = 50;
                
                return (
                  <div className="relative rounded-lg" style={{ height: `${chartHeight}px`, width: '100%', overflow: 'hidden', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
                    <svg width="100%" height={chartHeight} viewBox={`0 0 ${lineChartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                      {/* 그리드 라인 */}
                      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const y = lineChartPadding + (chartHeight - lineChartPadding * 2) * (1 - ratio);
                        return (
                          <line
                            key={ratio}
                            x1={lineChartPadding}
                            y1={y}
                            x2={lineChartWidth - lineChartPadding}
                            y2={y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {/* 각 감정별 벨 커브 곡선 (그 달의 감정 흐름) */}
                      {(() => {
                        // 각 감정별 통계 계산
                        const emotionStats = emotionList.map(emotion => {
                          const values = weeks.map(week => weeklyData[week][emotion] || 0);
                          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                          const stdDev = Math.sqrt(variance) || 1;
                          const maxValue = Math.max(...values, 1);
                          
                          return { emotion, mean, stdDev, maxValue, values };
                        });
                        
                        // 벨 커브 생성
                        return emotionStats.map(({ emotion, mean, stdDev, maxValue, values }) => {
                          if (maxValue === 0) return null;
                          
                          const chartAreaWidth = lineChartWidth - lineChartPadding * 2;
                          const chartAreaHeight = chartHeight - lineChartPadding * 2;
                          
                          // 평균 위치 계산 (주차 기준)
                          const meanWeekIdx = values.findIndex(val => Math.abs(val - mean) < 0.1);
                          const meanX = meanWeekIdx >= 0 
                            ? getX(meanWeekIdx) + (barWidth / 2)
                            : lineChartPadding + chartAreaWidth / 2;
                          
                          // 벨 커브 점 생성
                          const bellCurvePoints: { x: number; y: number }[] = [];
                          const numPoints = 200;
                          
                          for (let i = 0; i <= numPoints; i++) {
                            const x = lineChartPadding + (i / numPoints) * chartAreaWidth;
                            // 가우시안 함수: 정규분포 곡선
                            const normalizedX = (x - meanX) / (stdDev * (chartAreaWidth / weeks.length) * 0.5);
                            const gaussianY = Math.exp(-0.5 * normalizedX * normalizedX);
                            const y = lineChartPadding + chartAreaHeight - (gaussianY * maxValue / weeklyMaxValue) * chartAreaHeight;
                            bellCurvePoints.push({ x, y });
                          }
                          
                          if (bellCurvePoints.length === 0) return null;
                          
                          // 부드러운 곡선 경로 생성
                          let pathData = `M ${bellCurvePoints[0].x} ${bellCurvePoints[0].y}`;
                          for (let i = 0; i < bellCurvePoints.length - 1; i++) {
                            const current = bellCurvePoints[i];
                            const next = bellCurvePoints[i + 1];
                            const cp1x = current.x + (next.x - current.x) / 3;
                            const cp1y = current.y;
                            const cp2x = next.x - (next.x - current.x) / 3;
                            const cp2y = next.y;
                            pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                          }
                          
                          return (
                            <g key={emotion}>
                              <path
                                d={pathData}
                                fill="none"
                                stroke={emotionColors[emotion] || '#9CA3AF'}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                          );
                        });
                      })()}

                      {/* X축 주차 레이블 */}
                      {weeks.map((week, idx) => {
                        const x = getX(idx) + (barWidth / 2);
                        return (
                          <text
                            key={week}
                            x={x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6B7280"
                          >
                            {weekLabels[week] || week}
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
                );
              } catch (error) {
                console.error('곡선 그래프 렌더링 오류:', error);
                return (
                  <div className="text-gray-500 text-sm text-center py-4">
                    그래프를 표시할 수 없습니다.
                  </div>
                );
              }
            })()}

            {/* 범례 (기존과 동일) */}
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

