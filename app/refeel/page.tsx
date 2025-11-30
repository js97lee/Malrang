'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
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
        <PageHeader title="릴스" />
        <div className="flex-1 overflow-y-auto pt-0 px-6 pb-6">
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

