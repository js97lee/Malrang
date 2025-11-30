'use client';

import React from 'react';
import { EmotionData } from '@/lib/types';

interface EmotionDonutChartProps {
  emotions: EmotionData[];
}

const emotionColors: Record<string, string> = {
  joy: '#FBBF24', // 노랑
  sadness: '#3B82F6', // 파랑
  anger: '#F97316', // 주황
  fear: '#1F2937', // 검정
  surprise: '#1F2937', // 검정
  love: '#F97316', // 주황
  peace: '#22C55E', // 초록
  excitement: '#FBBF24', // 노랑
};

const emotionLabels: Record<string, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  anger: '화남',
  fear: '두려움',
  surprise: '놀람',
  love: '사랑',
  peace: '평온',
  excitement: '흥분',
};

export default function EmotionDonutChart({ emotions }: EmotionDonutChartProps) {
  const total = emotions.reduce((sum, e) => sum + e.count, 0);
  const size = 200;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // 감정을 비율 순으로 정렬 (큰 비율부터)
  const sortedEmotions = [...emotions].sort((a, b) => b.percentage - a.percentage);

  let currentOffset = 0;

  return (
    <div className="flex items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
        />
        {/* 감정별 원호 (큰 비율부터 순서대로) */}
        {sortedEmotions.map((emotion, index) => {
          const percentage = emotion.percentage;
          // 각 감정의 원호 길이 계산
          const arcLength = (percentage / 100) * circumference;
          
          // strokeDasharray: [그릴 길이] [건너뛸 길이]
          // 전체 원주를 기준으로 자신의 비율만큼만 그리고 나머지는 건너뜀
          const strokeDasharray = `${arcLength} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          
          // 다음 원호를 위한 오프셋 누적
          currentOffset += arcLength;
          
          const color = emotionColors[emotion.emotion] || '#9CA3AF';

          return (
            <circle
              key={`${emotion.emotion}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold">{total}</p>
        <p className="text-sm text-gray-500">감정</p>
      </div>
    </div>
  );
}

