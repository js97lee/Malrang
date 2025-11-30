const TUTORIAL_STORAGE_KEY = 'malang_tutorial_progress';
const USER_START_DATE_KEY = 'malang_user_start_date';

export interface TutorialProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
}

export interface TutorialStep {
  day: number;
  title: string;
  description: string;
  completed: boolean;
}

/**
 * 사용자 시작일 가져오기 또는 설정
 */
export function getUserStartDate(): Date {
  const stored = localStorage.getItem(USER_START_DATE_KEY);
  if (stored) {
    return new Date(stored);
  }
  
  // 시작일이 없으면 오늘로 설정
  const today = new Date();
  localStorage.setItem(USER_START_DATE_KEY, today.toISOString());
  return today;
}

/**
 * 사용 시작일로부터 경과 일수 계산
 */
export function getDaysSinceStart(): number {
  const startDate = getUserStartDate();
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 튜토리얼 진행 상황 가져오기
 */
export function getTutorialProgress(): TutorialProgress[] {
  const data = localStorage.getItem(TUTORIAL_STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 튜토리얼 단계 완료 처리
 */
export function completeTutorialStep(day: number): void {
  const progress = getTutorialProgress();
  const existing = progress.find(p => p.day === day);
  
  if (existing) {
    existing.completed = true;
    existing.completedAt = new Date().toISOString();
  } else {
    progress.push({
      day,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(progress));
}

/**
 * 현재 튜토리얼 단계 가져오기
 */
export function getCurrentTutorialStep(): TutorialStep | null {
  const daysSinceStart = getDaysSinceStart();
  const progress = getTutorialProgress();
  
  const steps: TutorialStep[] = [
    {
      day: 1,
      title: '1일차: 오늘 하루만 적어보세요',
      description: '첫 기록을 남겨보세요. 오늘 하루 어떤 일이 있었는지 자유롭게 적어보세요.',
      completed: progress.some(p => p.day === 1 && p.completed),
    },
    {
      day: 2,
      title: '2일차: 어제와 오늘을 비교해봐요',
      description: '어제와 오늘의 감정을 비교해보세요. 어떤 변화가 있었나요?',
      completed: progress.some(p => p.day === 2 && p.completed),
    },
    {
      day: 3,
      title: '3-5일차: 내 패턴이 보여요',
      description: '몇 일간의 기록을 통해 나만의 패턴을 발견해보세요.',
      completed: progress.some(p => p.day >= 3 && p.day <= 5 && p.completed),
    },
    {
      day: 7,
      title: '일주일 후: 나를 알게 됩니다',
      description: '일주일간의 기록을 통해 자신을 더 잘 이해하게 됩니다.',
      completed: progress.some(p => p.day >= 7 && p.completed),
    },
  ];

  // 완료되지 않은 첫 번째 단계 반환
  for (const step of steps) {
    if (daysSinceStart >= step.day && !step.completed) {
      return step;
    }
  }

  // 모든 단계 완료
  return null;
}

/**
 * 튜토리얼 단계 확인 (기록 수 기반)
 */
export function checkTutorialProgress(recordCount: number): TutorialStep | null {
  const daysSinceStart = getDaysSinceStart();
  
  // 기록 수에 따라 자동 완료 처리
  if (recordCount >= 1 && daysSinceStart >= 1) {
    completeTutorialStep(1);
  }
  if (recordCount >= 2 && daysSinceStart >= 2) {
    completeTutorialStep(2);
  }
  if (recordCount >= 3 && daysSinceStart >= 3) {
    completeTutorialStep(3);
  }
  if (recordCount >= 7 && daysSinceStart >= 7) {
    completeTutorialStep(7);
  }

  return getCurrentTutorialStep();
}

