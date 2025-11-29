'use client';

import React from 'react';
import { ChatMessage } from '@/lib/types';
import Tag from '@/components/ui/Tag';

interface ChatThreadProps {
  messages: ChatMessage[];
}

export default function ChatThread({ messages }: ChatThreadProps) {
  return (
    <div className="space-y-4 pb-4">
      {messages.map((message) => (
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
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

