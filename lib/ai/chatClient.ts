import OpenAI from 'openai';
import { ChatMessage } from '../types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
  imageAnalysis?: string; // 이미지 분석 결과
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
    console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다. .env.local 파일에 API 키를 추가해주세요.');
    return null;
  }
  
  if (apiKey.length < 20) {
    console.error('❌ OPENAI_API_KEY가 유효하지 않습니다. 올바른 API 키를 확인해주세요.');
    return null;
  }
  
  console.log('✅ OpenAI API 클라이언트 초기화 완료');
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
  
  // API 키가 없으면 명확한 에러 메시지 반환
  if (!openai) {
    console.error('❌ OpenAI API 키가 설정되지 않았습니다.');
    return {
      message: '⚠️ OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY를 추가해주세요.',
      emotions: [],
    };
  }

  try {
    // ChatMessage를 OpenAI 형식으로 변환 (이미지 메시지도 포함)
    const openaiMessages: ChatCompletionMessageParam[] = [];
    
    console.log('📝 대화 메시지 변환 시작:', { totalMessages: request.messages.length });
    
    for (const msg of request.messages) {
      if (msg.type === 'question') {
        openaiMessages.push({
          role: 'assistant',
          content: msg.content,
        });
        console.log('  - AI 메시지:', msg.content.substring(0, 50));
      } else if (msg.type === 'answer') {
        openaiMessages.push({
          role: 'user',
          content: msg.content,
        });
        console.log('  - 사용자 메시지:', msg.content.substring(0, 50));
      } else if (msg.type === 'image' && msg.images && msg.images.length > 0) {
        // 이미지 메시지 처리 - 이미지 분석 결과가 있으면 포함
        const imageContent = request.imageAnalysis 
          ? `[사진 첨부됨] ${request.imageAnalysis}\n\n위 내용은 사용자가 첨부한 사진에 대한 상세 분석입니다. 이 분석을 바탕으로 사진의 내용, 분위기, 감정을 이해하고 사용자에게 자연스럽고 따뜻하게 응답해주세요.`
          : '사용자가 사진을 첨부했습니다.';
        
        openaiMessages.push({
          role: 'user',
          content: imageContent,
        });
        console.log('  - 이미지 메시지:', imageContent.substring(0, 100));
      }
    }
    
    console.log('✅ 변환된 메시지 수:', openaiMessages.length);

    // 시스템 프롬프트 추가 (대화 맥락 유지 강조)
    const hasImageAnalysis = !!request.imageAnalysis;
    
    // 사용자가 이전에 언급한 주요 내용 추출 (감정, 사람, 장소, 활동 등)
    const userMessages = request.messages.filter(msg => msg.type === 'answer');
    const previousContext = userMessages.length > 1 
      ? userMessages.slice(0, -1).map(msg => msg.content).join(' ')
      : '';
    
    const systemPrompt = `당신은 따뜻하고 공감적인 AI 어시스턴트입니다. 사용자의 일상과 감정을 듣고 공감하며, 자연스럽게 대화를 이어갑니다.

**중요한 대화 원칙:**
1. **이전 대화 내용을 반드시 참고하세요**: 사용자가 이전에 언급한 사람, 장소, 감정, 상황 등을 자연스럽게 언급하며 대화를 이어가세요.
2. **대화의 연속성 유지**: 사용자가 "친구와 만났다"고 말했다면, 다음 대화에서 "그 친구와의 만남은 어땠어요?"처럼 이어가세요.
3. **구체적인 질문**: "더 자세히 이야기해주세요" 같은 일반적인 질문보다, 사용자가 언급한 구체적인 내용을 바탕으로 질문하세요.
4. **감정 공감**: 사용자가 표현한 감정을 인정하고, 그 감정에 대해 더 깊이 탐구하는 질문을 하세요.

**대화 톤**: 친근하고 편안하며, 사용자의 이야기를 진심으로 듣고 있다는 느낌을 주세요.
${previousContext ? `\n**이전 대화 맥락**: ${previousContext.substring(0, 200)}...` : ''}
${hasImageAnalysis ? '\n**중요**: 사용자가 사진을 첨부했고, 대화 내용에 사진에 대한 상세 분석이 포함되어 있습니다. 반드시 사진의 내용을 참고하여 구체적이고 맥락에 맞는 답변을 해주세요. 사진을 보지 못했다고 말하지 마세요.' : ''}`;

    console.log('🚀 OpenAI API 호출 시작...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...openaiMessages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';
    console.log('✅ OpenAI 응답 받음:', aiMessage.substring(0, 100));
    
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
  } catch (error: any) {
    console.error('❌ OpenAI API 오류:', error);
    console.error('오류 상세:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });
    
    // 에러 타입에 따른 사용자 친화적인 메시지 생성
    let userFriendlyMessage = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
    
    if (error.status === 429) {
      // 할당량 초과 에러
      userFriendlyMessage = 'OpenAI API 사용 한도를 초과했습니다. 계정의 결제 정보와 사용량을 확인해주세요. 잠시 후 다시 시도해주시거나, OpenAI 대시보드에서 사용량을 확인해주세요.';
    } else if (error.status === 401) {
      // 인증 에러
      userFriendlyMessage = 'OpenAI API 키가 유효하지 않습니다. .env.local 파일의 OPENAI_API_KEY를 확인해주세요.';
    } else if (error.status === 500 || error.status >= 500) {
      // 서버 에러
      userFriendlyMessage = 'OpenAI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message) {
      // 기타 에러 (에러 메시지를 간단하게 표시)
      const errorMsg = error.message;
      if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
        userFriendlyMessage = 'OpenAI API 사용 한도를 초과했습니다. 계정의 결제 정보를 확인해주세요.';
      } else if (errorMsg.includes('rate limit')) {
        userFriendlyMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else {
        userFriendlyMessage = `오류가 발생했습니다: ${errorMsg.substring(0, 100)}`;
      }
    }
    
    return {
      message: userFriendlyMessage,
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

