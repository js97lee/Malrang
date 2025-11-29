import { Record, EmotionData, MonthlyReport } from '../types';

export function aggregateEmotions(records: Record[]): EmotionData[] {
  const emotionCounts: { [key: string]: number } = {};
  const total = records.length;

  records.forEach((record) => {
    record.emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  return Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionData['emotion'],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function extractKeywords(records: Record[]): string[] {
  const keywordCounts: { [key: string]: number } = {};

  records.forEach((record) => {
    record.tags.forEach((tag) => {
      keywordCounts[tag] = (keywordCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
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

