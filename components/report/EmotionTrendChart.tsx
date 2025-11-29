'use client';

import React from 'react';
import { EmotionData } from '@/lib/types';

interface EmotionTrendChartProps {
  emotions: EmotionData[];
  days: number; // 표시할 일수
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

export default function EmotionTrendChart({ emotions, days }: EmotionTrendChartProps) {
  const total = emotions.reduce((sum, e) => sum + e.count, 0);
  const size = 200;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 mb-4">감정 비중</h3>
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
      
      {/* 범례 */}
      <div className="space-y-2 mt-6">
        {emotions.map((emotion) => (
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
  );
}

