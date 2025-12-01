'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
import ArchiveList from '@/components/archive/ArchiveList';
import ArchiveFilters from '@/components/archive/ArchiveFilters';
import VisualBoard from '@/components/archive/VisualBoard';
import { Record } from '@/lib/types';
import mockRecords from '@/data/mockRecords.json';
import { getAllConversations, conversationToRecord } from '@/lib/utils/conversationStorage';
import { recommendRecords } from '@/lib/utils/recommender';

export default function ArchivePage() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<{ src: string; record: Record } | null>(null);
  
  useEffect(() => {
    // 저장된 대화 데이터 가져오기
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    
    // Mock 데이터와 합치기 (타입 변환)
    const mockRecordsTyped = (mockRecords as any[]).map(record => ({
      ...record,
      emotions: (record.emotions || []) as any,
      tags: record.tags || [],
      images: record.images || [],
    })) as Record[];
    
    // Mock 데이터의 id 목록 (우선 보존)
    const mockRecordIds = new Set(mockRecordsTyped.map(r => r.id));
    
    // conversationRecords에서 mockRecords와 중복되지 않는 것만 필터링
    const uniqueConversationRecords = conversationRecords.filter(
      record => !mockRecordIds.has(record.id)
    );
    
    // Mock 데이터를 먼저 넣고, 그 다음 conversationRecords 추가
    const allRecords = [...mockRecordsTyped, ...uniqueConversationRecords];
    
    // 디버깅: 3번 기록 확인
    console.log('📊 Mock 기록 수:', mockRecordsTyped.length);
    console.log('📊 Conversation 기록 수:', conversationRecords.length);
    console.log('📊 중복 제거 후 Conversation 기록 수:', uniqueConversationRecords.length);
    console.log('📊 전체 기록 수:', allRecords.length);
    console.log('📊 3번 기록:', allRecords.find(r => r.id === '3'));
    console.log('📊 3번 기록 상세:', JSON.stringify(allRecords.find(r => r.id === '3'), null, 2));
    console.log('📊 모든 기록 ID:', allRecords.map(r => r.id));
    
    setRecords(allRecords);
  }, []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [showRecommended, setShowRecommended] = useState(false);
  const [recommendedRecords, setRecommendedRecords] = useState<Record[]>([]);
  
  const handleRecordClick = (record: Record) => {
    // 갤러리 뷰일 때는 이미지 확대 팝업 표시
    if (viewMode === 'calendar') {
      // 이미지 URL 찾기
      const cardIndex = filteredRecords.findIndex(r => r.id === record.id);
      const defaultImageIndex = (cardIndex % 5) + 1;
      const defaultImage = `/card${defaultImageIndex}.png`;
      const imageSrc = record.images && record.images.length > 0 ? record.images[0] : defaultImage;
      
      setExpandedImage({ src: imageSrc, record });
    } else {
      // 리스트 뷰일 때는 대화 기록 페이지로 이동
      router.push(`/archive/${record.id}`);
    }
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    records.forEach((record) => {
      record.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [records]);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedTags.length > 0) {
      filtered = filtered.filter((record) =>
        record.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 최신순 정렬 (가장 최근이 위에)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // 내림차순 (최신이 먼저)
    });
  }, [records, selectedTags, searchQuery]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowRecommended(false);
  };

  const handleRecommend = () => {
    const recommended = recommendRecords(records, selectedRecord || undefined);
    setRecommendedRecords(recommended);
    setShowRecommended(true);
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full relative">
        <div className="pt-6 px-4">
          <div className="mb-2 pb-2 border-b border-gray-200 pl-[10px]">
            <h1 className="text-2xl font-extrabold text-gray-900">아카이브</h1>
          </div>
          <div className="pb-[10px]"></div>
          
          <div className="flex gap-2 pb-4">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-variant text-gray-700'
              }`}
            >
              갤러리
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-variant text-gray-700'
              }`}
            >
              리스트
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 relative">
          {viewMode === 'list' && (
            <>
              <ArchiveFilters
                tags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onSearchChange={setSearchQuery}
              />
              {showRecommended ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">추천 기록</h3>
                  <ArchiveList records={recommendedRecords} onRecordClick={handleRecordClick} />
                </div>
              ) : (
                <ArchiveList records={filteredRecords} onRecordClick={handleRecordClick} />
              )}
            </>
          )}
          {viewMode === 'calendar' && (
            <VisualBoard records={filteredRecords} viewMode="calendar" onRecordClick={handleRecordClick} />
          )}
          
          {/* 이미지 확대 팝업 - MobileFrame 전체 덮기 */}
          {expandedImage && viewMode === 'calendar' && (() => {
            const recordIndex = filteredRecords.findIndex(r => r.id === expandedImage.record.id);
            const isFirstCard = recordIndex === 0;
            
            return (
              <div 
                className="absolute inset-0 bg-black/90 flex items-center justify-center z-[99999]"
                onClick={() => setExpandedImage(null)}
              >
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <button
                    onClick={() => setExpandedImage(null)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img
                    src={expandedImage.src}
                    alt={expandedImage.record.summary || '기록'}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            );
          })()}
          
          {/* 대화 기록 모달 - 갤러리 뷰에서만 사용 (현재는 사용 안 함) - 제거됨 */}
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

