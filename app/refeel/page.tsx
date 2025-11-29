'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import RefeelHero from '@/components/refeel/RefeelHero';
import TemplateGrid from '@/components/refeel/TemplateGrid';
import { RefeelTemplate } from '@/lib/types';
import templatesData from '@/data/templates.json';

export default function RefeelPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<RefeelTemplate | null>(null);
  const templates = templatesData as RefeelTemplate[];

  const handleTemplateSelect = (template: RefeelTemplate) => {
    setSelectedTemplate(template);
    router.push(`/refeel/select-range?templateId=${template.id}`);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <Header />

        <div className="flex-1 overflow-y-auto p-6">
          <RefeelHero />
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4">템플릿 선택</h2>
            <TemplateGrid templates={templates} onTemplateSelect={handleTemplateSelect} />
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

