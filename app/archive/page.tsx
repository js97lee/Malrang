'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ArchiveList from '@/components/archive/ArchiveList';
import ArchiveFilters from '@/components/archive/ArchiveFilters';
import VisualBoard from '@/components/archive/VisualBoard';
import { Record } from '@/lib/types';
import mockRecords from '@/data/mockRecords.json';
import { getAllConversations, conversationToRecord } from '@/lib/utils/conversationStorage';

export default function ArchivePage() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  
  useEffect(() => {
    // 저장된 대화 데이터 가져오기
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    
    // Mock 데이터와 합치기 (타입 변환)
    const mockRecordsTyped = (mockRecords as any[]).map(record => ({
      ...record,
      emotions: (record.emotions || []) as any,
      tags: record.tags || [],
    })) as Record[];
    
    const combinedRecords: Record[] = [...conversationRecords, ...mockRecordsTyped];
    setRecords(combinedRecords);
  }, []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  const handleRecordClick = (record: Record) => {
    setSelectedRecord(record);
    // 대화 기록 찾기
    const conversations = getAllConversations();
    const conversation = conversations.find(conv => conv.id === record.id);
    if (conversation) {
      setSelectedConversation(conversation);
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

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <Header />
        
        <div className="p-4 border-b border-gray-200">

          <div className="flex gap-2">
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
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-variant text-gray-700'
              }`}
            >
              달력
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'list' && (
            <>
              <ArchiveFilters
                tags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onSearchChange={setSearchQuery}
              />
              <ArchiveList records={filteredRecords} onRecordClick={handleRecordClick} />
            </>
          )}
          {viewMode === 'calendar' && (
            <VisualBoard records={filteredRecords} viewMode="calendar" onRecordClick={handleRecordClick} />
          )}
          
          {/* 대화 기록 모달 */}
          {selectedRecord && selectedConversation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-material-md p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">대화 기록</h2>
                  <button
                    onClick={() => {
                      setSelectedRecord(null);
                      setSelectedConversation(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* 썸네일 이미지 */}
                  {selectedRecord.images && selectedRecord.images.length > 0 && (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <img
                        src={selectedRecord.images[0]}
                        alt={selectedRecord.summary || '기록'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">날짜</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedRecord.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">질문</p>
                    <p className="text-gray-900">{selectedConversation.question}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">대화 내용</p>
                    {selectedConversation.messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'question' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-material-md p-3 ${
                            message.type === 'question'
                              ? 'bg-surface-variant text-gray-900'
                              : 'bg-primary-500 text-white'
                          }`}
                        >
                          {message.type === 'image' && message.images && (
                            <div className="mb-2 space-y-2">
                              {message.images.map((img: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Uploaded ${idx + 1}`}
                                  className="w-full rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

