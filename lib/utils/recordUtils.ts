import { Record } from '@/lib/types';

/**
 * 기록의 이미지 URL을 가져옴 (fallback 포함)
 */
export function getRecordImage(record: Record, index: number): { imageUrl: string; hasValidImage: boolean } {
  const cardIndex = (index % 5) + 1;
  const defaultImage = `/card${cardIndex}.png`;
  const hasValidImage = !!(record.images && record.images.length > 0 && record.images[0]);
  const imageUrl = hasValidImage && record.images ? record.images[0] : defaultImage;
  
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

