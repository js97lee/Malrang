'use client';

import React, { useMemo } from 'react';
import { Record } from '@/lib/types';
import ArchiveItem from './ArchiveItem';

interface ArchiveListProps {
  records: Record[];
  onRecordClick?: (record: Record) => void;
}

export default function ArchiveList({ records, onRecordClick }: ArchiveListProps) {
  const sortedRecords = useMemo(() => {
    // 날짜순 정렬 (오래된 것이 앞에)
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // 오래된 것이 앞에
    });
    
    // 뒤쪽 카드들을 앞으로 이동 (뒤쪽 30%를 앞으로)
    const splitIndex = Math.floor(sorted.length * 0.7);
    const frontPart = sorted.slice(0, splitIndex);
    const backPart = sorted.slice(splitIndex);
    const reordered = [...backPart, ...frontPart];
    
    // 랜덤하게 섞기
    const shuffled = [...reordered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, [records]);

  return (
    <div className="space-y-3">
      {sortedRecords.length === 0 ? (
        <div className="text-center py-12 text-gray-700">
          <p className="font-medium">아직 기록이 없습니다.</p>
          <p className="text-sm mt-2 text-gray-600">오늘의 첫 기록을 남겨보세요!</p>
        </div>
      ) : (
        sortedRecords.map((record, index) => (
          <ArchiveItem
            key={record.id}
            record={record}
            onClick={() => onRecordClick?.(record)}
            index={index}
          />
        ))
      )}
    </div>
  );
}
