'use client';

import React from 'react';
import { RefeelTemplate } from '@/lib/types';

interface TemplateGridProps {
  templates: RefeelTemplate[];
  onTemplateSelect: (template: RefeelTemplate) => void;
}

export default function TemplateGrid({ templates, onTemplateSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => onTemplateSelect(template)}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer transition"
        >
          <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
        </div>
      ))}
    </div>
  );
}

