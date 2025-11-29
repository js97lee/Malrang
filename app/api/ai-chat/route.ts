import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage, extractEmotions } from '@/lib/ai/chatClient';
import { ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // AI 대화 처리
    const response = await sendChatMessage({
      messages: messages as ChatMessage[],
      context,
    });

    // 마지막 메시지에서 감정 추출
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'answer') {
      const emotions = await extractEmotions(lastMessage.content);
      response.emotions = emotions;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

