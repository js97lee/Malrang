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

// 템플릿 ID에 따른 비디오 매핑
const getVideoByTemplate = (templateId: string | null) => {
  if (templateId === 'family-letter') {
    return { src: '/Video1-가사.mp4', thumbnail: '/Video1-thum.png' };
  } else if (templateId === 'autobiography') {
    return { src: '/Video-2.mp4', thumbnail: '/Video2-thum.png' };
  }
  // 기본값 (다른 템플릿의 경우)
  return { src: '/Video1-가사.mp4', thumbnail: '/Video1-thum.png' };
};

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<RefeelTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [video, setVideo] = useState<{ src: string; thumbnail: string } | null>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  useEffect(() => {
    const found = (templatesData as RefeelTemplate[]).find((t) => t.id === templateId);
    if (found) {
      setTemplate(found);
      // 템플릿에 맞는 비디오 설정
      const videoData = getVideoByTemplate(templateId);
      setVideo(videoData);
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

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 relative">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">생성된 스토리</h2>
            <p className="text-gray-700 text-sm font-medium">
              선택하신 기록들을 기반으로 영상이 생성되었습니다.
            </p>
          </div>

          <div className="relative">
            <VideoCard
              title={template.name}
              description="선택하신 기록들을 기반으로 제작된 기념 영상입니다."
              thumbnail={video?.thumbnail}
              onThumbnailClick={() => setShowVideoPopup(true)}
              onDownload={() => {
                if (video) {
                  const link = document.createElement('a');
                  link.href = video.src;
                  link.download = `${template.name}.mp4`;
                  link.click();
                }
              }}
              onShare={() => {
                if (video) {
                  // Web Share API 사용 (모바일)
                  if (navigator.share) {
                    navigator.share({
                      title: template.name,
                      text: '생성된 기념 영상을 공유합니다.',
                      url: window.location.href,
                    }).catch(() => {
                      // 공유 취소 시 아무것도 하지 않음
                    });
                  } else {
                    // Web Share API가 없으면 클립보드에 링크 복사
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      alert('링크가 클립보드에 복사되었습니다.');
                    });
                  }
                }
              }}
            />
            
            {/* 비디오 팝업 - 화이트 섹션 내에서만 표시 */}
            {showVideoPopup && video && (
              <div 
                className="absolute inset-0 bg-white rounded-material-md overflow-hidden z-10"
                onClick={() => setShowVideoPopup(false)}
              >
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <button
                    onClick={() => setShowVideoPopup(false)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <video
                    src={video.src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 pb-6 px-4">
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

