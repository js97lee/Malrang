import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage, extractEmotions } from '@/lib/ai/chatClient';
import { ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context, imageAnalysis } = body;

    console.log('📥 AI 채팅 API 요청 받음:', {
      messageCount: messages?.length || 0,
      hasContext: !!context,
      hasImageAnalysis: !!imageAnalysis,
    });

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ 잘못된 요청: messages 배열이 필요합니다.');
      return NextResponse.json(
        { error: 'Invalid request: messages array required', message: '메시지 배열이 필요합니다.' },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      console.error('❌ 잘못된 요청: 메시지가 비어있습니다.');
      return NextResponse.json(
        { error: 'Invalid request: messages cannot be empty', message: '메시지가 비어있습니다.' },
        { status: 400 }
      );
    }

    // AI 대화 처리 (이미지 분석 결과 포함)
    console.log('🔄 AI 대화 처리 시작...');
    const response = await sendChatMessage({
      messages: messages as ChatMessage[],
      context,
      imageAnalysis, // 이미지 분석 결과 전달
    });

    console.log('✅ AI 응답 생성 완료:', {
      hasMessage: !!response.message,
      messageLength: response.message?.length || 0,
      emotionsCount: response.emotions?.length || 0,
    });

    // 응답 메시지가 없으면 에러
    if (!response.message || response.message.trim() === '') {
      console.error('❌ AI 응답이 비어있습니다.');
      return NextResponse.json(
        { error: 'Empty response from AI', message: 'AI 응답을 받지 못했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 마지막 메시지에서 감정 추출
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'answer') {
      const emotions = await extractEmotions(lastMessage.content);
      response.emotions = emotions;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ AI chat API 오류:', error);
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || '서버 오류가 발생했습니다. 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}

