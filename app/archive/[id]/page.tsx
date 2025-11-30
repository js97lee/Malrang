'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import ChatThread from '@/components/today/ChatThread';
import { getAllConversations, conversationToRecord } from '@/lib/utils/conversationStorage';
import { ChatMessage } from '@/lib/types';
import mockRecords from '@/data/mockRecords.json';

export default function ArchiveDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params?.id as string;
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    if (!recordId) return;

    // 저장된 대화 데이터 가져오기
    const conversations = getAllConversations();
    const foundConversation = conversations.find(conv => conv.id === recordId);
    
    if (foundConversation) {
      setConversation(foundConversation);
      // 대화 메시지 변환
      const chatMessages: ChatMessage[] = [];
      
      // 질문 추가
      if (foundConversation.question) {
        chatMessages.push({
          id: 'question-1',
          type: 'question',
          content: foundConversation.question,
          timestamp: foundConversation.createdAt || new Date().toISOString(),
        });
      }
      
      // 메시지들 추가
      if (foundConversation.messages && Array.isArray(foundConversation.messages)) {
        foundConversation.messages.forEach((msg: any, index: number) => {
          chatMessages.push({
            id: msg.id || `msg-${index}`,
            type: msg.type || 'answer',
            content: msg.content || '',
            timestamp: msg.timestamp || foundConversation.createdAt || new Date().toISOString(),
            images: msg.images || [],
          });
        });
      }
      
      setMessages(chatMessages);
      setRecord(conversationToRecord(foundConversation));
    } else {
      // Mock 데이터에서 찾기
      const mockRecord = (mockRecords as any[]).find(r => r.id === recordId);
      if (mockRecord) {
        setRecord(mockRecord);
        // 각 기록마다 고유한 대화 시나리오 생성
        const chatMessages: ChatMessage[] = [];
        const baseTimestamp = mockRecord.createdAt || new Date().toISOString();
        
        // 기록 ID별 고유한 대화 시나리오
        const conversationScenarios: { [key: string]: { questions: string[]; answers: string[] } } = {
          '1': {
            questions: [
              '오늘 가장 기억에 남는 장면은 무엇인가요?',
              '친구들과 만난 게 오랜만이었나요?',
              '무엇에 대해 이야기했나요?',
              '그런 시간이 왜 소중했나요?',
              '다음에도 그런 시간을 갖고 싶나요?',
            ],
            answers: [
              '친구들과 함께한 저녁 식사가 정말 따뜻했어.',
              '정말 오랜만이었어. 바쁘다 보니 자주 못 만났거든.',
              '요즘 일상 이야기와 옛날 추억들을 나누며 많이 웃었어.',
              '서로의 이야기를 진심으로 들어주고 공감해주는 게 좋았어.',
              '앞으로도 자주 만나고 싶어.',
            ],
          },
          '2': {
            questions: [
              '오늘 느꼈던 감정을 한 단어로 표현한다면?',
              '평온함을 느낀 순간이 언제였나요?',
              '그런 평온함이 왜 좋았나요?',
              '일상의 작은 행복을 느끼는 게 중요한가요?',
              '앞으로도 이런 평온한 하루를 보내고 싶나요?',
            ],
            answers: [
              '평온함. 아무 일도 없었지만 그 자체가 행복이었어.',
              '아침에 일어나서 창밖을 보며 커피를 마실 때였어.',
              '바쁘지 않고 조용한 시간이 주는 여유가 좋았어.',
              '작은 것들에서 행복을 찾고 싶어.',
              '가끔은 이런 평온한 하루를 보내고 싶어.',
            ],
          },
          '3': {
            questions: [
              '오늘의 하이라이트를 사진과 함께 기록해보세요',
              '어떤 책을 읽으셨나요?',
              '왜 그 책을 선택하셨나요?',
              '결말이 감동적이었다고 하셨는데, 어떤 점이 감동적이었나요?',
              '책을 다 읽은 후 어떤 기분이었나요?',
            ],
            answers: [
              '카페에서 읽던 책을 마지막 페이지까지 읽었어.',
              '요즘 읽고 있던 소설이었어.',
              '친구가 추천해줘서 읽기 시작했어.',
              '주인공의 성장 과정과 마지막 선택이 정말 인상적이었어.',
              '뭔가 성취감도 느끼고, 아쉬움도 느꼈어.',
            ],
          },
          '4': {
            questions: [
              '오늘 하루는 어떠셨나요?',
              '어떤 운동을 하셨나요?',
              '운동하면서 어떤 생각이 들었나요?',
              '몸이 가벼워진 기분이 들었다고 하셨는데, 그게 어떤 느낌이었나요?',
              '앞으로도 운동을 계속 하실 건가요?',
            ],
            answers: [
              '운동을 하면서 땀을 많이 흘렸어.',
              '조깅과 스트레칭을 했어.',
              '스트레스도 풀리고 기분이 좋아졌어.',
              '몸이 한결 가볍고 상쾌한 느낌이었어.',
              '앞으로도 꾸준히 운동하고 싶어.',
            ],
          },
          '5': {
            questions: [
              '오늘 가장 기억에 남는 순간은?',
              '가족과 어떤 이야기를 나누셨나요?',
              '그런 시간이 왜 특별했나요?',
              '가족과의 대화가 중요한가요?',
              '앞으로도 자주 그런 시간을 갖고 싶나요?',
            ],
            answers: [
              '가족과 함께 저녁을 먹으면서 오늘 하루를 이야기했어.',
              '각자의 하루 일과와 생각들을 나눴어.',
              '서로의 하루를 공유하며 소통하는 게 좋았어.',
              '가족과의 대화는 정말 중요하다고 생각해.',
              '앞으로도 자주 그런 시간을 갖고 싶어.',
            ],
          },
        };
        
        const scenario = conversationScenarios[mockRecord.id] || {
          questions: [mockRecord.question || '오늘 하루는 어떠셨나요?'],
          answers: [mockRecord.answer || ''],
        };
        
        // 시나리오에 따라 5-6번의 핑퐁 생성
        const maxPingPong = Math.min(6, Math.max(5, Math.min(scenario.questions.length, scenario.answers.length)));
        
        for (let i = 0; i < maxPingPong; i++) {
          // 질문 추가
          if (i < scenario.questions.length) {
            chatMessages.push({
              id: `question-${i + 1}`,
              type: 'question',
              content: scenario.questions[i],
              timestamp: new Date(new Date(baseTimestamp).getTime() + i * 90000).toISOString(),
            });
          }
          
          // 답변 추가
          if (i < scenario.answers.length) {
            chatMessages.push({
              id: `answer-${i + 1}`,
              type: 'answer',
              content: scenario.answers[i],
              timestamp: new Date(new Date(baseTimestamp).getTime() + i * 90000 + 45000).toISOString(),
            });
          }
        }
        
        setMessages(chatMessages);
      }
    }
  }, [recordId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <div className="pt-6 px-4">
          <div className="mb-2 pb-2 border-b border-gray-200 pl-[10px] flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {record ? formatDate(record.date) : '기록 상세'}
            </h1>
          </div>
          <div className="pb-[10px]"></div>
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-6 relative">
          <div className="relative pb-20">
            {messages.length > 0 ? (
              <ChatThread messages={messages} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>대화 기록을 찾을 수 없습니다.</p>
              </div>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

