import { RefeelRequest } from '../types';

export interface RefeelGenerationRequest extends RefeelRequest {
  userId?: string;
}

export interface RefeelGenerationResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  previewUrl?: string;
  downloadUrl?: string;
}

/**
 * REFEEL 영상 생성 요청
 */
export async function generateRefeel(request: RefeelGenerationRequest): Promise<RefeelGenerationResponse> {
  // TODO: 실제 영상 생성 API 연동
  // 서버에서 비동기로 처리하고 작업 ID 반환
  
  const videoId = `video_${Date.now()}`;
  
  return {
    videoId,
    status: 'processing',
  };
}

/**
 * REFEEL 영상 생성 상태 확인
 */
export async function checkRefeelStatus(videoId: string): Promise<RefeelGenerationResponse> {
  // TODO: 실제 상태 확인 API 연동
  
  return {
    videoId,
    status: 'processing',
  };
}

/**
 * 생성된 REFEEL 영상 다운로드
 */
export async function downloadRefeel(videoId: string): Promise<Blob> {
  // TODO: 실제 다운로드 API 연동
  
  throw new Error('Not implemented');
}

