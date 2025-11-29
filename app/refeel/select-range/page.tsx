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

function SelectRangePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<RefeelTemplate | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [records] = useState<Record[]>(mockRecords as Record[]);

  useEffect(() => {
    const found = (templatesData as RefeelTemplate[]).find((t) => t.id === templateId);
    setTemplate(found || null);
  }, [templateId]);

  const allTags = Array.from(new Set(records.flatMap((r) => r.tags)));

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const request: RefeelRequest = {
      templateId: templateId || '',
      tags: selectedTags.length > 0 ? selectedTags : undefined,
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <h2 className="font-semibold mb-3">태그 선택 (선택사항)</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Tag
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={
                    selectedTags.includes(tag)
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 text-green-700'
                  }
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

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

