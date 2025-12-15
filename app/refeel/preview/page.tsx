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
  } else if (templateId === 'yearly-archive') {
    return { src: '/Video1-편지.mp4', thumbnail: '/Video1-thum-편지.png' };
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduleMessage, setScheduleMessage] = useState('');

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

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('날짜와 시간을 선택해주세요.');
      return;
    }
    if (selectedRecipients.length === 0) {
      alert('수신자를 선택해주세요.');
      return;
    }
    
    // 예약발송 저장 로직 (추후 구현)
    alert(`예약발송이 설정되었습니다.\n날짜: ${scheduleDate}\n시간: ${scheduleTime}\n수신자: ${selectedRecipients.join(', ')}`);
    setShowScheduleModal(false);
    // 상태 초기화
    setScheduleDate('');
    setScheduleTime('');
    setSelectedRecipients([]);
    setScheduleMessage('');
  };

  const toggleRecipient = (recipient: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipient) 
        ? prev.filter(r => r !== recipient)
        : [...prev, recipient]
    );
  };

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = '09:00';
    setScheduleDate(dateStr);
    setScheduleTime(timeStr);
  }, []);

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
            <button
              onClick={handleSubmit}
              className="text-primary-500 font-bold hover:text-primary-600 transition-colors"
            >
              완료
            </button>
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
              onSchedule={handleSchedule}
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
        </div>

        {/* 예약발송 모달 */}
        {showScheduleModal && (
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <div 
              className="bg-white rounded-material-md w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">예약발송 설정</h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 날짜 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      발송 날짜
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* 시간 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      발송 시간
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* 수신자 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수신자 선택
                    </label>
                    <div className="space-y-2">
                      {['가족', '친구', '동료', '지인'].map((recipient) => (
                        <label
                          key={recipient}
                          className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(recipient)}
                            onChange={() => toggleRecipient(recipient)}
                            className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-3 text-gray-700">{recipient}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 메시지 작성 (선택사항) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      메시지 (선택사항)
                    </label>
                    <textarea
                      value={scheduleMessage}
                      onChange={(e) => setScheduleMessage(e.target.value)}
                      placeholder="영상과 함께 전달할 메시지를 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowScheduleModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleScheduleConfirm}
                    variant="primary"
                    className="flex-1"
                  >
                    예약하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

