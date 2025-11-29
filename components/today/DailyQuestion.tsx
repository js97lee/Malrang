import React from 'react';

interface DailyQuestionProps {
  question: string;
}

export default function DailyQuestion({ question }: DailyQuestionProps) {
  return (
    <div className="bg-primary-50 p-6 rounded-material-md mb-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">💭</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 text-lg leading-relaxed font-medium">{question}</p>
        </div>
      </div>
    </div>
  );
}

