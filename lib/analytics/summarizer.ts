import { ChatMessage } from '../types';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

/**
 * 대화 내용을 요약하는 함수
 */
export async function summarizeConversation(messages: ChatMessage[]): Promise<string> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // API 키가 없으면 간단한 요약
    const userMessages = messages
      .filter(msg => msg.type === 'answer')
      .map(msg => msg.content)
      .join(' ');
    return userMessages.length > 100 
      ? userMessages.substring(0, 100) + '...'
      : userMessages;
  }

  try {
    const userMessages = messages
      .filter(msg => msg.type === 'answer')
      .map(msg => msg.content)
      .join('\n');

    if (!userMessages.trim()) {
      return '대화 내용이 없습니다.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 대화 내용을 간결하고 명확하게 요약하는 전문가입니다. 핵심 내용만 2-3문장으로 요약해주세요.',
        },
        {
          role: 'user',
          content: `다음 대화 내용을 요약해주세요:\n\n${userMessages}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || userMessages.substring(0, 100);
  } catch (error) {
    console.error('요약 생성 오류:', error);
    const userMessages = messages
      .filter(msg => msg.type === 'answer')
      .map(msg => msg.content)
      .join(' ');
    return userMessages.length > 100 
      ? userMessages.substring(0, 100) + '...'
      : userMessages;
  }
}






