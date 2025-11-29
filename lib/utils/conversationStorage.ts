import { ChatMessage } from '../types';

const CONVERSATION_STORAGE_KEY = 'malang_conversations';
const TODAY_CONVERSATION_KEY = 'malang_today_conversation';

export interface ConversationData {
  id: string;
  date: string;
  question: string;
  messages: ChatMessage[];
  emotions?: string[];
  tags?: string[];
  summary?: string;
  generatedImage?: string; // 생성된 이미지 URL 저장
}

/**
 * 오늘의 대화를 저장
 */
export function saveTodayConversation(messages: ChatMessage[], question: string) {
  const conversation: ConversationData = {
    id: `conv_${Date.now()}`,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    question,
    messages,
  };

  localStorage.setItem(TODAY_CONVERSATION_KEY, JSON.stringify(conversation));
  
  // 전체 대화 목록에도 추가
  const allConversations = getAllConversations();
  allConversations.push(conversation);
  localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(allConversations));
  
  return conversation;
}

/**
 * 오늘의 대화를 가져오기
 */
export function getTodayConversation(): ConversationData | null {
  const data = localStorage.getItem(TODAY_CONVERSATION_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * 모든 대화 목록 가져오기
 */
export function getAllConversations(): ConversationData[] {
  const data = localStorage.getItem(CONVERSATION_STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 대화 데이터를 Record 형식으로 변환
 */
export function conversationToRecord(conversation: ConversationData) {
  const userAnswers = conversation.messages
    .filter(msg => msg.type === 'answer')
    .map(msg => msg.content)
    .join(' ');

  // 사용자가 첨부한 이미지와 생성된 이미지를 합침
  const userImages = conversation.messages
    .filter(msg => msg.type === 'image' && msg.images)
    .flatMap(msg => msg.images || []);
  
  const allImages = conversation.generatedImage 
    ? [...userImages, conversation.generatedImage]
    : userImages;

  return {
    id: conversation.id,
    date: conversation.date,
    question: conversation.question,
    answer: userAnswers,
    images: allImages.length > 0 ? allImages : undefined,
    tags: conversation.tags || [],
    emotions: (conversation.emotions || []) as any,
    summary: conversation.summary || userAnswers.substring(0, 100),
    createdAt: conversation.date,
  };
}

/**
 * 대화에 생성된 이미지 저장
 */
export function saveGeneratedImage(conversationId: string, imageUrl: string) {
  const conversations = getAllConversations();
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (conversation) {
    conversation.generatedImage = imageUrl;
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
    
    // 오늘의 대화도 업데이트
    const todayConversation = getTodayConversation();
    if (todayConversation && todayConversation.id === conversationId) {
      todayConversation.generatedImage = imageUrl;
      localStorage.setItem(TODAY_CONVERSATION_KEY, JSON.stringify(todayConversation));
    }
  }
}

