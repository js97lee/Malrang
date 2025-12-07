'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface ChatThreadProps {
  messages: ChatMessage[];
}

interface TypingMessage {
  id: string;
  displayedText: string;
  fullText: string;
  isComplete: boolean;
}

export default function ChatThread({ messages }: ChatThreadProps) {
  const [typingMessages, setTypingMessages] = useState<Map<string, TypingMessage>>(new Map());

  useEffect(() => {
    messages.forEach((message) => {
      // 사용자 메시지(answer 타입)에만 타이핑 애니메이션 적용
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

        // 타이핑 애니메이션 시작
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
        }, 120); // 120ms마다 한 글자씩 (속도 조절 가능)

        return () => clearInterval(typingInterval);
      }
    });
  }, [messages]);

  return (
    <div className="space-y-4 pb-4">
      {messages.map((message) => {
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

