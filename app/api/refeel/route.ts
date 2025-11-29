import { NextRequest, NextResponse } from 'next/server';
import { generateRefeel, checkRefeelStatus } from '@/lib/ai/refeelClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, dateRange, tags, records } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Invalid request: templateId required' },
        { status: 400 }
      );
    }

    // REFEEL 영상 생성 요청
    const response = await generateRefeel({
      templateId,
      dateRange,
      tags,
      records,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Refeel generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid request: videoId required' },
        { status: 400 }
      );
    }

    // REFEEL 영상 상태 확인
    const status = await checkRefeelStatus(videoId);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Refeel status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

