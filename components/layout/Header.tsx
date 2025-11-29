'use client';

import React, { useState } from 'react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <header className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-center">
        {/* 로고 이미지 - public/logo.png 파일이 있으면 사용, 없으면 텍스트로 표시 */}
        {!imageError ? (
          <img
            src="/logo.png"
            alt="말랑이"
            className="h-5 w-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <h1 className="text-lg font-bold text-gray-900">말랑이</h1>
        )}
      </div>
    </header>
  );
}

