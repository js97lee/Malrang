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

  // 타이핑 중인 사용자 메시지 찾기
  const findTypingMessageIndex = () => {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.type === 'answer') {
        const typingMsg = typingMessages.get(message.id);
        if (typingMsg && !typingMsg.isComplete) {
          return i;
        }
      }
    }
    return -1;
  };

  const typingMessageIndex = findTypingMessageIndex();
  // 타이핑 중인 메시지가 있으면 그 이후의 메시지는 숨김
  const visibleMessages = typingMessageIndex >= 0 
    ? messages.slice(0, typingMessageIndex + 1)
    : messages;

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
                {displayText}
                {message.type === 'answer' && typingMsg && !typingMsg.isComplete && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse">|</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

