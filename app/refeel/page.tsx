'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
import TemplateGrid from '@/components/refeel/TemplateGrid';
import { RefeelTemplate } from '@/lib/types';
import templatesData from '@/data/templates.json';

export default function RefeelPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<RefeelTemplate | null>(null);
  const templates = templatesData as RefeelTemplate[];

  const handleTemplateSelect = (template: RefeelTemplate) => {
    setSelectedTemplate(template);
    router.push(`/refeel/select-range?templateId=${template.id}`);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <PageHeader title="릴스" />
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-0 px-6 pb-6">
          {/* 사진 한 컷 섹션 */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">사진 한 컷, AI가 특별한 영상으로!</h2>
            </div>
            <TemplateGrid templates={templates} onTemplateSelect={handleTemplateSelect} />
          </div>

          {/* 만든 영상 보기 섹션 */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">만든 영상 보기</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Video1 */}
              <div 
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
                onClick={() => {
                  // 영상 재생 또는 상세 보기
                  window.open('/Video1.mp4', '_blank');
                }}
              >
                {/* 썸네일 이미지 */}
                <img
                  src="/Video1-thum.png"
                  alt="Video1"
                  className="w-full h-full object-cover"
                />
                {/* Black Dim 오버레이 */}
                <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
                
                {/* 비디오 (호버 시 재생) */}
                <video
                  src="/Video1.mp4"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  muted
                  playsInline
                  loop
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    video.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    video.pause();
                    video.currentTime = 0;
                  }}
                />
                
                {/* 재생 오버레이 */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none z-30">
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Video2 */}
              <div 
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
                onClick={() => {
                  // 영상 재생 또는 상세 보기
                  window.open('/Video2.mp4', '_blank');
                }}
              >
                {/* 썸네일 이미지 */}
                <img
                  src="/Video2-thum.png"
                  alt="Video2"
                  className="w-full h-full object-cover"
                />
                {/* Black Dim 오버레이 */}
                <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
                
                {/* 비디오 (호버 시 재생) */}
                <video
                  src="/Video2.mp4"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  muted
                  playsInline
                  loop
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    video.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    video.pause();
                    video.currentTime = 0;
                  }}
                />
                
                {/* 재생 오버레이 */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none z-30">
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

