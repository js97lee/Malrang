import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * 이미지 분석 API
 * GPT-4 Vision을 사용하여 이미지를 분석하고 설명 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, conversationHistory } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    
    if (!openai) {
      console.error('❌ OpenAI API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY를 추가해주세요.' },
        { status: 500 }
      );
    }
    
    console.log('✅ 이미지 분석 시작...', { imageUrlLength: imageUrl.length, conversationHistoryLength: conversationHistory?.length || 0 });

    // 이미지를 base64로 변환 (또는 URL 사용)
    // 클라이언트에서 이미지를 base64로 변환하여 전송하는 경우
    let imageContent: string;
    if (imageUrl.startsWith('data:image')) {
      // 이미 base64 형식 (data:image/jpeg;base64,...)
      imageContent = imageUrl;
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // 외부 URL인 경우 직접 사용 가능
      imageContent = imageUrl;
    } else {
      // Blob URL이나 다른 형식은 base64로 변환 필요
      return NextResponse.json(
        { error: '이미지는 base64 형식(data:image/...) 또는 HTTP(S) URL로 전송해주세요.' },
        { status: 400 }
      );
    }

    // 대화 맥락을 고려한 프롬프트 생성
    const contextPrompt = conversationHistory && conversationHistory.length > 0
      ? `이전 대화 맥락: ${conversationHistory.map((msg: any) => 
          msg.type === 'answer' ? `사용자: ${msg.content}` : 
          msg.type === 'question' ? `AI: ${msg.content}` : ''
        ).filter(Boolean).join('\n')}\n\n`
      : '';

    const prompt = `${contextPrompt}이 사진을 매우 자세히 분석해주세요. 다음을 포함해서 답변해주세요:
1. 사진에 무엇이 보이는지 구체적으로 설명 (사람, 물건, 배경, 색상, 분위기 등)
2. 사진에서 느껴지는 감정이나 분위기
3. 사진의 맥락이나 상황 추론
4. 사용자에게 자연스럽고 따뜻하게 물어볼 수 있는 구체적인 질문

한국어로 답변해주세요. 사진의 모든 세부사항을 놓치지 말고 자세히 분석해주세요.`;

    console.log('📸 이미지 분석 API 호출:', { 
      model: 'gpt-4o', 
      imageFormat: imageContent.substring(0, 50),
      promptLength: prompt.length 
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Vision 모델 사용
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageContent,
                detail: 'high', // 고해상도 분석
              },
            },
          ],
        },
      ],
      max_tokens: 800, // 토큰 수 증가
      temperature: 0.7,
    });

    console.log('✅ 이미지 분석 완료:', response.choices[0]?.message?.content?.substring(0, 100));

    const analysis = response.choices[0]?.message?.content || '사진을 확인했습니다. 이 사진에 대해 더 이야기해주세요.';

    return NextResponse.json({
      analysis,
    });
  } catch (error: any) {
    console.error('이미지 분석 오류:', error);
    return NextResponse.json(
      { 
        error: error.message || '이미지 분석 중 오류가 발생했습니다.',
        analysis: '사진을 확인했습니다. 이 사진에 대해 더 이야기해주세요.',
      },
      { status: 500 }
    );
  }
}

