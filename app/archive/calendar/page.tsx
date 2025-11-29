'use client';

import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import VisualBoard from '@/components/archive/VisualBoard';
import mockRecords from '@/data/mockRecords.json';
import { Record } from '@/lib/types';

export default function CalendarPage() {
  const router = useRouter();
  const records = mockRecords as Record[];

  return (
    <MobileFrame>
      <div className="flex flex-col h-screen">
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/archive')}
              className="text-gray-600"
            >
              ← 뒤로
            </button>
            <h1 className="text-lg font-semibold">달력 보기</h1>
            <div className="w-8" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <VisualBoard records={records} viewMode="calendar" />
        </div>
      </div>
    </MobileFrame>
  );
}

