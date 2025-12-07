'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
import MobileFrame from '@/components/layout/MobileFrame';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { RefeelRequest } from '@/lib/types';
import templatesData from '@/data/templates.json';
import mockRecords from '@/data/mockRecords.json';
import { Record, RefeelTemplate } from '@/lib/types';
import { getRecordImage } from '@/lib/utils/recordUtils';

function SelectRangePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<RefeelTemplate | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [records] = useState<Record[]>(mockRecords as Record[]);
  const [selectedMonthlyRecords, setSelectedMonthlyRecords] = useState<Record[]>([]);

  useEffect(() => {
    const found = (templatesData as RefeelTemplate[]).find((t) => t.id === templateId);
    setTemplate(found || null);
    
    // 템플릿별 기본 태그 자동 선택
    if (found && found.defaultTags && found.defaultTags.length > 0) {
      const allTags = Array.from(new Set(records.flatMap((r) => r.tags)));
      const availableDefaultTags = found.defaultTags.filter(tag => 
        allTags.some(t => t.includes(tag) || tag.includes(t))
      );
      if (availableDefaultTags.length > 0) {
        // 관련 태그 찾기 (부분 일치)
        const relatedTags = allTags.filter(tag => 
          found.defaultTags!.some(defaultTag => 
            tag.includes(defaultTag) || defaultTag.includes(tag)
          )
        );
        setSelectedTags(relatedTags);
      }
    }
  }, [templateId, records]);

  // 일년 아카이브용: 월별로 기록 그룹화
  const recordsByMonth = records.reduce((acc, record) => {
    const monthKey = record.date.substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(record);
    return acc;
  }, {} as Record<string, Record[]>);

  const allTags = Array.from(new Set(records.flatMap((r) => r.tags)));
  
  // 템플릿별 관련 태그 필터링
  const relevantTags = template?.defaultTags && template.defaultTags.length > 0
    ? allTags.filter(tag => 
        template.defaultTags!.some(defaultTag => 
          tag.includes(defaultTag) || defaultTag.includes(tag)
        )
      )
    : allTags;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // 일년 아카이브: 월별로 1장씩 선택
  const handleMonthlyRecordSelect = (monthKey: string, record: Record) => {
    setSelectedMonthlyRecords((prev) => {
      const filtered = prev.filter(r => {
        const rMonth = r.date.substring(0, 7);
        return rMonth !== monthKey;
      });
      return [...filtered, record];
    });
  };

  const handleSubmit = () => {
    let finalTags = selectedTags.length > 0 ? selectedTags : undefined;
    let finalRecords: string[] | undefined = undefined;

    // 일년 아카이브의 경우 선택된 월별 기록 사용
    if (template?.id === 'yearly-archive' && selectedMonthlyRecords.length > 0) {
      finalRecords = selectedMonthlyRecords.map(r => r.id);
      finalTags = undefined; // 일년 아카이브는 태그 대신 기록 ID 사용
    }

    const request: RefeelRequest = {
      templateId: templateId || '',
      tags: finalTags,
      records: finalRecords,
      dateRange:
        dateRange.start && dateRange.end
          ? { start: dateRange.start, end: dateRange.end }
          : undefined,
    };

    // 요청 생성 후 미리보기 페이지로 이동
    router.push(`/refeel/preview?templateId=${templateId}`);
  };

  if (!template) {
    return (
      <MobileFrame>
        <div className="p-6 text-center">
          <p>템플릿을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/refeel')} className="mt-4">
            돌아가기
          </Button>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex flex-col h-screen">
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/refeel')}
              className="text-gray-700 font-medium"
            >
              ← 뒤로
            </button>
            <h1 className="text-lg font-semibold">{template.name}</h1>
            <div className="w-8" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
          {/* 일년 아카이브: 월별 사진 선택 */}
          {template?.id === 'yearly-archive' ? (
            <div>
              <h2 className="font-semibold mb-3">각 월 대표 사진 선택</h2>
              <p className="text-sm text-gray-600 mb-4">각 월마다 1장씩 선택해주세요</p>
              <div className="space-y-4">
                {Object.entries(recordsByMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([monthKey, monthRecords]) => {
                    const selectedRecord = selectedMonthlyRecords.find(
                      r => r.date.substring(0, 7) === monthKey
                    );
                    const monthDate = new Date(monthKey + '-01');
                    const monthLabel = `${monthDate.getFullYear()}년 ${monthDate.getMonth() + 1}월`;
                    
                    return (
                      <div key={monthKey} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{monthLabel}</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {monthRecords.slice(0, 6).map((record, idx) => {
                            const isSelected = selectedRecord?.id === record.id;
                            const { imageUrl } = getRecordImage(record, idx);
                            
                            return (
                              <div
                                key={record.id}
                                onClick={() => handleMonthlyRecordSelect(monthKey, record)}
                                className={`relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                                  isSelected
                                    ? 'border-primary-500 ring-2 ring-primary-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <img
                                  src={imageUrl}
                                  alt={record.summary || '기록'}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {selectedRecord && (
                          <p className="text-xs text-gray-600 mt-2">
                            선택됨: {new Date(selectedRecord.date).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-semibold mb-3">기간 선택 (선택사항)</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">시작일</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">종료일</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-semibold mb-3">
                  태그 선택 {template?.defaultTags && template.defaultTags.length > 0 && '(관련 태그 자동 선택됨)'}
                </h2>
                {template?.defaultTags && template.defaultTags.length > 0 && (
                  <p className="text-sm text-gray-600 mb-3">
                    {template.name}에 맞는 태그가 자동으로 선택되었습니다. 필요시 추가/제거할 수 있습니다.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {relevantTags.map((tag) => {
                    const isDefault = template?.defaultTags?.some(dt => 
                      tag.includes(dt) || dt.includes(tag)
                    );
                    return (
                      <Tag
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={
                          selectedTags.includes(tag)
                            ? 'bg-green-500 text-white'
                            : isDefault
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-green-100 text-green-700'
                        }
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </div>
                {relevantTags.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    관련 태그가 없습니다. 모든 태그를 확인하려면 아래를 보세요.
                  </p>
                )}
                {template?.defaultTags && template.defaultTags.length > 0 && allTags.length > relevantTags.length && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-600 cursor-pointer">모든 태그 보기</summary>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allTags.filter(tag => !relevantTags.includes(tag)).map((tag) => (
                        <Tag
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={
                            selectedTags.includes(tag)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </>
          )}

          <Button onClick={handleSubmit} className="w-full" variant="primary">
            다음 단계
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}

export default function SelectRangePage() {
  return (
    <Suspense fallback={
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-700 font-medium">로딩 중...</p>
        </div>
      </MobileFrame>
    }>
      <SelectRangePageContent />
    </Suspense>
  );
}

