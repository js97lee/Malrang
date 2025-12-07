'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Record } from '@/lib/types';

interface RecordCardProps {
  record: Record;
  defaultImage: string;
  hasValidImage: boolean;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  onClick?: () => void;
  className?: string;
  dataAttribute?: string;
  enableDragDetection?: boolean;
}

export default function RecordCard({
  record,
  defaultImage,
  hasValidImage,
  dayName,
  dayNumber,
  isToday,
  onClick,
  className = '',
  dataAttribute,
  enableDragDetection = false,
}: RecordCardProps) {
  const [imageError, setImageError] = useState(false);
  // defaultImage는 이미 getRecordImage에서 처리된 최종 이미지 URL입니다
  const [currentImage, setCurrentImage] = useState(defaultImage);
  
  // defaultImage가 변경되면 currentImage도 업데이트
  useEffect(() => {
    if (defaultImage && !imageError) {
      setCurrentImage(defaultImage);
    }
  }, [defaultImage, imageError]);
  
  const cardMouseDownRef = useRef({ x: 0, y: 0, time: 0 });

  const handleImageError = () => {
    // 이미지 로드 실패 시 기본 이미지로 fallback
    if (!imageError) {
      setImageError(true);
      // defaultImage도 실패할 수 있으므로, card1.png로 최종 fallback
      const fallbackImage = `/card1.png`;
      if (currentImage !== fallbackImage) {
        setCurrentImage(fallbackImage);
      } else {
        // 최종 fallback도 실패하면 이미지 숨기기
        const selector = dataAttribute 
          ? `[${dataAttribute}="${record.id}"] img`
          : `[data-record-id="${record.id}"] img`;
        const img = document.querySelector(selector) as HTMLImageElement;
        if (img) {
          img.style.display = 'none';
        }
      }
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent) => {
    if (enableDragDetection) {
      cardMouseDownRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      };
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    
    if (enableDragDetection) {
      const moveDistance = Math.abs(e.clientX - cardMouseDownRef.current.x) + 
                          Math.abs(e.clientY - cardMouseDownRef.current.y);
      const timeDiff = Date.now() - cardMouseDownRef.current.time;
      
      // 드래그로 판단되는 경우 (5px 이상 이동 또는 300ms 이상 경과)
      if (moveDistance > 5 || timeDiff > 300) {
        e.preventDefault();
        return;
      }
    }
    onClick();
  };

  const baseClassName = `aspect-[4/5] rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity ${
    isToday ? 'ring-2 ring-primary-500' : ''
  } ${className}`;

  return (
    <div
      {...(dataAttribute ? { [dataAttribute]: record.id } : { 'data-record-id': record.id })}
      onMouseDown={enableDragDetection ? handleCardMouseDown : undefined}
      onClick={onClick ? handleCardClick : undefined}
      className={baseClassName}
    >
      {/* 기본 그라디언트 배경 */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
      
      <img
        src={currentImage}
        alt={record.summary || '기록'}
        className="absolute z-10 inset-0 w-full h-full object-cover"
        onError={handleImageError}
        loading="lazy"
        decoding="async"
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






