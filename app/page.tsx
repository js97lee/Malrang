'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import DailyQuestion from '@/components/today/DailyQuestion';
import ChatThread from '@/components/today/ChatThread';
import InputBar from '@/components/ui/InputBar';
import Button from '@/components/ui/Button';
import { getAllConversations, conversationToRecord, saveTodayConversation } from '@/lib/utils/conversationStorage';
import { generateMonthlyReport } from '@/lib/analytics/emotionAggregator';
import { analyzeEmotionsFromConversation, extractKeywordsFromConversation, generateSummaryFromConversation } from '@/lib/analytics/conversationAnalyzer';
import { ChatMessage, Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';
import questionsData from '@/data/questions.json';

export default function Home() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  
  useEffect(() => {
    // 저장된 대화 데이터 가져오기
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    setRecords(conversationRecords);
    
    // 랜덤 질문 선택
    const randomQuestion = questionsData[Math.floor(Math.random() * questionsData.length)];
    setCurrentQuestion(randomQuestion);
  }, []);

  const currentMonth = new Date().toISOString().substring(0, 7);
  const report = useMemo(
    () => generateMonthlyReport(records, currentMonth),
    [records, currentMonth]
  );

  const handleStartChat = () => {
    setIsChatMode(true);
    setMessages([
      {
        id: '1',
        type: 'question',
        content: currentQuestion,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

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
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'question',
        content: data.message || (newCount < 5 
          ? '더 자세히 이야기해주세요. 어떤 감정을 느꼈나요?'
          : '대화가 충분히 진행되었습니다. 감정 리포트를 확인해보시겠어요?'),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      if (newCount >= 5) {
        setShowReportPrompt(true);
      }
    } catch (error) {
      console.error('AI 응답 오류:', error);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'question',
        content: newCount < 5 
          ? '더 자세히 이야기해주세요. 어떤 감정을 느꼈나요?'
          : '대화가 충분히 진행되었습니다. 감정 리포트를 확인해보시겠어요?',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      if (newCount >= 5) {
        setShowReportPrompt(true);
      }
    }
  };

  const handleImageSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const imageMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'image',
      content: '사진을 첨부했습니다.',
      timestamp: new Date().toISOString(),
      images: [imageUrl],
    };
    setMessages([...messages, imageMessage]);
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 relative">
          {!isChatMode ? (
            <div className="relative">
              {/* 배경 캐릭터 (랜덤) */}
              {(() => {
                const characterColors = ['black', 'yellow', 'orange', 'green', 'blue'];
                const randomIndex = Math.floor(Math.random() * characterColors.length);
                const randomColor = characterColors[randomIndex];
                return (
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none z-0">
                    <img
                      src={`/character-${randomColor}.png`}
                      alt={`Character ${randomColor}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // 이미지가 없으면 placeholder 표시
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.character-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'character-placeholder w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300';
                          placeholder.innerHTML = `<span class="text-xs text-gray-400 font-medium">Character ${randomColor}</span>`;
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  </div>
                );
              })()}

              {/* 메인 콘텐츠 영역 */}
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-tight pt-[60px]">
                  지수님,<br />
                  오늘 하루는 어떠셨나요?
                </h2>

                {records.length === 0 && (
                  <div className="bg-gray-50 rounded-material-md p-5 text-center mb-6">
                    <p className="text-gray-600">아직 기록이 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">오늘의 첫 기록을 남겨보세요!</p>
                  </div>
                )}

                <DailyQuestion question={currentQuestion} />
                <button
                  onClick={handleStartChat}
                  className="w-full bg-primary-500 text-white py-4 rounded-full font-medium text-base hover:bg-primary-600 active:bg-primary-700 transition-all uppercase tracking-wide mt-6"
                >
                  답변 시작하기
                </button>

                {/* 감정 데이터 요약 - 아래로 이동 */}
                {records.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-gray-50 rounded-material-md p-5">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">나의 감정 요약</h3>
                      
                      {report.emotions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">이번 달 주요 감정</p>
                          <div className="flex flex-wrap gap-2">
                            {report.emotions.slice(0, 5).map((emotion) => (
                              <Tag key={emotion.emotion}>
                                {emotion.emotion} {emotion.percentage}%
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.keywords.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">자주 언급한 키워드</p>
                          <div className="flex flex-wrap gap-2">
                            {report.keywords.slice(0, 5).map((keyword) => (
                              <Tag key={keyword}>{keyword}</Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        총 <span className="font-semibold text-gray-900">{report.totalRecords}개</span>의 기록
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h1 className="text-xl font-medium text-gray-900 mb-2">오늘의 기록</h1>
              </div>
              
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
                        const summary = generateSummaryFromConversation(messages);
                        
                        // OpenAI API를 사용하여 카테고리 추출
                        const { extractCategoryFromConversation } = await import('@/lib/analytics/conversationAnalyzer');
                        const category = await extractCategoryFromConversation(messages);
                        
                        // 카테고리가 있으면 tags 배열의 첫 번째로 추가
                        const finalTags = category ? [category, ...tags.filter(t => t !== category)] : tags;
                        
                        const conversation = saveTodayConversation(messages, currentQuestion);
                        conversation.emotions = emotions;
                        conversation.tags = finalTags;
                        conversation.summary = summary;
                        
                        localStorage.setItem('malang_today_conversation', JSON.stringify(conversation));
                        
                        // 리포트 페이지로 이동 (새로고침 없이)
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
            </>
          )}
        </main>

        {isChatMode && (
          <div className="px-6 pb-4">
            <InputBar
              onSend={handleSendMessage}
              onImageSelect={handleImageSelect}
              placeholder="답변을 입력하세요..."
            />
          </div>
        )}

        <BottomNavigation />
      </div>
    </MobileFrame>
  );
}

