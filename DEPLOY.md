# 배포 가이드

## GitHub에 푸시하기

### 1. GitHub에서 새 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `malangi`)
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크하지 않기**
6. "Create repository" 클릭

### 2. 로컬 저장소를 GitHub에 연결

GitHub에서 제공하는 명령어를 실행하거나, 아래 명령어를 사용하세요:

```bash
# GitHub 저장소 URL을 원격 저장소로 추가
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 또는 SSH 사용 시
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 현재 브랜치 확인 (main이어야 함)
git branch

# GitHub에 푸시
git push -u origin main
```

## Netlify 배포하기

### 1. Netlify 계정 생성 및 로그인

1. [Netlify](https://www.netlify.com)에 접속
2. "Sign up" 클릭하여 계정 생성 (GitHub 계정으로 로그인 권장)

### 2. 새 사이트 생성

1. Netlify 대시보드에서 "Add new site" → "Import an existing project" 클릭
2. "GitHub" 선택하여 GitHub 계정 연결
3. 방금 만든 저장소 선택

### 3. 빌드 설정

Netlify가 자동으로 설정을 감지하지만, 확인하세요:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Base directory**: (비워두기)

### 4. 환경 변수 설정

1. "Site settings" → "Environment variables" 클릭
2. "Add variable" 클릭
3. 다음 변수 추가:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: (본인의 OpenAI API 키)

### 5. 배포

1. "Deploy site" 클릭
2. 빌드가 완료되면 사이트가 배포됩니다
3. 자동으로 생성된 URL로 접속 가능 (예: `https://your-site-name.netlify.app`)

### 6. 커스텀 도메인 (선택사항)

1. "Domain settings" → "Add custom domain"
2. 도메인 입력 및 DNS 설정 안내 따르기

## 주의사항

- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함)
- Netlify 환경 변수에 `OPENAI_API_KEY`를 반드시 설정해야 합니다
- 빌드 시 Node.js 18 버전이 사용됩니다 (`netlify.toml`에 설정됨)

## 문제 해결

### 빌드 실패 시

1. Netlify 빌드 로그 확인
2. 환경 변수가 제대로 설정되었는지 확인
3. `package.json`의 빌드 스크립트 확인

### API 오류 시

1. OpenAI API 키가 올바른지 확인
2. API 사용량 한도 확인
3. Netlify 환경 변수 재설정

