'use client';

import React, { useState, useEffect } from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileFrame({ children, className = '' }: MobileFrameProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const frameStyle = isMobile 
    ? { height: '100vh', maxHeight: '100vh' }
    : { height: '900px', maxHeight: '900px' };

  return (
    <div className="flex items-center justify-center min-h-full bg-gray-900 p-4 md:p-8">
      <div 
        className={`w-full max-w-md bg-white rounded-3xl overflow-hidden flex flex-col ${className}`} 
        style={frameStyle}
      >
        {children}
      </div>
    </div>
  );
}

