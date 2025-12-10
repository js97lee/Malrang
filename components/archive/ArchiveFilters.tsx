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
  const [isKeywordExpanded, setIsKeywordExpanded] = useState(false);

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
      
      {/* 키워드 태그 필터 */}
      {tags.length > 0 && (
        <div>
          <button
            onClick={() => setIsKeywordExpanded(!isKeywordExpanded)}
            className="flex items-center justify-between w-full mb-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            <span>키워드로 필터링</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {isKeywordExpanded ? '접기' : '펼치기'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isKeywordExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
          {isKeywordExpanded && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

