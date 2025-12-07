'use client';

import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [characterColor, setCharacterColor] = useState<string>('orange');

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // 스플래시 화면에서는 항상 랜덤 캐릭터 선택
    const characterColors = ['black', 'yellow', 'orange', 'green', 'blue'];
    const randomIndex = Math.floor(Math.random() * characterColors.length);
    const selectedColor = characterColors[randomIndex];
    
    setCharacterColor(selectedColor);
    
    // 2초 후 페이드 아웃 시작
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // 2.5초 후 완전히 숨김
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

    return () => {
      window.removeEventListener('resize', checkDevice);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const frameStyle = isMobile 
    ? { height: '100vh', maxHeight: '100vh' }
    : { height: '900px', maxHeight: '900px' };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900 p-4 md:p-8 transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col items-center justify-center"
        style={{
          ...frameStyle,
          backgroundColor: '#F5E6D3'
        }}
      >
        <div className="flex flex-col items-center justify-center px-6 py-8">
          {/* 캐릭터 이미지 */}
          <div className="mb-8">
            <img 
              src={`/character-${characterColor}.png`}
              alt="말랑이 캐릭터" 
              className="w-40 h-40 object-contain"
              onError={(e) => {
                // 이미지가 없으면 기본 캐릭터로 fallback
                const target = e.target as HTMLImageElement;
                target.src = '/character-orange.png';
              }}
            />
          </div>

          {/* 로고/브랜드 영역 */}
          <div className="mb-4 flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="말랑이" 
              className="w-auto mb-4 object-contain"
              style={{ height: '48px' }}
            />
            <p className="text-lg font-bold text-[#5C4033] text-center">AI 기반 감성 아카이빙</p>
          </div>
        </div>
      </div>
    </div>
  );
}
