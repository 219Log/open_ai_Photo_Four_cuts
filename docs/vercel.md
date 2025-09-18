# Vercel 배포 & 환경 변수 설정

## 1) 배포
- GitHub 연결 후 Import Project → Framework: Next.js → 기본 설정으로 Deploy

## 2) 환경 변수(중요)
- 프로젝트 → Settings → Environment Variables
- 운영(Production)과 미리보기(Preview)는 분리됩니다. 사용하는 환경에 각각 추가하세요.

필수 키
1. `GEMINI_API_KEY` (Sensitive ON, Environment: Production/Preview 각각)
2. `GEMINI_MODEL_ID = gemini-2.5-flash-image-preview` (민감 아님, All Environments 가능)

팁
- UI 이슈로 값 입력 모달이 열리지 않으면 `Import .env`로 아래 내용을 업로드:
```
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL_ID=gemini-2.5-flash-image-preview
```

## 3) 재배포(Rebuild)
- Deployments → Redeploy → Environment 선택(Production 또는 Preview) → Use existing Build Cache 해제 → Redeploy

## 4) 라우트/베이스 URL
- Next.js Route Handler(`/api/generate`)를 사용하므로 Vercel에서는 `NEXT_PUBLIC_API_BASE`가 필요 없습니다.
- 만약 설정돼 있다면 삭제 후 재배포하세요.

## 5) 로그/문제 해결
- Deployments → 해당 배포 → Functions Logs에서 서버리스 함수 로그 확인
- 자주 발생:
  - `GEMINI_API_KEY missing`: 현재 접속한 환경에 키가 없음 → 해당 환경에 키 추가 후 재배포
  - `DNS_HOSTNAME_RESOLVED_PRIVATE`: 사설 LAN 주소로 호출 시 발생 → 상대경로(`/api/generate`) 사용
