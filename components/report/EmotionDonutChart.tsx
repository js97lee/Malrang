'use client';

import React from 'react';
import { EmotionData } from '@/lib/types';

interface EmotionDonutChartProps {
  emotions: EmotionData[];
}

const emotionColors: Record<string, string> = {
  joy: '#FBBF24',
  sadness: '#60A5FA',
  anger: '#F87171',
  fear: '#A78BFA',
  surprise: '#34D399',
  love: '#FB7185',
  peace: '#4ADE80',
  excitement: '#F59E0B',
};

export default function EmotionDonutChart({ emotions }: EmotionDonutChartProps) {
  const total = emotions.reduce((sum, e) => sum + e.count, 0);
  const size = 200;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
        />
        {emotions.map((emotion) => {
          const strokeDasharray = (emotion.percentage / 100) * circumference;
          const strokeDashoffset = -currentOffset;
          currentOffset += strokeDasharray;

          return (
            <circle
              key={emotion.emotion}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={emotionColors[emotion.emotion] || '#9CA3AF'}
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
        <p className="text-sm text-gray-500">기록</p>
      </div>
    </div>
  );
}

