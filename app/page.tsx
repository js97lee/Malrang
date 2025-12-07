'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/components/layout/MobileFrame';
import BottomNavigation from '@/components/layout/BottomNavigation';
import DailyQuestion from '@/components/today/DailyQuestion';
import ChatThread from '@/components/today/ChatThread';
import InputBar from '@/components/ui/InputBar';
import { getAllConversations, conversationToRecord, saveTodayConversation } from '@/lib/utils/conversationStorage';
import { getRecordImage, getDateInfo, isToday } from '@/lib/utils/recordUtils';
import { generateMonthlyReport } from '@/lib/analytics/emotionAggregator';
import { analyzeEmotionsFromConversation, extractKeywordsFromConversation, generateSummaryFromConversation } from '@/lib/analytics/conversationAnalyzer';
import { ChatMessage, Record } from '@/lib/types';
import Tag from '@/components/ui/Tag';
import RecordCard from '@/components/ui/RecordCard';
import questionsData from '@/data/questions.json';
import TutorialBanner from '@/components/tutorial/TutorialBanner';
import TutorialSection from '@/components/tutorial/TutorialSection';
import { getCurrentTutorialStep, checkTutorialProgress } from '@/lib/utils/tutorial';
import mockRecords from '@/data/mockRecords.json';
import SplashScreen from '@/components/layout/SplashScreen';

