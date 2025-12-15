'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// 시나리오 정의
const scenarios = [
  {
    id: 'example1',
    name: '예시1',
    question: '오늘 어떤일이 있었나요?',
    steps: [
      {
        delay: 1500,
        message: {
          id: '2',
          type: 'answer' as const,
          content: '오늘 지윤이 돌 기념으로 스튜디오에서 촬영이 있는 날이였어. 한복과 드레스를 입고 사진을 찍었어.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '3',
          type: 'question' as const,
          content: '아이가 사진촬영하는게 쉽지 않았을 텐데 너무 사랑스러워요😍 어떤 기분이었나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '4',
          type: 'answer' as const,
          content: '응! 촬영에 울지않고 잘 참여해줘서 너무 고맙고 결과물도 상당히 마음에 들었어. 스튜디오에서 성장앨범 남기길 잘 했다는 생각이 들었어.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '4-1',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card1.png'],
        },
      },
      {
        delay: 500,
        message: {
          id: '4-2',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card1-2.jpeg'],
        },
      },
      {
        delay: 2000,
        message: {
          id: '5',
          type: 'question' as const,
          content: '훌륭하네요! 좋은 추억이 될꺼같아요! 뿌듯하시겠어요! 자동태그로 베스트샷 등록해드릴까요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '6',
          type: 'answer' as const,
          content: '좋아, 앞으로도 지윤이 성장기록을 아카이빙해서 관리해줘.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '7',
          type: 'question' as const,
          content: '네, 알겠습니다.\n\n#지윤이 #돌기념촬영 #한복 #드레스 #사랑스러움 #뿌듯함 으로 기록할게요.\n\n앞으로도 좋은 추억 많이 쌓으시길 바래요😉',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
  {
    id: 'example2',
    name: '예시2',
    question: '오늘 어떤일이 있었나요?',
    steps: [
      {
        delay: 1500,
        message: {
          id: '2',
          type: 'answer' as const,
          content: '오랜만에 내 유년 시절 사진을 찾았어. 저장해줘',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '3',
          type: 'question' as const,
          content: '네. 저장해 둘게요. 베스트샷을 선택하겠습니까?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '4',
          type: 'answer' as const,
          content: '유년 시절 사진이 많이 없으니까 둘다 해줘.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '4-1',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card22.jpeg'],
        },
      },
      {
        delay: 500,
        message: {
          id: '4-2',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card30.jpeg'],
        },
      },
      {
        delay: 2000,
        message: {
          id: '5',
          type: 'question' as const,
          content: '네. 어릴때 사진을 찾고 기분이 어떠셨나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '6',
          type: 'answer' as const,
          content: '어른이 되고 보니 새로웠어. 근데 필름 사진이라 화질이랑, 영상으로 남아있지 않아서 조금 아쉬웠어.\n\n요즘은 영상으로 많이 찍잖아.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '7',
          type: 'question' as const,
          content: '주마등 영상을 만들때는 선택한 사진 일부를 움직이게 할수 있어요. 영상으로 만들 사진을 미리 선택하시겠어요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '8',
          type: 'answer' as const,
          content: '좋아. 엄마랑 찍은 사진으로 움직이게 해줘. 어렸을땐 내가 개구장이었으니까 엄마랑 같이 좌우로 까딱거리면서 움직였으면 좋겠어.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '9',
          type: 'question' as const,
          content: '좋아요. 유년시절에 대해 남기고 싶은 기억이나 특징이 있나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '10',
          type: 'answer' as const,
          content: '웃음이 많았고 아빠랑 똑 닮았었어',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '11',
          type: 'question' as const,
          content: '기억해 둘게요. 베스트 샷으로 유년시절부터 지금까지 주마등 영상을 만들 수 있어요.',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
  {
    id: 'example1-2',
    name: '예시3',
    question: '', // 사용자가 먼저 사진을 첨부하므로 초기 질문 없음
    steps: [
      {
        delay: 0, // 즉시 시작 (사용자가 이미 사진을 첨부한 상태)
        message: {
          id: '1-2-1',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card31.jpeg'],
        },
      },
      {
        delay: 500,
        message: {
          id: '1-2-2',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card32.jpeg'],
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-3',
          type: 'question' as const,
          content: '오늘은 지윤이가 웃는얼굴이에요.\n\n#지윤 #딸 #웃음 로 등록할까요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-4',
          type: 'answer' as const,
          content: '응',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-5',
          type: 'question' as const,
          content: '베스트샷 등록하시겠어요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-6',
          type: 'answer' as const,
          content: '응',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-7',
          type: 'question' as const,
          content: '등록 완료하였습니다. 오늘은 어떤 상황이었나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-8',
          type: 'answer' as const,
          content: '안돼 라는 말을 배워서 하루 종일 힘들었어. 분위기가 안좋았는데 남편이 하이파이브 하니까 장난꾸러기 처럼 씩 웃으면서 인사하더라구. 사르르 녹아서 웃었지 뭐.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-9',
          type: 'question' as const,
          content: '기분이 풀려서 다행이에요.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '1-2-10',
          type: 'answer' as const,
          content: '응 지윤이는 특히나 사람들을 행복하게 하는 사람이야. 엄마 눈치보고 또 웃게 해주잖아.',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
  {
    id: 'example2-2',
    name: '예시4',
    question: '', // 사용자가 먼저 사진을 첨부하므로 초기 질문 없음
    steps: [
      {
        delay: 0, // 즉시 시작 (사용자가 이미 사진을 첨부한 상태)
        message: {
          id: '2-2-1',
          type: 'image' as const,
          content: '사진을 첨부했습니다.',
          timestamp: new Date().toISOString(),
          images: ['/card33.jpeg'],
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-2',
          type: 'question' as const,
          content: '신나보여요. 텍스트를 인지해보니 승진하셨군요.\n\n#신남 #승진 #축하 #인정 #행복 #회사 로 등록할까요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-3',
          type: 'answer' as const,
          content: '응',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-4',
          type: 'question' as const,
          content: '베스트샷 등록하시겠어요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-5',
          type: 'answer' as const,
          content: '응',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-6',
          type: 'question' as const,
          content: '등록 완료하였습니다. 오늘은 어떤 상황이었나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-7',
          type: 'answer' as const,
          content: '올해 첫 팀장 직책을 달았어',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-8',
          type: 'question' as const,
          content: '축하합니다. 회사에서 인정을 받으셨네요',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-9',
          type: 'answer' as const,
          content: '가족들 덕분이지ㅎㅎ 나 혼자 타지에 있는데 잘 이해해주고.',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-10',
          type: 'question' as const,
          content: '#가족 도 태그로 넣을까요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-11',
          type: 'answer' as const,
          content: '응',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-12',
          type: 'question' as const,
          content: '가족들에게 하고 싶은말이 있나요?',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 1000,
        message: {
          id: '2-2-13',
          type: 'answer' as const,
          content: '...',
          timestamp: new Date().toISOString(),
        },
      },
      {
        delay: 2000,
        message: {
          id: '2-2-14',
          type: 'question' as const,
          content: '장시간 대화가 없어 자동 종료합니다. 업데이트 완료 되었습니다.',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
];

function RecordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  const [lastImageAnalysis, setLastImageAnalysis] = useState<string | null>(null);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [scenarioTimeouts, setScenarioTimeouts] = useState<NodeJS.Timeout[]>([]);

  // URL 파라미터에서 시나리오 확인
  useEffect(() => {
    const scenarioParam = searchParams.get('scenario');
    if (scenarioParam) {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioParam);
      if (scenarioIndex !== -1 && scenarioIndex !== selectedScenarioIndex) {
        setSelectedScenarioIndex(scenarioIndex);
      }
    }
  }, [searchParams]);

  // 시나리오 변경 핸들러 - 완전히 독립적인 시나리오로 분리
  const handleScenarioChange = (index: number) => {
    setShowScenarioMenu(false);
    
    // 이전 시나리오의 모든 타이머 정리
    scenarioTimeouts.forEach(timeout => clearTimeout(timeout));
    setScenarioTimeouts([]);
    
    // 모든 상태를 완전히 초기화 (독립적인 시나리오)
    setMessages([]);
    setConversationCount(0);
    setShowReportPrompt(false);
    setLastImageAnalysis(null);
    setCurrentQuestion('');
    
    // 시나리오 인덱스 변경 (useEffect가 새 시나리오를 시작함)
    setSelectedScenarioIndex(index);
  };

  useEffect(() => {
    const selectedScenario = scenarios[selectedScenarioIndex];
    if (!selectedScenario) return;
    
    // 이전 시나리오의 타이머가 있다면 정리
    scenarioTimeouts.forEach(timeout => clearTimeout(timeout));
    setScenarioTimeouts([]);
    
    // 완전히 새로운 시나리오 시작 - 모든 상태 초기화
    setCurrentQuestion(selectedScenario.question);
    setConversationCount(0);
    setShowReportPrompt(false);
    setLastImageAnalysis(null);
    
    // 초기 메시지 설정 (예시1-2는 사진부터 시작하므로 질문 없음)
    if (selectedScenario.question) {
      setMessages([
        {
          id: `${selectedScenario.id}-1`,
          type: 'question',
          content: selectedScenario.question,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages([]);
    }
    
    // 자동으로 시나리오 진행
    const timeouts: NodeJS.Timeout[] = [];
    let currentDelay = 0;
    
    selectedScenario.steps.forEach((step) => {
      currentDelay += step.delay;
      const timeout = setTimeout(() => {
        setMessages((prev) => {
          // 시나리오별 고유 ID로 중복 방지
          const messageId = `${selectedScenario.id}-${step.message.id}`;
          const exists = prev.some(msg => msg.id === messageId);
          if (exists) return prev;
          
          return [...prev, {
            ...step.message,
            id: messageId, // 시나리오 ID를 포함한 고유 ID
          }];
        });
        if (step.message.type === 'answer' || step.message.type === 'image') {
          setConversationCount((prev) => prev + 1);
        }
      }, currentDelay);
      timeouts.push(timeout);
    });
    
    setScenarioTimeouts(timeouts);
    
    // cleanup 함수: 시나리오 변경 시 모든 타이머 정리
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [selectedScenarioIndex]);

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
        <PageHeader 
          title="오늘의 기록" 
          rightAction={
            <div className="relative">
              <button
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                {scenarios[selectedScenarioIndex].name}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* 시나리오 메뉴 */}
              {showScenarioMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowScenarioMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    {scenarios.map((scenario, index) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleScenarioChange(index)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedScenarioIndex === index
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {scenario.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          }
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 pb-6 relative">
          
          <div className="relative pb-20">
            <ChatThread messages={messages} staggerDelay={500} />
            
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

export default function RecordPage() {
  return (
    <Suspense fallback={
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
          <p className="text-gray-700 font-medium">로딩 중...</p>
        </div>
      </MobileFrame>
    }>
      <RecordPageContent />
    </Suspense>
  );
}

