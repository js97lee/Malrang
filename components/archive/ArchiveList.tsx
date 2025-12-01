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
    return [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // 최신순 정렬
    });
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
