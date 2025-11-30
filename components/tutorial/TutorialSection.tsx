'use client';

import React from 'react';

interface TutorialStep {
  day: string;
  title: string;
  description: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    day: '1일차',
    title: '오늘 하루만 적어보세요',
    description: 'AI가 읽고 분석해드려요. 주제가 뭔지, 기분이 어땠는지 자동으로 파악합니다.',
  },
  {
    day: '2일차',
    title: '어제와 오늘을 비교해봐요',
    description: '"어제랑 기분이 비슷하네?" "생각이 달라졌네?" 두 개만 적어도 변화가 보이기 시작합니다.',
  },
  {
    day: '3-5일차',
    title: '내 패턴이 보여요',
    description: '"아, 나 월요일마다 우울하구나" 이제 감정 차트와 주제 분석이 나타납니다.',
  },
  {
    day: '일주일 후',
    title: '나를 알게 됩니다',
    description: '걱정했던 것보다 실제는 괜찮았다는 걸 발견해요. 당신의 생각 vs 현실을 분석해드립니다.',
  },
];

export default function TutorialSection() {
  return (
    <div className="mt-8 space-y-6">
      <div className="text-left mb-6">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">하나씩 천천히 기록해봐요</h3>
        <p className="text-gray-600 text-sm">
          부담 갖지 마세요. 한 줄 적는 것부터 시작하면 됩니다
        </p>
      </div>

      <div className="space-y-4">
        {tutorialSteps.map((step, index) => (
          <div key={step.day} className="bg-gray-50 rounded-material-md p-4 border border-gray-200">
            <div className="space-y-3">
              <div>
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-300">
                  {step.day}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

