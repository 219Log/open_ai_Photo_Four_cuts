# AI 네컷 스튜디오 문서

AI 인생네컷(4컷) 포토부스 서비스의 전체 문서입니다. Caddy 기반 HTTPS, Next.js 프론트엔드, Node.js(Express) 백엔드, Gemini 이미지 모델 연동을 포함합니다.

## 문서 목차
- [시스템 아키텍처(단일 Vercel / Self‑Hosted)](./architecture.md)
- [프론트엔드 UI/UX 사양](./frontend.md)
- [Next.js Route Handler(API) 사양](./route-handler.md)
- [AI 연동 가이드(Gemini, 프롬프트)](./ai-integration.md)
- [프린팅 가이드(레이아웃/CSS)](./printing.md)
- [클라이언트 저장소(localStorage/sessionStorage)](./storage.md)
- [Vercel 배포 & 환경 변수 설정](./vercel.md)
- [Self‑Hosted 배포 가이드(Caddy/PM2)](./deployment.md)
- [환경 변수 및 보안](./env.md)
- [문제 해결(에러 가이드)](./troubleshooting.md)
- [마일스톤 & 로드맵](./milestones.md)

## 개요
- 프로젝트명: AI 네컷 스튜디오
- 목적: 카메라/업로드 이미지를 4컷으로 구성하고, 프리셋/프롬프트에 맞춰 AI 변환 후 세로 스트립 형태로 인쇄
- 핵심 구성:
  - 프로덕션(권장): 단일 Next.js 앱(Vercel). API는 Next.js Route Handler(`/api/generate`).
  - 대안(자가호스팅): Caddy(HTTPS) + Next.js(프론트) + Node.js/Express(백엔드)

## 빠른 시작(요약)
1) 로컬 개발
- 루트에서 `npm install`
- 개발 서버: `npm run dev` (Next.js + Route Handler)

2) 환경변수
- `GEMINI_API_KEY` 필수, `GEMINI_MODEL_ID=gemini-2.5-flash-image-preview` 권장. 상세: [환경 변수](./env.md)

3) 배포
- 권장: Vercel에 단일 앱으로 배포 → [Vercel 가이드](./vercel.md)
- 대안: 자가호스팅(Caddy/PM2) → [Self‑Hosted 배포](./deployment.md)

## 보안 주의사항
- 실제 키/비밀번호는 절대 코드/리포지토리에 커밋 금지
- `.env`만 사용하고 `.gitignore`에 포함
- CORS/Rate Limit/입력 검증 등 기본 보안 적용. 상세: 각 문서 참고
