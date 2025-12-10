import React from 'react';
import Button from '@/components/ui/Button';

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail?: string;
  onThumbnailClick?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function VideoCard({
  title,
  description,
  thumbnail,
  onThumbnailClick,
  onDownload,
  onShare,
}: VideoCardProps) {
  return (
    <div className="bg-surface rounded-material-md overflow-hidden transition-shadow">
      {thumbnail ? (
        <div 
          className="aspect-[3/4] bg-gray-200 overflow-hidden cursor-pointer relative group"
          onClick={onThumbnailClick}
        >
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          {/* 재생 오버레이 */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[3/4] bg-primary-50 flex items-center justify-center">
          <span className="text-6xl">🎬</span>
        </div>
      )}
      <div className="px-4 pt-4 pb-0">
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex gap-2">
          {onDownload && (
            <Button onClick={onDownload} variant="outline" className="flex-1">
              다운로드
            </Button>
          )}
          {onShare && (
            <Button onClick={onShare} variant="primary" className="flex-1">
              공유하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

