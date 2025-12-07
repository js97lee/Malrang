'use client';

import React, { useState } from 'react';
import { TutorialStep } from '@/lib/utils/tutorial';

interface TutorialBannerProps {
  step: TutorialStep;
  onDismiss?: () => void;
}

export default function TutorialBanner({ step, onDismiss }: TutorialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary-800 mb-1">{step.title}</h3>
          <p className="text-sm text-primary-700">{step.description}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="ml-4 text-primary-600 hover:text-primary-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}






