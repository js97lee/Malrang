import React from 'react';
import Button from '@/components/ui/Button';

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail?: string;
  onThumbnailClick?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onSchedule?: () => void;
}

export default function VideoCard({
  title,
  description,
  thumbnail,
  onThumbnailClick,
  onDownload,
  onShare,
  onSchedule,
}: VideoCardProps) {
  return (
    <div className="bg-surface rounded-material-md overflow-hidden transition-shadow">
      {thumbnail ? (
        <div 
          className="aspect-[3/4] bg-gray-200 overflow-hidden cursor-pointer relative group rounded-t-material-md rounded-b-material-md"
          style={{ height: '520px' }}
          onClick={onThumbnailClick}
        >
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          {/* 재생 오버레이 */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[3/4] bg-primary-50 flex items-center justify-center rounded-t-material-md rounded-b-material-md" style={{ height: '520px' }}>
          <span className="text-4xl">🎬</span>
        </div>
      )}
      <div className="px-4 pt-4 pb-0">
        <h3 className={`${title === '아카이브' ? 'font-bold' : 'font-semibold'} text-gray-800 mb-1`}>{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">다운로드</span>
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <span className="text-sm font-medium">공유하기</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            )}
          </div>
          {onSchedule && (
            <Button onClick={onSchedule} variant="primary" className="w-full flex items-center justify-center gap-2 !rounded-lg">
              <span>예약발송</span>
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

