import OpenAI from 'openai';
import { ChatMessage } from '../types';

export interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
}

export interface ChatResponse {
  message: string;
  emotions?: string[];
  tags?: string[];
  summary?: string;
}

// OpenAI 클라이언트 초기화
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY가 설정되지 않았습니다.');
    return null;
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * AI 대화 요청을 처리하는 클라이언트
 * OpenAI GPT를 사용하여 대화 생성
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const openai = getOpenAIClient();
  
  // API 키가 없으면 시뮬레이션 응답 반환
  if (!openai) {
    const lastMessage = request.messages[request.messages.length - 1];
    if (lastMessage.type === 'answer') {
      return {
        message: '더 자세히 이야기해주세요. 어떤 감정을 느꼈나요?',
        emotions: ['joy', 'love'],
        tags: ['일상', '추억'],
        summary: '사용자의 답변을 요약한 내용',
      };
    }
    return {
      message: '안녕하세요! 오늘 하루는 어떠셨나요?',
    };
  }

  try {
    // ChatMessage를 OpenAI 형식으로 변환
    const openaiMessages = request.messages
      .filter(msg => msg.type === 'question' || msg.type === 'answer')
      .map(msg => ({
        role: (msg.type === 'question' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: msg.content,
      }));

    // 시스템 프롬프트 추가
    const systemPrompt = `당신은 따뜻하고 공감적인 AI 어시스턴트입니다. 사용자의 일상과 감정을 듣고 공감하며, 자연스럽게 대화를 이어갑니다. 
사용자가 더 깊이 이야기할 수 있도록 질문을 던지고, 감정을 이해하려고 노력합니다. 
대화는 친근하고 편안한 톤으로 진행됩니다.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 또는 'gpt-3.5-turbo' (더 저렴)
      messages: [
        { role: 'system', content: systemPrompt },
        ...openaiMessages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';
    
    // 감정 추출 (간단한 키워드 기반, 추후 개선 가능)
    const emotions = await extractEmotions(
      request.messages
        .filter(msg => msg.type === 'answer')
        .map(msg => msg.content)
        .join(' ')
    );

    return {
      message: aiMessage,
      emotions,
      tags: [],
      summary: undefined,
    };
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    // 오류 발생 시 기본 응답 반환
    return {
      message: '더 자세히 이야기해주세요. 어떤 감정을 느꼈나요?',
      emotions: [],
    };
  }
}

/**
 * 음성 입력을 텍스트로 변환
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // TODO: 실제 음성 인식 API 연동 (Web Speech API 또는 서버 API)
  return '음성 입력이 텍스트로 변환되었습니다.';
}

/**
 * 대화에서 감정 추출
 */
export async function extractEmotions(text: string): Promise<string[]> {
  // TODO: 실제 감정 분석 API 연동
  const emotions: string[] = [];
  
  // 간단한 키워드 기반 감정 추출 (예시)
  if (text.includes('행복') || text.includes('기쁨') || text.includes('좋아')) {
    emotions.push('joy');
  }
  if (text.includes('사랑') || text.includes('좋아해')) {
    emotions.push('love');
  }
  if (text.includes('슬픔') || text.includes('우울')) {
    emotions.push('sadness');
  }
  
  return emotions;
}

