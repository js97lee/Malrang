'use client';

import React, { useMemo } from 'react';
import { Record } from '@/lib/types';
import { getRecordImage } from '@/lib/utils/recordUtils';
import { useRouter } from 'next/navigation';

interface ArchiveKeywordGroupsProps {
  records: Record[];
  onRecordClick?: (record: Record) => void;
}

export default function ArchiveKeywordGroups({ records, onRecordClick }: ArchiveKeywordGroupsProps) {
  const router = useRouter();

  // 키워드별로 레코드 그룹화
  const keywordGroups = useMemo(() => {
    const groups: { [key: string]: Record[] } = {};
    
    records.forEach((record) => {
      record.tags.forEach((tag) => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        if (!groups[tag].find(r => r.id === record.id)) {
          groups[tag].push(record);
        }
      });
    });

    // 각 그룹을 날짜순으로 정렬 (최신순)
    Object.keys(groups).forEach((tag) => {
      groups[tag].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    });

    return groups;
  }, [records]);

  const sortedKeywords = useMemo(() => {
    return Object.keys(keywordGroups).sort((a, b) => {
      // 레코드 수가 많은 순으로 정렬
      return keywordGroups[b].length - keywordGroups[a].length;
    });
  }, [keywordGroups]);

  const handleRecordClick = (record: Record) => {
    if (onRecordClick) {
      onRecordClick(record);
    } else {
      router.push(`/archive/${record.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {sortedKeywords.length === 0 ? (
        <div className="text-center py-12 text-gray-700">
          <p className="font-medium">아직 기록이 없습니다.</p>
          <p className="text-sm mt-2 text-gray-600">오늘의 첫 기록을 남겨보세요!</p>
        </div>
      ) : (
        sortedKeywords.map((keyword) => {
          const groupRecords = keywordGroups[keyword];
          return (
            <div key={keyword} className="space-y-3">
              {/* 키워드 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {keyword} {groupRecords.length}
                </h3>
                {groupRecords.length > 3 && (
                  <button
                    onClick={() => {
                      // 모든 레코드 보기 (필터링 적용)
                      const event = new CustomEvent('filterByKeyword', { detail: keyword });
                      window.dispatchEvent(event);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    모두 보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 키워드별 카드 그리드 - 가로 스크롤 */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {groupRecords.slice(0, 10).map((record, index) => {
                    const { imageUrl } = getRecordImage(record, index);
                    const date = new Date(record.date);
                    const formattedDate = date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={record.id}
                        onClick={() => handleRecordClick(record)}
                        className="flex-shrink-0 w-32 cursor-pointer group"
                      >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 mb-2">
                          <img
                            src={imageUrl}
                            alt={record.summary || '기록'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 font-medium truncate">{formattedDate}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

