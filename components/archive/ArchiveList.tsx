'use client';

import React, { useMemo } from 'react';
import { Record } from '@/lib/types';
import ArchiveItem from './ArchiveItem';

interface ArchiveListProps {
  records: Record[];
  onRecordClick?: (record: Record) => void;
}

export default function ArchiveList({ records, onRecordClick }: ArchiveListProps) {
  // 디버깅: 3번 기록 확인
  const sortedRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // 최신순 정렬
    });
    
    console.log('📋 ArchiveList - 받은 records 수:', records.length);
    console.log('📋 ArchiveList - 3번 기록:', sorted.find(r => r.id === '3'));
    console.log('📋 ArchiveList - 모든 기록 ID:', sorted.map(r => r.id));
    
    return sorted;
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
