'use client';

import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import Button from '@/components/ui/Button';

export default function SubmitPage() {
  const router = useRouter();

  return (
    <MobileFrame>
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">요청 완료</h1>
          <p className="text-gray-700 font-medium">
            영상 생성 요청이 완료되었습니다.<br />
            완성되면 알림을 드리겠습니다.
          </p>
          <div className="pt-4">
            <Button onClick={() => router.push('/refeel')} variant="primary" className="w-full">
              홈으로 가기
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

