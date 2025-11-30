'use client';

import React, { useState } from 'react';
import Tag from '@/components/ui/Tag';

interface ArchiveFiltersProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onSearchChange: (query: string) => void;
}

export default function ArchiveFilters({
  tags,
  selectedTags,
  onTagToggle,
  onSearchChange,
}: ArchiveFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="검색..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}

