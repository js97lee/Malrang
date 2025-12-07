import React from 'react';

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="pt-6 px-4">
      <div className="mb-2 pb-2 border-b border-gray-200 pl-[10px]">
        <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
      </div>
      <div className="pb-[10px]"></div>
    </div>
  );
}






