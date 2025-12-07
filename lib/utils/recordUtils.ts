import { Record } from '@/lib/types';

/**
 * 기록의 이미지 URL을 가져옴 (fallback 포함)
 */
export function getRecordImage(record: Record, index: number): { imageUrl: string; hasValidImage: boolean } {
  // card1-18까지 순환하도록 변경 (각 카드가 1번씩만 나오도록)
  // 레코드 ID를 기반으로 고유한 카드 인덱스 생성 (중복 방지)
  const recordId = parseInt(record.id) || 0;
  const cardIndex = ((recordId - 1) % 18) + 1;
  
  // card18은 .jpeg 확장자
  const defaultImage = cardIndex === 18 
    ? `/card${cardIndex}.jpeg` 
    : cardIndex <= 7 
      ? `/card${cardIndex}.png`
      : `/card${cardIndex}.jpeg`;
  
  // record.images 배열에서 유효한 이미지 URL 찾기 (기본 카드 이미지 제외)
  const validImage = record.images?.find(img => 
    img && 
    img.trim() !== '' && 
    !img.startsWith('/card') && 
    (img.startsWith('http') || img.startsWith('data:image'))
  );
  
  const hasValidImage = !!validImage;
  const imageUrl = hasValidImage ? validImage : defaultImage;
  
  return { imageUrl, hasValidImage };
}

/**
 * 날짜에서 요일 이름과 일자를 추출
 */
export function getDateInfo(dateString: string): { dayName: string; dayNumber: number } {
  const date = new Date(dateString);
  const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
  const dayNumber = date.getDate();
  return { dayName, dayNumber };
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * 날짜 포맷팅 (YYYY.M.D.)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month}.${day}.`;
}

/**
 * 날짜 포맷팅 (YYYY. M. D.)
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}. ${month}. ${day}.`;
}






