'use client';

import React, { useState, useEffect } from 'react';
import { Record } from '@/lib/types';
import { generateImageForRecord } from '@/lib/utils/imageGenerator';
import { saveGeneratedImage } from '@/lib/utils/conversationStorage';

interface VisualBoardProps {
  records: Record[];
  viewMode?: 'calendar';
  onRecordClick?: (record: Record) => void;
}

export default function VisualBoard({ records, viewMode = 'calendar', onRecordClick }: VisualBoardProps) {
  const [recordsWithImages, setRecordsWithImages] = useState<Record[]>(records);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 이미지가 없는 기록에 대해 이미지 생성
    const loadImages = async () => {
      // 모든 기록에 대해 이미지 확인 및 생성
      setLoadingImages(new Set(records.map(r => r.id)));

      const updatedRecords = await Promise.all(
        records.map(async (record) => {
          // 이미 이미지가 있으면 그대로 사용
          if (record.images && record.images.length > 0) {
            return record;
          }

          // 이미지가 없으면 생성
          const generatedImage = await generateImageForRecord(record);
          if (generatedImage) {
            // 생성된 이미지를 localStorage에 저장
            saveGeneratedImage(record.id, generatedImage);
            return {
              ...record,
              images: [generatedImage],
            };
          }
          
          return record;
        })
      );

      setRecordsWithImages(updatedRecords);
      setLoadingImages(new Set());
    };

    loadImages();
  }, [records]);

  // 현재 달의 날짜 그리드 생성
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // 이번 달 첫 번째 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 번째 날의 요일 (0=일요일, 1=월요일, ...)
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: Array<{ date: number; dayName: string; record: Record | null }> = [];
    
    // 이번 달의 모든 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
      
      // 해당 날짜의 기록 찾기
      const record = recordsWithImages.find((r) => {
        const recordDate = new Date(r.date);
        return (
          recordDate.getFullYear() === year &&
          recordDate.getMonth() === month &&
          recordDate.getDate() === i
        );
      });
      
      days.push({
        date: i,
        dayName,
        record: record || null,
      });
    }
    
    return { days, startDay, year, month };
  };

  // 모든 기록을 갤러리로 표시 (이미지 유무와 관계없이)
  const recordsWithDates = recordsWithImages
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 최신순 정렬

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* 갤러리 그리드 - 가로 3개 */}
      <div className="grid grid-cols-3 gap-3">
        {recordsWithDates.map((record) => {
          const recordDate = new Date(record.date);
          const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][recordDate.getDay()];
          const dayNumber = recordDate.getDate();
          const isLoading = loadingImages.has(record.id);
          const isToday = 
            recordDate.getDate() === today.getDate() &&
            recordDate.getMonth() === today.getMonth() &&
            recordDate.getFullYear() === today.getFullYear();
          
          return (
            <div
              key={record.id}
              onClick={() => onRecordClick?.(record)}
              className={`aspect-[4/5] rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity ${
                isToday ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {record.images && record.images.length > 0 ? (
                <img
                  src={record.images[0]}
                  alt={record.summary || '기록'}
                  className="w-full h-full object-cover"
                />
              ) : isLoading ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center p-4">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400 text-center">이미지 없음</span>
                </div>
              )}
              {/* 날짜 오버레이 */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-sm font-medium px-2 py-1 rounded backdrop-blur-sm">
                {dayName} {dayNumber}
              </div>
            </div>
          );
        })}
      </div>

      {recordsWithDates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>기록이 없습니다.</p>
          <p className="text-sm mt-2">오늘의 첫 기록을 남겨보세요!</p>
        </div>
      )}
    </div>
  );
}

