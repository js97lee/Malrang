'use client';

import React, { useMemo } from 'react';
import { Record } from '@/lib/types';
import RecordCard from '@/components/ui/RecordCard';
import { getRecordImage, getDateInfo, isToday } from '@/lib/utils/recordUtils';

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
    return sorted;
  }, [records]);

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
            const { dayName, dayNumber } = getDateInfo(record.date);
            const { imageUrl: defaultImage, hasValidImage } = getRecordImage(record, index);
            const recordIsToday = isToday(record.date);
            
            return (
              <RecordCard
                key={record.id}
                record={record}
                defaultImage={defaultImage}
                hasValidImage={hasValidImage}
                dayName={dayName}
                dayNumber={dayNumber}
                isToday={recordIsToday}
                onClick={() => onRecordClick?.(record)}
                dataAttribute="data-record-id"
              />
            );
          })
        )}
      </div>
    </div>
  );
}
