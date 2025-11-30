import React from 'react';

interface TagProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Tag({ children, onClick, className = '' }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${onClick ? 'cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity' : ''} ${className || 'bg-primary-100 text-primary-700'}`}
    >
      {children}
    </span>
  );
}

