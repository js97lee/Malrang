import { ChatMessage, Emotion } from '../types';

/**
 * 대화 내용에서 감정 추출
 */
export function analyzeEmotionsFromConversation(messages: ChatMessage[]): Emotion[] {
  const emotions: Emotion[] = [];
  const allText = messages
    .filter(msg => msg.type === 'answer')
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  // 감정 키워드 매핑
  const emotionKeywords: { [key in Emotion]: string[] } = {
    joy: ['기쁨', '행복', '좋아', '즐거', '웃', '신나', '즐겁', '기쁘', '행복하', '좋았'],
    sadness: ['슬픔', '우울', '슬프', '아쉽', '후회', '그리워', '외로', '힘들', '피곤'],
    anger: ['화', '짜증', '분노', '화나', '싫', '미워', '열받'],
    fear: ['무서', '두려', '걱정', '불안', '조심', '위험'],
    surprise: ['놀라', '신기', '예상', '깜짝', '놀람', '뜻밖'],
    love: ['사랑', '좋아해', '애정', '고마', '감사', '소중', '따뜻'],
    peace: ['평온', '편안', '안정', '차분', '여유', '조용', '고요'],
    excitement: ['흥분', '설레', '기대', '재미', '즐거', '신나'],
  };

  // 각 감정별 키워드 확인
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const hasEmotion = keywords.some(keyword => allText.includes(keyword));
    if (hasEmotion) {
      emotions.push(emotion as Emotion);
    }
  });

  // 감정이 없으면 기본값
  if (emotions.length === 0) {
    emotions.push('peace');
  }

  return emotions;
}

/**
 * 대화 내용에서 키워드 추출 (기본 키워드 기반)
 */
export function extractKeywordsFromConversation(messages: ChatMessage[]): string[] {
  const keywords: string[] = [];
  const allText = messages
    .filter(msg => msg.type === 'answer')
    .map(msg => msg.content)
    .join(' ');

  // 일반적인 키워드 패턴
  const commonKeywords = [
    '친구', '가족', '일', '학교', '직장', '취미', '운동', '음식', '여행',
    '책', '영화', '음악', '게임', '공부', '휴식', '산책', '카페', '식사',
    '만남', '대화', '추억', '기억', '순간', '시간', '하루', '오늘',
  ];

  commonKeywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  return keywords.slice(0, 5); // 최대 5개
}

/**
 * OpenAI API를 사용하여 대화 내용에서 카테고리 추출
 */
export async function extractCategoryFromConversation(messages: ChatMessage[]): Promise<string | null> {
  try {
    const response = await fetch('/api/ai-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('카테고리 추출 실패');
    }

    const data = await response.json();
    return data.category || null;
  } catch (error) {
    console.error('카테고리 추출 오류:', error);
    // 실패 시 기본 키워드 추출로 대체
    const keywords = extractKeywordsFromConversation(messages);
    return keywords.length > 0 ? keywords[0] : null;
  }
}

/**
 * 대화 내용 요약 생성
 */
export function generateSummaryFromConversation(messages: ChatMessage[]): string {
  const userAnswers = messages
    .filter(msg => msg.type === 'answer')
    .map(msg => msg.content)
    .join(' ');

  if (userAnswers.length === 0) {
    return '대화 내용이 없습니다.';
  }

  // 간단한 요약 (첫 100자)
  if (userAnswers.length <= 100) {
    return userAnswers;
  }

  // 첫 문장과 마지막 문장 결합
  const sentences = userAnswers.split(/[.!?。]/).filter(s => s.trim().length > 0);
  if (sentences.length >= 2) {
    return `${sentences[0].trim()}... ${sentences[sentences.length - 1].trim()}`;
  }

  return userAnswers.substring(0, 100) + '...';
}

