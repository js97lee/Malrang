'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface ChatThreadProps {
  messages: ChatMessage[];
  staggerDelay?: number; // 메시지 간 딜레이 (ms), 0이면 순차 표시 안 함
}

interface TypingMessage {
  id: string;
  displayedText: string;
  fullText: string;
  isComplete: boolean;
}

export default function ChatThread({ messages, staggerDelay = 0 }: ChatThreadProps) {
  const [typingMessages, setTypingMessages] = useState<Map<string, TypingMessage>>(new Map());
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(staggerDelay > 0 ? 0 : messages.length);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());

  // 순차 표시 효과 - 각 메시지가 완료된 후 다음 메시지 표시
  useEffect(() => {
    if (staggerDelay > 0 && messages.length > 0) {
      setVisibleMessageCount(1); // 첫 메시지부터 표시
      setCompletedMessages(new Set());
    } else {
      setVisibleMessageCount(messages.length);
    }
  }, [messages, staggerDelay]);

  useEffect(() => {
    if (staggerDelay === 0) {
      // staggerDelay가 0이면 모든 메시지에 타이핑 애니메이션 적용 (기존 로직)
      messages.forEach((message) => {
        if (message.type === 'answer' && !typingMessages.has(message.id)) {
          const fullText = message.content;
          setTypingMessages((prev) => {
            const newMap = new Map(prev);
            newMap.set(message.id, {
              id: message.id,
              displayedText: '',
              fullText,
              isComplete: false,
            });
            return newMap;
          });

          let currentIndex = 0;
          const typingInterval = setInterval(() => {
            setTypingMessages((prev) => {
              const newMap = new Map(prev);
              const typingMsg = newMap.get(message.id);
              if (!typingMsg) {
                clearInterval(typingInterval);
                return prev;
              }

              if (currentIndex < fullText.length) {
                currentIndex += 1;
                newMap.set(message.id, {
                  ...typingMsg,
                  displayedText: fullText.substring(0, currentIndex),
                });
              } else {
                newMap.set(message.id, {
                  ...typingMsg,
                  displayedText: fullText,
                  isComplete: true,
                });
                clearInterval(typingInterval);
              }
              return newMap;
            });
          }, 120);
        }
      });
      return;
    }

    // staggerDelay가 있으면 순차 표시
    const visibleMessages = messages.slice(0, visibleMessageCount);
    const lastMessage = visibleMessages[visibleMessages.length - 1];
    
    if (!lastMessage) return;

    // 마지막 메시지가 answer 타입이고 타이핑이 완료되지 않았으면 타이핑 시작
    if (lastMessage.type === 'answer' && !typingMessages.has(lastMessage.id)) {
      const fullText = lastMessage.content;
      setTypingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(lastMessage.id, {
          id: lastMessage.id,
          displayedText: '',
          fullText,
          isComplete: false,
        });
        return newMap;
      });

      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        setTypingMessages((prev) => {
          const newMap = new Map(prev);
          const typingMsg = newMap.get(lastMessage.id);
          if (!typingMsg) {
            clearInterval(typingInterval);
            return prev;
          }

          if (currentIndex < fullText.length) {
            currentIndex += 1;
            newMap.set(lastMessage.id, {
              ...typingMsg,
              displayedText: fullText.substring(0, currentIndex),
            });
          } else {
            newMap.set(lastMessage.id, {
              ...typingMsg,
              displayedText: fullText,
              isComplete: true,
            });
            clearInterval(typingInterval);
            
            // 타이핑 완료 후 staggerDelay 시간 후 다음 메시지 표시
            setTimeout(() => {
              if (visibleMessageCount < messages.length) {
                setVisibleMessageCount(prev => prev + 1);
              }
            }, staggerDelay);
          }
          return newMap;
        });
      }, 120);
    } else if (lastMessage.type !== 'answer') {
      // AI 메시지나 이미지 메시지는 즉시 완료 처리 후 다음 메시지 표시
      if (!completedMessages.has(lastMessage.id)) {
        setCompletedMessages((prev) => {
          const newSet = new Set(prev);
          newSet.add(lastMessage.id);
          return newSet;
        });
        
        setTimeout(() => {
          if (visibleMessageCount < messages.length) {
            setVisibleMessageCount(prev => prev + 1);
          }
        }, staggerDelay);
      }
    } else if (lastMessage.type === 'answer') {
      // answer 타입이고 타이핑이 완료되었으면 다음 메시지 표시
      const typingMsg = typingMessages.get(lastMessage.id);
      if (typingMsg?.isComplete && !completedMessages.has(lastMessage.id)) {
        setCompletedMessages((prev) => {
          const newSet = new Set(prev);
          newSet.add(lastMessage.id);
          return newSet;
        });
        
        setTimeout(() => {
          if (visibleMessageCount < messages.length) {
            setVisibleMessageCount(prev => prev + 1);
          }
        }, staggerDelay);
      }
    }
  }, [messages, visibleMessageCount, staggerDelay, completedMessages, typingMessages]);

  const visibleMessages = messages.slice(0, visibleMessageCount);

  return (
    <div className="space-y-4 pb-4">
      {visibleMessages.map((message) => {
        const typingMsg = typingMessages.get(message.id);
        const displayText = 
          message.type === 'answer' && typingMsg 
            ? typingMsg.displayedText || '' 
            : message.content;

        return (
          <div
            key={message.id}
            className={`flex ${message.type === 'question' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-material-md p-4 ${
                message.type === 'question'
                  ? 'bg-surface-variant text-gray-900'
                  : 'bg-primary-500 text-white'
              }`}
            >
              {message.type === 'image' && message.images && (
                <div className="mb-2 space-y-2">
                  {message.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Uploaded ${idx + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">
                {(() => {
                  // 해시태그를 볼드 처리하는 함수
                  const formatTextWithHashtags = (text: string) => {
                    const parts: (string | JSX.Element)[] = [];
                    const lines = text.split('\n');
                    
                    lines.forEach((line, lineIndex) => {
                      if (lineIndex > 0) {
                        parts.push('\n');
                      }
                      
                      // 해시태그 패턴 찾기 (#으로 시작하는 단어들)
                      const hashtagRegex = /(#[\w가-힣]+)/g;
                      let lastIndex = 0;
                      let match;
                      
                      while ((match = hashtagRegex.exec(line)) !== null) {
                        // 해시태그 이전 텍스트
                        if (match.index > lastIndex) {
                          parts.push(line.substring(lastIndex, match.index));
                        }
                        // 해시태그를 볼드 처리
                        parts.push(
                          <strong key={`hashtag-${lineIndex}-${match.index}`} className="font-bold">
                            {match[0]}
                          </strong>
                        );
                        lastIndex = match.index + match[0].length;
                      }
                      
                      // 마지막 해시태그 이후 텍스트
                      if (lastIndex < line.length) {
                        parts.push(line.substring(lastIndex));
                      }
                    });
                    
                    return parts.length > 0 ? parts : text;
                  };
                  
                  const formattedText = formatTextWithHashtags(displayText);
                  
                  return (
                    <>
                      {formattedText}
                      {message.type === 'answer' && typingMsg && !typingMsg.isComplete && (
                        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse">|</span>
                      )}
                    </>
                  );
                })()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

