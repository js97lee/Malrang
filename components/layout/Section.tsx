import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Section({ children, title, className = '' }: SectionProps) {
  return (
    <section className={`py-12 px-4 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
      )}
      {children}
    </section>
  );
}

