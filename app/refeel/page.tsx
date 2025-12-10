'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
import TemplateGrid from '@/components/refeel/TemplateGrid';
import { RefeelTemplate } from '@/lib/types';
import templatesData from '@/data/templates.json';

const videos = [
  { id: '1', src: '/Video1-가사.mp4', thumbnail: '/Video1-thum.png', title: 'Video 1' },
  { id: '2', src: '/Video-2.mp4', thumbnail: '/Video2-thum.png', title: 'Video 2' },
  { id: '3', src: '/Video1-편지.mp4', thumbnail: '/Video1-thum-편지.png', title: 'Video1-편지' },
];

export default function RefeelPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<RefeelTemplate | null>(null);
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState<{ src: string; thumbnail: string } | null>(null);
  const templates = templatesData as RefeelTemplate[];

  const handleTemplateSelect = (template: RefeelTemplate) => {
    setSelectedTemplate(template);
    router.push(`/refeel/select-range?templateId=${template.id}`);
  };

  const handleVideoClick = (video: typeof videos[0]) => {
    setExpandedVideo({ src: video.src, thumbnail: video.thumbnail });
  };

  // 비디오 갤러리 뷰
  if (showVideoGallery) {
    return (
      <MobileFrame>
      <div className="flex flex-col h-full relative">
        <div className="pt-6 px-4">
          <div className="mb-2 pb-2 border-b border-gray-200 pl-[10px] flex items-center gap-3">
            <button
              onClick={() => setShowVideoGallery(false)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">만든 영상 보기</h1>
          </div>
          <div className="pb-[10px]"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4">
            {/* 갤러리 그리드 - 3열 */}
            <div className="grid grid-cols-3 gap-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* 썸네일 이미지 */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Black Dim 오버레이 */}
                  <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
                  
                  {/* 비디오 (호버 시 재생) */}
                  <video
                    src={video.src}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    muted
                    playsInline
                    loop
                    preload="metadata"
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
                    <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 비디오 확대 팝업 */}
          {expandedVideo && (
            <div
              className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 rounded-3xl"
              onClick={() => setExpandedVideo(null)}
            >
              <div className="relative w-full max-w-2xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedVideo(null);
                  }}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <video
                  src={expandedVideo.src}
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <BottomNavigation />
        </div>
      </MobileFrame>
    );
  }

  // 기본 뷰
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
              <h2 
                className="text-lg font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => setShowVideoGallery(true)}
              >
                만든 영상 보기
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
                  onClick={() => setShowVideoGallery(true)}
                >
                  {/* 썸네일 이미지 */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Black Dim 오버레이 */}
                  <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
                  
                  {/* 비디오 (호버 시 재생) */}
                  <video
                    src={video.src}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    muted
                    playsInline
                    loop
                    preload="metadata"
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
              ))}
            </div>
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

