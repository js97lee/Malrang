'use client';

import React from 'react';
import { Record } from '@/lib/types';
import ArchiveItem from './ArchiveItem';

interface ArchiveListProps {
  records: Record[];
  onRecordClick?: (record: Record) => void;
}

export default function ArchiveList({ records, onRecordClick }: ArchiveListProps) {
  return (
    <div className="space-y-3">
      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-700">
          <p className="font-medium">아직 기록이 없습니다.</p>
          <p className="text-sm mt-2 text-gray-600">오늘의 첫 기록을 남겨보세요!</p>
        </div>
      ) : (
        records.map((record) => (
          <ArchiveItem
            key={record.id}
            record={record}
            onClick={() => onRecordClick?.(record)}
          />
        ))
      )}
    </div>
  );
}

