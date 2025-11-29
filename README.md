# 말랑이 - AI 기반 감성 아카이빙 서비스

음성과 사진으로 기록하고, 감정을 시각화하고, 기념 영상을 만드는 서비스입니다.

## 주요 기능

- 🎤 **음성 기반 대화**: Web Speech API를 활용한 음성 입력
- 📸 **사진 첨부**: 대화에 사진을 첨부하여 더 풍부한 기록
- 🎨 **AI 이미지 생성**: 대화 내용을 기반으로 DALL-E가 대표 이미지 생성
- 📊 **감정 분석**: OpenAI GPT를 활용한 감정 분석 및 시각화
- 🏷️ **자동 카테고리화**: 대화 맥락을 분석하여 자동으로 카테고리 분류
- 📅 **아카이빙**: 리스트/갤러리 뷰로 기록 관리
- 📈 **감정 리포트**: 월별 감정 추이 및 통계 제공

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI (GPT-4o-mini, DALL-E 3)
- **Storage**: LocalStorage

## 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd 말랑이
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 OpenAI API 키를 추가하세요:

```env
OPENAI_API_KEY=your_api_key_here
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

### Netlify 배포

1. GitHub에 저장소를 푸시합니다
2. Netlify에 로그인하고 "New site from Git" 선택
3. GitHub 저장소를 연결합니다
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. 환경 변수에 `OPENAI_API_KEY` 추가
6. Deploy!

## 프로젝트 구조

```
말랑이/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── archive/           # 아카이빙 페이지
│   ├── report/            # 감정 리포트 페이지
│   └── refeel/            # 릴스 만들기 페이지
├── components/            # React 컴포넌트
│   ├── archive/          # 아카이빙 관련 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── report/           # 리포트 컴포넌트
│   └── ui/               # UI 컴포넌트
├── lib/                  # 유틸리티 및 로직
│   ├── ai/               # AI 클라이언트
│   ├── analytics/        # 분석 로직
│   └── utils/            # 유틸리티 함수
└── public/               # 정적 파일
```

## 라이선스

MIT
