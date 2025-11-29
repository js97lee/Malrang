import { Record } from '../types';

/**
 * 대화 내용을 기반으로 이미지 생성 프롬프트 생성
 */
export function generateImagePrompt(record: Record): string {
  const summary = record.summary || record.answer;
  const emotions = record.emotions.join(', ');
  const tags = record.tags.slice(0, 3).join(', ');
  
  // 대화 내용을 기반으로 이미지 프롬프트 생성
  let prompt = `A warm, emotional, and peaceful illustration representing: ${summary}`;
  
  if (emotions) {
    prompt += `, with emotions of ${emotions}`;
  }
  
  if (tags) {
    prompt += `, featuring ${tags}`;
  }
  
  prompt += `. Soft, pastel colors, gentle lighting, minimalist style, Korean aesthetic, diary-like illustration`;
  
  return prompt;
}

/**
 * 이미지가 없는 기록에 대해 DALL-E로 이미지 생성
 * 이미 localStorage에 저장된 이미지가 있으면 재사용
 */
export async function generateImageForRecord(record: Record): Promise<string | null> {
  // 이미 이미지가 있으면 생성하지 않음
  if (record.images && record.images.length > 0) {
    return record.images[0];
  }

  // localStorage에서 저장된 생성 이미지 확인
  try {
    const { getAllConversations } = await import('./conversationStorage');
    const conversations = getAllConversations();
    const conversation = conversations.find(conv => conv.id === record.id);
    
    if (conversation && conversation.generatedImage) {
      return conversation.generatedImage;
    }
  } catch (error) {
    console.error('저장된 이미지 확인 오류:', error);
  }

  try {
    const prompt = generateImagePrompt(record);
    
    const response = await fetch('/api/ai-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      throw new Error('이미지 생성 실패');
    }

    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return null;
  }
}

/**
 * 여러 기록에 대해 이미지 생성 (배치 처리)
 */
export async function generateImagesForRecords(records: Record[]): Promise<Record[]> {
  const recordsWithImages = await Promise.all(
    records.map(async (record) => {
      if (!record.images || record.images.length === 0) {
        const generatedImage = await generateImageForRecord(record);
        if (generatedImage) {
          return {
            ...record,
            images: [generatedImage],
          };
        }
      }
      return record;
    })
  );

  return recordsWithImages;
}

