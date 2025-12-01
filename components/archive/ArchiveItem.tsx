'use client';

import React, { useState } from 'react';
import { Record } from '@/lib/types';
import { formatDateShort, getRecordImage } from '@/lib/utils/recordUtils';

interface ArchiveItemProps {
  record: Record;
  onClick?: () => void;
  index?: number;
}

export default function ArchiveItem({ record, onClick, index = 0 }: ArchiveItemProps) {
  const { imageUrl: defaultImage, hasValidImage } = getRecordImage(record, index);
  const isFirst = index === 0;
  
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
      // 기본 이미지도 실패하면 placeholder 표시
      const img = document.querySelector(`[data-archive-item-id="${record.id}"] img`) as HTMLImageElement;
      if (img) {
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.image-placeholder')) {
          const placeholder = document.createElement('span');
          placeholder.className = 'image-placeholder text-xs text-gray-400';
          placeholder.textContent = '이미지 없음';
          parent.appendChild(placeholder);
        }
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 ${onClick ? 'cursor-pointer transition-all hover:bg-gray-50' : ''}`}
    >
      <div className="flex gap-3">
        {/* 왼쪽 썸네일 이미지 */}
        <div 
          data-archive-item-id={record.id}
          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center relative"
        >
          <img
            src={currentImage}
            alt={record.summary || '기록'}
            className="w-full h-full z-10 object-cover"
            onError={handleImageError}
          />
        </div>
        
        {/* 오른쪽 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 태그 - 맨 위에 표시 */}
          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {record.tags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-gray-900 border border-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 날짜 */}
          <p className="text-xs text-gray-600 mb-1">{formatDateShort(record.date)}</p>
          
          {/* 설명 텍스트 */}
          <h3 className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
            {record.summary || record.answer.substring(0, 50)}
          </h3>
        </div>
      </div>
    </div>
  );
}

