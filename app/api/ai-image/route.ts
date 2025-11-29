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
 * 이미지 생성 API
 * DALL-E를 사용하여 이미지 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '1024x1024', n = 1 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      n: 1, // DALL-E 3는 n=1만 지원
      quality: 'standard',
    });

    const imageData = response.data?.[0];
    const imageUrl = imageData?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      revisedPrompt: imageData?.revised_prompt,
    });
  } catch (error: any) {
    console.error('이미지 생성 오류:', error);
    return NextResponse.json(
      { 
        error: error.message || '이미지 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

