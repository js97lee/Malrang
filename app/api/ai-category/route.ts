import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatMessage } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 대화 내용을 기반으로 카테고리 추출
 * 한국어 대화에서 적절한 카테고리 1개를 추출
 */
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

    // 사용자 답변만 추출
    const userAnswers = messages
      .filter((msg: ChatMessage) => msg.type === 'answer')
      .map((msg: ChatMessage) => msg.content)
      .join(' ');

    if (!userAnswers || userAnswers.trim().length === 0) {
      return NextResponse.json({ category: null });
    }

    // OpenAI를 사용하여 카테고리 추출
    const prompt = `다음 대화 내용을 분석하여 가장 적절한 카테고리 하나를 추출해주세요. 
한국어로 된 짧은 카테고리명(1-2단어)만 반환해주세요. 예: "친구", "가족", "취미", "음식", "여행", "독서", "운동", "평온", "기념일", "일상" 등.

대화 내용:
${userAnswers}

카테고리:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 대화 내용을 분석하여 적절한 카테고리를 추출하는 전문가입니다. 대화의 맥락과 주제를 파악하여 가장 적합한 카테고리 하나만 한국어로 반환합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const category = completion.choices[0]?.message?.content?.trim() || null;

    // 불필요한 문장 제거 (예: "카테고리는", "카테고리:" 등)
    const cleanCategory = category
      ?.replace(/^카테고리[는:]?\s*/i, '')
      .replace(/^답변[는:]?\s*/i, '')
      .trim()
      .split('\n')[0] // 첫 줄만
      .split('.')[0] // 마침표 제거
      .trim() || null;

    return NextResponse.json({ category: cleanCategory });
  } catch (error) {
    console.error('AI category extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', category: null },
      { status: 500 }
    );
  }
}

