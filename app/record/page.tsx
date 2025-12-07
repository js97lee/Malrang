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
    // 기본 시나리오 설정
    const defaultQuestion = '오늘 어떤일이 있었나요?';
    setCurrentQuestion(defaultQuestion);
    
    // 초기 질문 메시지 설정
    setMessages([
      {
        id: '1',
        type: 'question',
        content: defaultQuestion,
        timestamp: new Date().toISOString(),
      },
    ]);
    
    // 자동으로 시나리오 진행
    // 각 메시지의 delay는 이전 메시지의 타이핑 시간 + 2초를 고려하여 계산
    // 타이핑 속도: 120ms per character
    const scenario = [
      {
        delay: 1500, // 첫 사용자 메시지까지 1.5초
        message: {
          id: '2',
          type: 'answer' as const,
          content: '오늘 지윤이 돌 기념으로 스튜디오에서 촬영이 있는 날이였어. 한복과 드레스를 입고 사진을 찍었어.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        // 메시지 2 타이핑 시간: 약 50자 * 120ms = 6000ms + 2초 = 8000ms
        delay: 8000,
        message: {
          id: '3',
          type: 'question' as const,
          content: '아이가 사진촬영하는게 쉽지 않았을 텐데 너무 사랑스러워요😍 어떤 기분이었나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000, // AI 응답 후 2초
        message: {
          id: '4',
          type: 'answer' as const,
          content: '응! 촬영에 울지않고 잘 참여해줘서 너무 고맙고 결과물도 상당히 마음에 들었어. 스튜디오에서 성장앨범 남기길 잘 했다는 생각이 들었어.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        // 메시지 4 타이핑 시간: 약 70자 * 120ms = 8400ms + 2초 = 10400ms
        delay: 10400,
        message: {
          id: '4-1',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card1.png'],
        },
      },
      {
        delay: 500, // 이미지 후 0.5초
        message: {
          id: '4-2',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card1-2.jpeg'],
        },
      },
      {
        delay: 2000, // 이미지 후 2초
        message: {
          id: '5',
          type: 'question' as const,
          content: '훌륭하네요! 좋은 추억이 될꺼같아요! 뿌듯하시겠어요! 자동태그로 베스트샷 등록해드릴까요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000, // AI 응답 후 2초
        message: {
          id: '6',
          type: 'answer' as const,
          content: '좋아, 앞으로도 지윤이 성장기록을 아카이빙해서 관리해줘.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        // 메시지 6 타이핑 시간: 약 30자 * 120ms = 3600ms + 2초 = 5600ms
        delay: 5600,
        message: {
          id: '7',
          type: 'question' as const,
          content: '네, 알겠습니다.\n\n#지윤이 #돌기념촬영 #한복 #드레스 #사랑스러움 #뿌듯함 으로 기록할게요.\n\n앞으로도 좋은 추억 많이 쌓으시길 바래요😉',
          timestamp: new Date().toISOString(),
        },
      },
    ];
    
    const timeouts: NodeJS.Timeout[] = [];
    let currentDelay = 0;
    
    scenario.forEach((step) => {
      currentDelay += step.delay;
      const timeout = setTimeout(() => {
        setMessages((prev) => {
          // 중복 방지: 같은 ID의 메시지가 이미 있는지 확인
          const exists = prev.some(msg => msg.id === step.message.id);
          if (exists) return prev;
          return [...prev, step.message];
        });
        if (step.message.type === 'answer' || step.message.type === 'image') {
          setConversationCount((prev) => prev + 1);
        }
      }, currentDelay);
      timeouts.push(timeout);
    });
    
    // cleanup 함수: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
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
      
      // API에서 반환된 메시지 사용 (이미 사용자 친화적으로 처리됨)
      let errorMessage = error.message || '네, 듣고 있어요. 계속 말씀해주세요.';
      
      // 기술적인 에러 메시지는 숨기고 자연스러운 응답으로 변경
      if (error.message?.includes('API 키') || error.message?.includes('OPENAI_API_KEY')) {
        errorMessage = '네, 계속 들려주세요. 오늘 하루는 어떠셨나요?';
      } else if (error.message?.includes('응답이 비어있습니다')) {
        errorMessage = '네, 듣고 있어요. 더 자세히 이야기해주세요.';
      } else if (error.message?.includes('사용 한도') || error.message?.includes('quota') || error.message?.includes('billing')) {
        // API 한도 초과는 이미 chatClient에서 자연스러운 응답으로 처리됨
        errorMessage = error.message;
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

