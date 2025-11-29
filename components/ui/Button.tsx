import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  className?: string;
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-38 disabled:cursor-not-allowed uppercase tracking-wide text-sm';
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-surface-variant text-gray-800 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    text: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

