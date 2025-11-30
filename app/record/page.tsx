'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PageHeader from '@/components/layout/PageHeader';
import ChatThread from '@/components/today/ChatThread';
import InputBar from '@/components/ui/InputBar';
import { conversationToRecord, saveTodayConversation, getAllConversations } from '@/lib/utils/conversationStorage';
import { analyzeEmotionsFromConversation, extractKeywordsFromConversation, generateSummaryFromConversation } from '@/lib/analytics/conversationAnalyzer';
import { ChatMessage } from '@/lib/types';
import questionsData from '@/data/questions.json';
import { checkTutorialProgress } from '@/lib/utils/tutorial';

export default function RecordPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  const [lastImageAnalysis, setLastImageAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // 랜덤 질문 선택
    const randomQuestion = questionsData[Math.floor(Math.random() * questionsData.length)];
    setCurrentQuestion(randomQuestion);
    
    // 초기 질문 메시지 설정
    setMessages([
      {
        id: '1',
        type: 'question',
        content: randomQuestion,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'answer',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    const newCount = conversationCount + 1;
    setConversationCount(newCount);

    try {
      // 대화 맥락을 유지하기 위해 전체 메시지 히스토리 전달
      const hasImageInHistory = messages.some(msg => msg.type === 'image');
      const imageAnalysisToSend = hasImageInHistory && lastImageAnalysis ? lastImageAnalysis : undefined;
      
      console.log('텍스트 메시지 전송:', { 
        messageCount: updatedMessages.length, 
        text: text.substring(0, 50),
        hasImage: hasImageInHistory,
        hasImageAnalysis: !!imageAnalysisToSend
      });
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          imageAnalysis: imageAnalysisToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI 채팅 API 오류:', response.status, errorData);
        throw new Error(`API 호출 실패: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('AI 응답 받음:', data);
      
      if (!data.message || data.message.trim() === '') {
        console.error('⚠️ API 응답에 메시지가 없습니다:', data);
        throw new Error('AI 응답이 비어있습니다.');
      }
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'question',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      if (newCount >= 5) {
        setShowReportPrompt(true);
      }
    } catch (error: any) {
      console.error('❌ AI 응답 오류:', error);
      
      let errorMessage = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
      
      if (error.message?.includes('API 키') || error.message?.includes('OPENAI_API_KEY')) {
        errorMessage = 'API 설정을 확인해주세요. .env.local 파일에 OPENAI_API_KEY를 추가해주세요.';
      } else if (error.message?.includes('응답이 비어있습니다')) {
        errorMessage = 'AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'question',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      if (newCount >= 5) {
        setShowReportPrompt(true);
      }
    }
  };

  const handleImageSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      const imageUrl = URL.createObjectURL(file);
      
      const imageMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'image',
        content: '사진을 첨부했습니다.',
        timestamp: new Date().toISOString(),
        images: [imageUrl],
      };
      
      const updatedMessages = [...messages, imageMessage];
      setMessages(updatedMessages);
      
      try {
        console.log('이미지 분석 시작...', { imageSize: base64Image.length, messageCount: messages.length });
        
        const analyzeResponse = await fetch('/api/ai-image-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: base64Image,
            conversationHistory: messages,
          }),
        });

        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json().catch(() => ({}));
          console.error('이미지 분석 API 오류:', analyzeResponse.status, errorData);
          throw new Error(`이미지 분석 실패: ${errorData.error || analyzeResponse.statusText}`);
        }

        const analyzeData = await analyzeResponse.json();
        console.log('이미지 분석 결과:', analyzeData);
        const imageAnalysis = analyzeData.analysis || '사진을 확인했습니다.';
        
        setLastImageAnalysis(imageAnalysis);

        console.log('AI 채팅 요청 시작...', { messageCount: updatedMessages.length, imageAnalysis: imageAnalysis.substring(0, 50) });
        
        const chatResponse = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
            imageAnalysis,
          }),
        });

        if (!chatResponse.ok) {
          const errorData = await chatResponse.json().catch(() => ({}));
          console.error('AI 채팅 API 오류:', chatResponse.status, errorData);
          throw new Error(`AI 응답 실패: ${errorData.error || chatResponse.statusText}`);
        }

        const chatData = await chatResponse.json();
        console.log('AI 응답 받음:', chatData);
        
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'question',
          content: chatData.message || '사진을 확인했습니다. 이 사진에 대해 더 이야기해주세요.',
          timestamp: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error: any) {
        console.error('이미지 분석 또는 AI 응답 오류:', error);
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'question',
          content: error.message?.includes('API 키') 
            ? 'API 설정을 확인해주세요. 사진을 확인했습니다.'
            : '사진을 확인했습니다. 이 사진에 대해 더 이야기해주세요.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <PageHeader title="오늘의 기록" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-6 relative">
          
          <div className="relative pb-20">
            <ChatThread messages={messages} />
            
            {/* 리포트 준비 완료 플로팅 버튼 */}
            {showReportPrompt && (
              <button
                onClick={async () => {
                  const userAnswers = messages.filter(msg => msg.type === 'answer');
                  if (userAnswers.length > 0) {
                    const emotions = analyzeEmotionsFromConversation(messages);
                    const tags = extractKeywordsFromConversation(messages);
                    let summary = generateSummaryFromConversation(messages);
                    
                    // OpenAI API를 사용하여 카테고리 추출
                    const { extractCategoryFromConversation } = await import('@/lib/analytics/conversationAnalyzer');
                    const category = await extractCategoryFromConversation(messages);
                    
                    // 카테고리가 있으면 tags 배열의 첫 번째로 추가
                    const finalTags = category ? [category, ...tags.filter(t => t !== category)] : tags;
                    
                    // 요약 생성 (API 사용)
                    try {
                      const summaryResponse = await fetch('/api/ai-summarize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages }),
                      });
                      if (summaryResponse.ok) {
                        const summaryData = await summaryResponse.json();
                        if (summaryData.summary) {
                          summary = summaryData.summary;
                        }
                      }
                    } catch (error) {
                      console.error('요약 생성 오류:', error);
                    }
                    
                    const conversation = saveTodayConversation(messages, currentQuestion);
                    conversation.emotions = emotions;
                    conversation.tags = finalTags;
                    conversation.summary = summary;
                    
                    localStorage.setItem('malang_today_conversation', JSON.stringify(conversation));

                    // 튜토리얼 진행 상황 업데이트
                    const updatedRecords = getAllConversations().map(conv => conversationToRecord(conv));
                    const updatedStep = checkTutorialProgress(updatedRecords.length);
                    
                    // 리포트 페이지로 이동
                    router.push('/report');
                  }
                }}
                className="absolute bottom-4 right-4 z-50 w-14 h-14 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 active:bg-primary-700 transition-all animate-bounce shadow-lg"
                title="감정 리포트 보기"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
          </div>
        </main>

        <div className="px-2 pb-4">
          <InputBar
            onSend={handleSendMessage}
            onImageSelect={handleImageSelect}
            placeholder="답변을 입력하세요..."
          />
        </div>

        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

