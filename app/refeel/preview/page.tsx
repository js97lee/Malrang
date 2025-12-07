'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
import MobileFrame from '@/components/layout/MobileFrame';
import Button from '@/components/ui/Button';
import VideoCard from '@/components/refeel/VideoCard';
import { RefeelTemplate } from '@/lib/types';
import templatesData from '@/data/templates.json';

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<RefeelTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const found = (templatesData as RefeelTemplate[]).find((t) => t.id === templateId);
    if (found) {
      setTemplate(found);
      // 생성 시뮬레이션
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    } else {
      // 템플릿을 찾을 수 없으면 릴스 홈으로 리다이렉트
      router.push('/refeel');
    }
  }, [templateId, router]);

  const handleSubmit = () => {
    router.push('/refeel/submit');
  };

  if (!template) {
    return (
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-700 font-medium">로딩 중...</p>
        </div>
      </MobileFrame>
    );
  }

  if (isGenerating) {
    return (
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-700 font-medium">영상을 생성하고 있습니다...</p>
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
            <h1 className="text-lg font-semibold">미리보기</h1>
            <div className="w-8" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">생성된 스토리</h2>
            <p className="text-gray-700 text-sm font-medium">
              선택하신 기록들을 기반으로 영상이 생성되었습니다.
            </p>
          </div>

          <VideoCard
            title={template.name}
            description="선택하신 기록들을 기반으로 제작된 기념 영상입니다."
            onView={() => console.log('영상 보기')}
            onDownload={() => console.log('다운로드')}
          />

          <div className="mt-6">
            <Button onClick={handleSubmit} className="w-full" variant="primary">
              완료
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-700 font-medium">로딩 중...</p>
        </div>
      </MobileFrame>
    }>
      <PreviewPageContent />
    </Suspense>
  );
}

