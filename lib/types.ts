// 공통 타입 정의

export type Emotion = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love' | 'peace' | 'excitement';

export interface Record {
  id: string;
  date: string; // ISO date string
  question: string;
  answer: string;
  images?: string[]; // 이미지 URL 배열
  tags: string[];
  emotions: Emotion[];
  summary?: string; // AI가 생성한 요약
  createdAt: string;
}

export interface EmotionData {
  emotion: Emotion;
  count: number;
  percentage: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  emotions: EmotionData[];
  keywords: string[];
  highlightMoment?: Record;
  totalRecords: number;
}

export interface RefeelTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'autobiography' | 'family' | 'growth' | 'archive';
  defaultTags?: string[];
}

export interface RefeelRequest {
  templateId: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  records?: string[]; // Record IDs
}

export interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'image';
  content: string;
  timestamp: string;
  images?: string[];
}

