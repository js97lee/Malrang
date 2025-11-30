import React from 'react';
import { Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface ArchiveItemProps {
  record: Record;
  onClick?: () => void;
}

export default function ArchiveItem({ record, onClick }: ArchiveItemProps) {
  // 날짜를 YYYY.M.D. 형식으로 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month}.${day}.`;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 ${onClick ? 'cursor-pointer transition-all hover:bg-gray-50' : ''}`}
    >
      <div className="flex gap-3">
        {/* 왼쪽 썸네일 이미지 */}
        {record.images && record.images.length > 0 ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={record.images[0]}
              alt={record.summary || '기록'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">이미지 없음</span>
          </div>
        )}
        
        {/* 오른쪽 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 태그 - 맨 위에 표시 */}
          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {record.tags.slice(0, 1).map((tag) => (
                <Tag key={tag} className="bg-gray-500 text-white">{tag}</Tag>
              ))}
            </div>
          )}
          
          {/* 날짜 */}
          <p className="text-xs text-gray-600 mb-1">{formatDate(record.date)}</p>
          
          {/* 설명 텍스트 */}
          <h3 className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
            {record.summary || record.answer.substring(0, 50)}
          </h3>
        </div>
      </div>
    </div>
  );
}