export default function Home() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isChatMode, setIsChatMode] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  const [lastImageAnalysis, setLastImageAnalysis] = useState<string | null>(null); // 마지막 이미지 분석 결과 저장
  const [tutorialStep, setTutorialStep] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  
  useEffect(() => {
    // 저장된 대화 데이터 가져오기
    const conversations = getAllConversations();
    const conversationRecords = conversations.map(conv => conversationToRecord(conv));
    
    // Mock 데이터와 합치기 (타입 변환)
    const mockRecordsTyped = (mockRecords as any[]).map(record => ({
      ...record,
      emotions: (record.emotions || []) as any,
      tags: record.tags || [],
      images: record.images || [],
    })) as Record[];
    
    // Mock 데이터의 id 목록 (우선 보존)
    const mockRecordIds = new Set(mockRecordsTyped.map(r => r.id));
    
    // conversationRecords에서 mockRecords와 중복되지 않는 것만 필터링
    const uniqueConversationRecords = conversationRecords.filter(
      record => !mockRecordIds.has(record.id)
    );
    
    // Mock 데이터를 먼저 넣고, 그 다음 conversationRecords 추가
    const combinedRecords = [...mockRecordsTyped, ...uniqueConversationRecords];
    
    setRecords(conversationRecords);
    setAllRecords(combinedRecords);
    
    // 튜토리얼 진행 상황 확인
    const step = checkTutorialProgress(conversationRecords.length);
    setTutorialStep(step);
    
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
    router.push('/record');
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
      // 대화 맥락을 유지하기 위해 전체 메시지 히스토리 전달
      // 이미지가 첨부된 대화인 경우 이미지 분석 결과도 함께 전달
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
          messages: updatedMessages, // 전체 대화 히스토리 포함
          imageAnalysis: imageAnalysisToSend, // 이미지 분석 결과 전달 (있는 경우)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI 채팅 API 오류:', response.status, errorData);
        throw new Error(`API 호출 실패: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ AI 응답 받음:', data);
      console.log('응답 메시지:', data.message);
      
      // 응답 메시지가 없거나 빈 값인 경우 확인
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
      console.error('오류 상세:', error);
      
      // 에러 메시지에 따라 다른 응답 제공
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
    // 이미지를 base64로 변환
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
      
      // 이미지 분석 API 호출
      try {
        console.log('이미지 분석 시작...', { imageSize: base64Image.length, messageCount: messages.length });
        
        const analyzeResponse = await fetch('/api/ai-image-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: base64Image,
            conversationHistory: messages, // 대화 맥락 전달
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
        
        // 이미지 분석 결과를 상태에 저장 (이후 텍스트 메시지에서도 사용)
        setLastImageAnalysis(imageAnalysis);

        // 이미지 분석 후 AI 응답 생성 (대화 맥락 포함)
        console.log('AI 채팅 요청 시작...', { messageCount: updatedMessages.length, imageAnalysis: imageAnalysis.substring(0, 50) });
        
        const chatResponse = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages, // 전체 대화 히스토리 포함
            imageAnalysis, // 이미지 분석 결과 전달
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
        // 오류 발생 시에도 기본 응답 제공
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

  // 마우스 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = 'grab';
    scrollContainerRef.current.style.userSelect = 'auto';
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = false;
    scrollContainerRef.current.style.cursor = 'grab';
    scrollContainerRef.current.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2; // 스크롤 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <MobileFrame>
        <div className="flex flex-col h-full">
        <main className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6 relative">
          {!isChatMode ? (
            <div className="relative">
              {/* 제목과 캐릭터를 묶은 영역 */}
              <div className="relative min-h-[150px] flex items-end mb-6">
                {/* 배경 캐릭터 (스플래시 화면과 동일) */}
                {(() => {
                  const characterColors = ['black', 'yellow', 'orange', 'green', 'blue'];
                  // 스플래시 화면에서 선택한 캐릭터 사용 (없으면 랜덤)
                  const storedColor = typeof window !== 'undefined' ? localStorage.getItem('selectedCharacter') : null;
                  const randomColor = (storedColor && characterColors.includes(storedColor)) 
                    ? storedColor 
                    : characterColors[Math.floor(Math.random() * characterColors.length)];
                  
                  return (
                    <div className="absolute right-0 bottom-0 w-32 h-32 opacity-100 pointer-events-none scale-90">
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

                {/* 제목 */}
                <div className="relative z-10 flex-1 pr-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                    동현님,<br />
                    오늘 하루는 어떠셨나요?
                  </h2>
                  
                  {/* 키워드 7개 표시 */}
                  {report.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.slice(0, 7).map((keyword) => (
                        <Tag key={keyword}>{keyword}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 메인 콘텐츠 영역 */}
              <div className="relative z-10">
                
                {/* 튜토리얼 배너 */}
                {tutorialStep && (
                  <TutorialBanner 
                    step={tutorialStep}
                    onDismiss={() => setTutorialStep(null)}
                  />
                )}

                <DailyQuestion question={currentQuestion} />
                <button
                  onClick={handleStartChat}
                  className="w-full bg-primary-500 text-white py-2.5 rounded-full font-bold text-sm hover:bg-primary-600 active:bg-primary-700 transition-all uppercase tracking-wide mt-2 mb-6 flex items-center justify-center gap-2"
                >
                  하루 기록하기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 갤러리 카드 - 좌우 스크롤 */}
                {allRecords.length > 0 && (
                  <div className="mb-8 -mx-6 px-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">최근 아카이브</h3>
                    <div className="relative">
                      <div 
                        ref={scrollContainerRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing" 
                        style={{ 
                          WebkitOverflowScrolling: 'touch',
                          touchAction: 'pan-x pinch-zoom',
                          overscrollBehaviorX: 'contain'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                      >
                        {allRecords
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 10)
                          .map((record, index) => {
                            const { dayName, dayNumber } = getDateInfo(record.date);
                            const { imageUrl: defaultImage, hasValidImage } = getRecordImage(record, index);
                            const recordIsToday = isToday(record.date);
                            
                            return (
                              <RecordCard
                                key={record.id}
                                record={record}
                                defaultImage={defaultImage}
                                hasValidImage={hasValidImage}
                                dayName={dayName}
                                dayNumber={dayNumber}
                                isToday={recordIsToday}
                                onClick={() => router.push(`/archive/${record.id}`)}
                                className="w-32 flex-shrink-0"
                                dataAttribute="data-gallery-card-id"
                                enableDragDetection={true}
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 서비스 설명 4가지 */}
                <div className="mb-8 bg-gray-50 rounded-material-md p-5 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center mt-0.5">
                        <span className="text-orange-700 text-xs font-bold">1</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">음성과 사진으로 하루를 기록해요</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center mt-0.5">
                        <span className="text-orange-700 text-xs font-bold">2</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">AI가 감정과 키워드를 분석해요</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center mt-0.5">
                        <span className="text-orange-700 text-xs font-bold">3</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">시간이 지나면 패턴이 보여요</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center mt-0.5">
                        <span className="text-orange-700 text-xs font-bold">4</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">특별한 순간을 영상으로 남겨요</p>
                    </div>
                  </div>
                </div>

                {/* 튜토리얼 섹션 */}
                <TutorialSection />

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
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsChatMode(false);
                    setMessages([]);
                    setConversationCount(0);
                    setShowReportPrompt(false);
                    setLastImageAnalysis(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="뒤로가기"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-medium text-gray-900">오늘의 기록</h1>
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
                        setTutorialStep(updatedStep);
                        
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
          <div className="px-2 pb-4">
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
    </>
  );
}


