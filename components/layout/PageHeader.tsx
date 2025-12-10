import React from 'react';

interface PageHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, rightAction }: PageHeaderProps) {
  return (
    <div className="pt-6 px-4">
      <div className="mb-2 pb-2 border-b border-gray-200 pl-[10px] flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
        {rightAction && <div className="pr-2">{rightAction}</div>}
      </div>
      <div className="pb-[10px]"></div>
    </div>
  );
}






