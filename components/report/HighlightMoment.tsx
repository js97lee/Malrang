import React from 'react';
import { Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface HighlightMomentProps {
  record: Record;
}

export default function HighlightMoment({ record }: HighlightMomentProps) {
  return (
    <div className="bg-primary-50 rounded-material-md p-6">
      <h3 className="text-lg font-semibold mb-4">이달의 하이라이트</h3>
      <div className="space-y-3">
        {record.images && record.images.length > 0 && (
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <img
              src={record.images[0]}
              alt={record.summary || '하이라이트'}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-sm text-gray-700 mb-2 font-medium">
            {new Date(record.date).toLocaleDateString('ko-KR')}
          </p>
          <p className="text-gray-800 mb-3">{record.summary || record.answer}</p>
          <div className="flex flex-wrap gap-2">
            {record.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

