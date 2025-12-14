'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface ChatThreadProps {
  messages: ChatMessage[];
  staggerDelay?: number; // 메시지 간 딜레이 (ms), 기본값 1000ms (1초)
}

export default function ChatThread({ messages, staggerDelay = 1000 }: ChatThreadProps) {
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(0);

  // 메시지가 변경되면 첫 메시지부터 시작
  useEffect(() => {
    if (messages.length > 0) {
      setVisibleMessageCount(1); // 첫 메시지 표시
    } else {
      setVisibleMessageCount(0);
    }
  }, [messages.length]);

  // 1초 간격으로 다음 메시지 표시
  useEffect(() => {
    if (visibleMessageCount < messages.length) {
      const timeout = setTimeout(() => {
        setVisibleMessageCount(prev => prev + 1);
      }, staggerDelay);
      
      return () => clearTimeout(timeout);
    }
  }, [visibleMessageCount, messages.length, staggerDelay]);

  const visibleMessages = messages.slice(0, visibleMessageCount);

  return (
    <div className="space-y-4 pb-4">
      {visibleMessages.map((message) => {
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
                  
                  return formatTextWithHashtags(message.content);
                })()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

