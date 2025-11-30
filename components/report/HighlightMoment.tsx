'use client';

import React, { useMemo } from 'react';
import { Record } from '@/lib/types';
import mockRecords from '@/data/mockRecords.json';
import { getAllConversations, conversationToRecord } from '@/lib/utils/conversationStorage';

interface HighlightMomentProps {
  record: Record;
}

export default function HighlightMoment({ record }: HighlightMomentProps) {
  // 아카이브와 동일한 데이터 사용
  const allRecords = useMemo(() => {
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    
    const mockRecordsTyped = (mockRecords as any[]).map(record => ({
      ...record,
      emotions: (record.emotions || []) as any,
      tags: record.tags || [],
      images: record.images || [],
    })) as Record[];
    
    const mockRecordIds = new Set(mockRecordsTyped.map(r => r.id));
    const uniqueConversationRecords = conversationRecords.filter(
      record => !mockRecordIds.has(record.id)
    );
    
    return [...mockRecordsTyped, ...uniqueConversationRecords];
  }, []);
  
  // 기록 찾기 (아카이브와 동일한 데이터에서)
  const foundRecord = useMemo(() => {
    return allRecords.find(r => r.id === record.id) || record;
  }, [allRecords, record.id]);
  
  // 이미지 URL 찾기
  const recordIndex = allRecords.findIndex(r => r.id === foundRecord.id);
  const cardIndex = (recordIndex % 5) + 1;
  const defaultImage = `/card${cardIndex}.png`;
  const hasValidImage = foundRecord.images && foundRecord.images.length > 0 && foundRecord.images[0];
  const displayImage = hasValidImage ? foundRecord.images[0] : defaultImage;
  const isFirstCard = recordIndex === 0;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}. ${month}. ${day}.`;
  };
  
  return (
    <div className="bg-gray-50 rounded-material-md p-6 border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">이달의 하이라이트</h3>
      <div className="flex gap-4">
        {/* 왼쪽: 텍스트 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-2">{formatDate(foundRecord.date)}</p>
          <p className="text-gray-900 mb-3">{foundRecord.summary || foundRecord.answer}</p>
          {foundRecord.tags && foundRecord.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {foundRecord.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-gray-900 border border-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 오른쪽: 썸네일 카드 */}
        <div className="w-24 h-30 flex-shrink-0">
          <div className="aspect-[4/5] rounded-lg overflow-hidden relative">
            {/* 기본 그라디언트 배경 */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
            
            <img
              src={displayImage}
              alt={foundRecord.summary || '하이라이트'}
              className="absolute z-10 inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />
            
            {/* Black Dim 오버레이 */}
            <div className="absolute inset-0 bg-black opacity-40 z-20"></div>
            
            {/* 날짜 오버레이 */}
            <div className="absolute top-1 left-1 text-white drop-shadow-lg z-30">
              <div className="text-[8px] font-medium leading-tight">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(foundRecord.date).getDay()]}
              </div>
              <div className="text-xl font-bold leading-tight font-serif">
                {new Date(foundRecord.date).getDate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

