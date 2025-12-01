'use client';

import React, { useState, useMemo } from 'react';
import { Record } from '@/lib/types';

interface VisualBoardProps {
  records: Record[];
  viewMode?: 'calendar';
  onRecordClick?: (record: Record) => void;
}

export default function VisualBoard({ records, viewMode = 'calendar', onRecordClick }: VisualBoardProps) {
  // records prop을 직접 사용 (필터링된 records)
  const sortedRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // 최신순 정렬
    });
    
    // 디버깅: 3번 기록 확인
    console.log('🖼️ VisualBoard - 받은 records 수:', records.length);
    console.log('🖼️ VisualBoard - 3번 기록:', sorted.find(r => r.id === '3'));
    console.log('🖼️ VisualBoard - 모든 기록 ID:', sorted.map(r => r.id));
    
    return sorted;
  }, [records]);

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* 갤러리 그리드 - 가로 3개 */}
      <div className="grid grid-cols-3 gap-3">
        {sortedRecords.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <p>기록이 없습니다.</p>
            <p className="text-sm mt-2">오늘의 첫 기록을 남겨보세요!</p>
          </div>
        ) : (
          sortedRecords.map((record, index) => {
            const recordDate = new Date(record.date);
            const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][recordDate.getDay()];
            const dayNumber = recordDate.getDate();
            const isToday = 
              recordDate.getDate() === today.getDate() &&
              recordDate.getMonth() === today.getMonth() &&
              recordDate.getFullYear() === today.getFullYear();
            
            // 이미지가 없으면 card1-5를 순서대로 할당
            const cardIndex = (index % 5) + 1;
            const defaultImage = `/card${cardIndex}.png`;
            const hasValidImage = !!(record.images && record.images.length > 0 && record.images[0]);
            
            return (
              <ArchiveCard
                key={record.id}
                record={record}
                defaultImage={defaultImage}
                hasValidImage={hasValidImage}
                dayName={dayName}
                dayNumber={dayNumber}
                isToday={isToday}
                isFirst={index === 0}
                onClick={() => onRecordClick?.(record)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function ArchiveCard({
  record,
  defaultImage,
  hasValidImage,
  dayName,
  dayNumber,
  isToday,
  isFirst,
  onClick,
}: {
  record: Record;
  defaultImage: string;
  hasValidImage: boolean;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isFirst: boolean;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    hasValidImage ? record.images![0] : defaultImage
  );
  
  const handleImageError = () => {
    if (!imageError && hasValidImage) {
      // 첫 번째 이미지 실패 시 기본 이미지로 fallback
      setImageError(true);
      setCurrentImage(defaultImage);
    } else {
      // 기본 이미지도 실패하면 숨김
      const img = document.querySelector(`[data-record-id="${record.id}"] img`) as HTMLImageElement;
      if (img) {
        img.style.display = 'none';
      }
    }
  };
  
  return (
    <div
      data-record-id={record.id}
      onClick={onClick}
      className={`aspect-[4/5] rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity ${
        isToday ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* 기본 그라디언트 배경 - 항상 표시 */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
      
      <img
        src={currentImage}
        alt={record.summary || '기록'}
        className="absolute z-10 inset-0 w-full h-full object-cover"
        onError={handleImageError}
      />
      
      {/* Black Dim 오버레이 */}
      <div className="absolute inset-0 bg-black opacity-40 z-20"></div>
      
      {/* 날짜 오버레이 */}
      <div className="absolute top-2 left-2 text-white drop-shadow-lg z-30">
        <div className="text-xs font-medium leading-tight">{dayName}</div>
        <div className="text-3xl font-bold leading-tight font-serif">{dayNumber}</div>
      </div>
    </div>
  );
}
