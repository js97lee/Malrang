import { NextRequest, NextResponse } from 'next/server';
import { summarizeConversation } from '@/lib/analytics/summarizer';
import { ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    const summary = await summarizeConversation(messages as ChatMessage[]);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('요약 API 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

