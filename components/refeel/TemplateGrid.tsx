'use client';

import React from 'react';
import { RefeelTemplate } from '@/lib/types';

interface TemplateGridProps {
  templates: RefeelTemplate[];
  onTemplateSelect: (template: RefeelTemplate) => void;
}

// 모의 제작 횟수 데이터
const mockUsageCounts: { [key: string]: string } = {
  'autobiography': '2.6천회',
  'family-letter': '7.5만회',
  'child-growth': '4.8천회',
  'yearly-archive': '3.3천회',
};

export default function TemplateGrid({ templates, onTemplateSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map((template) => {
        const usageCount = mockUsageCounts[template.id] || '1.2천회';
        
        return (
          <div
            key={template.id}
            className="w-full"
          >
            {/* 비디오 프리뷰 카드 */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gray-200">
              {template.thumbnail ? (
                <>
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Black Dim 오버레이 */}
                  <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
              
              {/* 볼륨 아이콘 (우측 상단) */}
              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center z-20">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.793a1 1 0 011.383.07zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* 제목 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 z-20">
                <h3 className="text-white font-semibold text-xs mb-0.5">{template.name}</h3>
                <p className="text-white/80 text-[10px]">{usageCount} 제작됨</p>
              </div>
            </div>
            
            {/* 만들기 버튼 */}
            <button
              onClick={() => onTemplateSelect(template)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              <span className="font-medium">만들기</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

