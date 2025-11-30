import { Record, EmotionData, MonthlyReport } from '../types';

export function aggregateEmotions(records: Record[]): EmotionData[] {
  const emotionCounts: { [key: string]: number } = {};
  
  // 각 기록의 감정을 집계
  records.forEach((record) => {
    record.emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  // 전체 감정 발생 횟수 계산 (기록 수가 아닌 감정 총합)
  const totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionData['emotion'],
      count,
      percentage: totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 기록 내용에서 명사 추출 (간단한 패턴 매칭)
 */
function extractNounsFromText(text: string): string[] {
  // 일반적인 한국어 명사 패턴 (2-4글자)
  const commonNouns = [
    '친구', '가족', '일', '학교', '직장', '취미', '운동', '음식', '여행',
    '책', '영화', '음악', '게임', '공부', '휴식', '산책', '카페', '식사',
    '만남', '대화', '추억', '기억', '순간', '시간', '하루', '오늘', '어제',
    '아침', '점심', '저녁', '밤', '낮', '날씨', '날', '계절', '봄', '여름', '가을', '겨울',
    '사람', '선생님', '동생', '형', '누나', '언니', '오빠', '엄마', '아빠',
    '집', '방', '거실', '부엌', '화장실', '침대', '책상', '의자',
    '컴퓨터', '핸드폰', '텔레비전', '라디오', '에어컨', '히터',
    '차', '버스', '지하철', '기차', '비행기', '배',
    '공원', '도서관', '영화관', '상점', '마트', '병원', '약국',
    '강아지', '고양이', '새', '물고기',
    '밥', '국', '반찬', '과일', '채소', '고기', '생선',
    '물', '커피', '차', '주스', '우유', '맥주', '소주',
    '옷', '신발', '가방', '모자', '안경',
    '기분', '감정', '마음', '생각', '느낌',
    '일기', '기록', '메모', '편지', '카드',
    '선물', '꽃', '케이크', '초콜릿',
    '공부', '시험', '과제', '프로젝트', '발표',
    '회의', '업무', '일', '일정', '계획',
    '취미', '독서', '운동', '요리', '그림', '사진',
    '여행', '휴가', '출장', '여행지', '명소',
    '생일', '기념일', '결혼식', '장례식',
    '축제', '행사', '파티', '모임',
  ];

  const foundNouns: string[] = [];
  const textLower = text.toLowerCase();

  // 명사 리스트에서 매칭되는 단어 찾기
  commonNouns.forEach(noun => {
    if (textLower.includes(noun.toLowerCase())) {
      foundNouns.push(noun);
    }
  });

  // 추가로 2-4글자 한글 단어 패턴 추출 (간단한 휴리스틱)
  const koreanWordPattern = /[가-힣]{2,4}/g;
  const matches = text.match(koreanWordPattern);
  if (matches) {
    matches.forEach(match => {
      // 일반적인 조사나 어미 제외
      const excludePatterns = ['에서', '에게', '을', '를', '이', '가', '의', '와', '과', '도', '만', '까지', '부터', '처럼', '같이', '보다', '한테', '께', '더', '가장', '매우', '정말', '너무', '아주', '참', '진짜', '그냥', '그래', '그런', '이런', '저런', '어떤', '무슨', '어느', '어떻게', '왜', '언제', '어디', '누구', '무엇', '그것', '이것', '저것'];
      if (!excludePatterns.some(pattern => match.includes(pattern)) && match.length >= 2) {
        foundNouns.push(match);
      }
    });
  }

  return foundNouns;
}

export function extractKeywords(records: Record[]): string[] {
  const keywordCounts: { [key: string]: number } = {};

  // 모든 기록의 answer와 summary에서 명사 추출
  records.forEach((record) => {
    const allText = `${record.answer || ''} ${record.summary || ''}`.trim();
    if (allText) {
      const nouns = extractNounsFromText(allText);
      nouns.forEach((noun) => {
        keywordCounts[noun] = (keywordCounts[noun] || 0) + 1;
      });
    }
  });

  // 빈도순으로 정렬하고 상위 7개 반환
  return Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([keyword]) => keyword);
}

export function generateMonthlyReport(records: Record[], month: string): MonthlyReport {
  const monthRecords = records.filter((record) => {
    const recordMonth = record.date.substring(0, 7); // YYYY-MM
    return recordMonth === month;
  });

  const emotions = aggregateEmotions(monthRecords);
  const keywords = extractKeywords(monthRecords);
  
  // 가장 감정이 강한 순간 찾기 (가장 많은 감정 태그를 가진 기록)
  const highlightMoment = monthRecords.length > 0
    ? monthRecords.reduce((prev, current) =>
        current.emotions.length > prev.emotions.length ? current : prev
      )
    : undefined;

  return {
    month,
    emotions,
    keywords,
    highlightMoment,
    totalRecords: monthRecords.length,
  };
}

