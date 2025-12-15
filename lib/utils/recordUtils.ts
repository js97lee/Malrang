import { Record } from '@/lib/types';

/**
 * 기록의 이미지 URL을 가져옴 (fallback 포함)
 * @param record - 레코드 객체
 * @param index - 인덱스 (아카이브 갤러리에서 순차적으로 표시할 때 사용)
 * @param useIndex - true면 index 기반으로 순차 할당, false면 record.id 기반으로 할당
 */
export function getRecordImage(record: Record, index: number, useIndex: boolean = false): { imageUrl: string; hasValidImage: boolean } {
  // card1-44까지 순환
  const maxCardIndex = 44;
  let cardIndex: number;
  
  if (useIndex) {
    // 인덱스 기반으로 순차 할당 (아카이브 갤러리용)
    cardIndex = (index % maxCardIndex) + 1;
  } else {
    // 레코드 ID 기반으로 고유한 카드 인덱스 생성 (기본값)
    const recordId = parseInt(record.id) || 0;
    cardIndex = ((recordId - 1) % maxCardIndex) + 1;
  }
  
  // 확장자 규칙: 
  // card1-7, card18-21: .png
  // card8-17, card22-44: .jpeg
  const defaultImage = (cardIndex <= 7 || (cardIndex >= 18 && cardIndex <= 21))
    ? `/card${cardIndex}.png`
    : `/card${cardIndex}.jpeg`;
  
  // record.images 배열에서 유효한 이미지 URL 찾기
  // 1순위: record.images에 명시적으로 지정된 이미지 (card 포함)
  // 2순위: 외부 URL 또는 base64 이미지
  // 3순위: defaultImage (fallback)
  const validImage = record.images?.find(img => 
    img && 
    typeof img === 'string' &&
    img.trim() !== '' && 
    (img.startsWith('http') || img.startsWith('data:image') || img.startsWith('/card'))
  );
  
  const hasValidImage = !!validImage;
  // 항상 유효한 이미지 URL 반환 (fallback 포함)
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






