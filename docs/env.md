# 환경 변수 및 보안

## 필수 환경 변수
- `GEMINI_API_KEY`: Gemini API 키 (Google AI Studio)
- `GEMINI_MODEL_ID`: 기본 `gemini-2.5-flash-image`
- `PORT` (백엔드): 기본 8080
- `NEXT_PUBLIC_API_BASE` (프론트): 상대 경로 사용 시 생략 가능(`/api`)

## .env 관리
- `.env`는 절대 커밋하지 않음
- 샘플 파일 `env.example`를 제공하고 실제 값은 배포 환경에서 주입
- PM2 에코시스템 파일 또는 환경별 `.env.production` 사용 가능

## 예시
```dotenv
# AI Provider
AI_PROVIDER=google

# Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL_ID=gemini-2.5-flash-image

# Nanobanana (optional)
NANOBANANA_API_KEY=YOUR_NANOBANANA_API_KEY
NANOBANANA_ENDPOINT=https://api.nanobanana.ai/generate

# Backend
PORT=8080

# Frontend
NEXT_PUBLIC_API_BASE=/api
```

## 보안 베스트 프랙티스
- 비밀키는 OS 환경 변수/시크릿 매니저/배포 파이프라인 시크릿으로 주입
- 서버 접근 제한(방화벽/보안그룹)
- 백엔드에서 입력 검증, Rate limit, CORS 화이트리스트 적용
- 로그에 민감 정보 마스킹
