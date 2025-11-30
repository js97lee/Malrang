'use client';

import React, { useMemo } from 'react';
import { Record, Emotion, EmotionData } from '@/lib/types';
import EmotionDonutChart from './EmotionDonutChart';

interface EmotionNotebookProps {
  records: Record[];
}

const emotionColors: Record<Emotion, string> = {
  joy: '#FBBF24', // 노랑
  sadness: '#3B82F6', // 파랑
  anger: '#F97316', // 주황
  fear: '#1F2937', // 검정
  surprise: '#1F2937', // 검정
  love: '#F97316', // 주황
  peace: '#22C55E', // 초록
  excitement: '#FBBF24', // 노랑
};

const emotionLabels: Record<Emotion, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '화남',
  fear: '두려움',
  surprise: '놀람',
  love: '사랑',
  peace: '평온',
  excitement: '흥분',
};

export default function EmotionNotebook({ records }: EmotionNotebookProps) {
  // 감정별 기록 수 집계
  const emotionCounts: { [key: string]: number } = {};
  records.forEach(record => {
    record.emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  // 감정별 기록 그룹화
  const recordsByEmotion: { [key: string]: Record[] } = {};
  records.forEach(record => {
    record.emotions.forEach(emotion => {
      if (!recordsByEmotion[emotion]) {
        recordsByEmotion[emotion] = [];
      }
      if (!recordsByEmotion[emotion].find(r => r.id === record.id)) {
        recordsByEmotion[emotion].push(record);
      }
    });
  });

  const emotions = Object.keys(emotionCounts) as Emotion[];

  // 도넛 차트용 감정 데이터 변환
  const emotionData: EmotionData[] = useMemo(() => {
    const total = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    
    return emotions
      .map(emotion => ({
        emotion: emotion as Emotion,
        count: emotionCounts[emotion],
        percentage: total > 0 ? Math.round((emotionCounts[emotion] / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // 많이 나타난 순으로 정렬
  }, [emotions, emotionCounts]);

  return (
    <div className="bg-surface rounded-material-md p-6">
      <h3 className="font-semibold text-gray-700 mb-6">나의 감정 기록 노트</h3>
      
      {/* 감정 비중 도넛 차트 */}
      {emotionData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-600 mb-4 text-center">감정 비중</h4>
          <div className="flex justify-center mb-6">
            <EmotionDonutChart emotions={emotionData} />
          </div>
          <div className="space-y-2">
            {emotionData.map((emotion) => (
              <div key={emotion.emotion} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: emotionColors[emotion.emotion] || '#9CA3AF' }}
                  />
                  <span className="text-sm text-gray-700 font-medium">{emotionLabels[emotion.emotion]}</span>
                </div>
                <span className="text-sm font-semibold">{emotion.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {emotions.length > 0 ? (
          emotions.map(emotion => {
            const count = emotionCounts[emotion];
            const emotionRecords = recordsByEmotion[emotion] || [];
            
            return (
              <div key={emotion} className="border-l-4 pl-4" style={{ borderColor: emotionColors[emotion] }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: emotionColors[emotion] }}
                  />
                  <h4 className="font-semibold text-gray-900">
                    {emotionLabels[emotion]} ({count}회)
                  </h4>
                </div>
                
                <div className="space-y-2 ml-7">
                  {emotionRecords.slice(0, 3).map(record => (
                    <div key={record.id} className="text-sm text-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                        {record.tags.length > 0 && (
                          <span className="text-xs text-gray-400">
                            • {record.tags[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 line-clamp-2">
                        {record.summary || record.answer.substring(0, 80)}
                      </p>
                    </div>
                  ))}
                  {emotionRecords.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{emotionRecords.length - 3}개 더 보기
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            아직 감정 기록이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

