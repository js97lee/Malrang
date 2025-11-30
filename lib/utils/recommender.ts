import { Record } from '../types';

/**
 * 기록 추천 로직
 * 최근 기록, 감정 패턴, 태그 등을 기반으로 추천
 */
export function recommendRecords(
  allRecords: Record[],
  currentRecord?: Record
): Record[] {
  if (allRecords.length === 0) return [];

  // 1. 최근 기록 우선
  const recentRecords = [...allRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 2. 유사한 감정 패턴 찾기
  if (currentRecord && currentRecord.emotions.length > 0) {
    const similarEmotionRecords = allRecords
      .filter(record => {
        if (record.id === currentRecord.id) return false;
        return record.emotions.some(emotion => 
          currentRecord.emotions.includes(emotion)
        );
      })
      .sort((a, b) => {
        const aSimilarity = a.emotions.filter(e => 
          currentRecord.emotions.includes(e)
        ).length;
        const bSimilarity = b.emotions.filter(e => 
          currentRecord.emotions.includes(e)
        ).length;
        return bSimilarity - aSimilarity;
      })
      .slice(0, 3);

    // 최근 기록과 유사 감정 기록 합치기
    const combined = [...recentRecords, ...similarEmotionRecords];
    const unique = Array.from(
      new Map(combined.map(r => [r.id, r])).values()
    );
    return unique.slice(0, 5);
  }

  // 3. 유사한 태그 찾기
  if (currentRecord && currentRecord.tags.length > 0) {
    const similarTagRecords = allRecords
      .filter(record => {
        if (record.id === currentRecord.id) return false;
        return record.tags.some(tag => currentRecord.tags.includes(tag));
      })
      .slice(0, 3);

    const combined = [...recentRecords, ...similarTagRecords];
    const unique = Array.from(
      new Map(combined.map(r => [r.id, r])).values()
    );
    return unique.slice(0, 5);
  }

  return recentRecords;
}

/**
 * 특정 날짜의 기록 추천
 */
export function recommendByDate(
  allRecords: Record[],
  targetDate: string
): Record[] {
  const target = new Date(targetDate);
  const dayOfWeek = target.getDay();
  
  // 같은 요일의 기록 찾기
  const sameDayRecords = allRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getDay() === dayOfWeek;
  });

  return sameDayRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

