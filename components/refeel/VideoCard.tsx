import React from 'react';
import Button from '@/components/ui/Button';

interface VideoCardProps {
  title: string;
  description: string;
  thumbnail?: string;
  onView?: () => void;
  onDownload?: () => void;
}

export default function VideoCard({
  title,
  description,
  thumbnail,
  onView,
  onDownload,
}: VideoCardProps) {
  return (
    <div className="bg-surface rounded-material-md overflow-hidden transition-shadow">
      {thumbnail ? (
        <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-primary-50 flex items-center justify-center">
          <span className="text-6xl">🎬</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex gap-2">
          {onView && (
            <Button onClick={onView} variant="primary" className="flex-1">
              보기
            </Button>
          )}
          {onDownload && (
            <Button onClick={onDownload} variant="outline" className="flex-1">
              다운로드
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

