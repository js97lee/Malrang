import React from 'react';

interface DailyQuestionProps {
  question: string;
}

export default function DailyQuestion({ question }: DailyQuestionProps) {
  return (
    <div className="bg-primary-50 px-4 py-4 rounded-material-md mb-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">💭</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 text-base leading-relaxed font-medium">{question}</p>
        </div>
      </div>
    </div>
  );
}

