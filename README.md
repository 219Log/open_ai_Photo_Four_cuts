# AI 네컷 스튜디오 문서 (Self-Hosted Edition)

AI 인생네컷(4컷) 포토부스 서비스의 전체 문서입니다. Caddy 기반 HTTPS, Next.js 프론트엔드, Node.js(Express) 백엔드, Gemini 이미지 모델 연동을 포함합니다.

## 문서 목차

- [시스템 아키텍처](./architecture.md)
- [프론트엔드 UI/UX 사양](./frontend.md)
- [백엔드 API 사양](./backend-api.md)
- [AI 연동 가이드(Gemini, 프롬프트)](./ai-integration.md)
- [프린팅 가이드(레이아웃/CSS)](./printing.md)
- [배포 가이드(Caddy/PM2)](./deployment.md)
- [환경 변수 및 보안](./env.md)
- [마일스톤 & 로드맵](./milestones.md)

## 개요

- 프로젝트명: AI 네컷 스튜디오 (Self-Hosted)
- 목적: 카메라/업로드 이미지를 4컷으로 구성하고, 선택 프롬프트에 맞춰 AI 변환한 뒤 세로 스트립 형태로 인쇄
- 핵심 구성: Caddy(HTTPS, 리버스 프록시) + Next.js(프론트) + Node.js/Express(백엔드, AI 연동)

## 빠른 시작(요약)

1. 프론트/백엔드 로컬 개발

- 프론트엔드(Next.js): `npm install && npm run dev`
- 백엔드(Express): `npm install && npm run dev`

2. 환경변수 설정

- `.env`에 `GEMINI_API_KEY`, `GEMINI_MODEL_ID=gemini-2.5-flash-image` 등 설정. 상세: [환경 변수](./env.md)

3. 배포 개요

- PM2로 프론트/백엔드 실행
- Caddy 리버스 프록시 설정으로 HTTPS 종단. 상세: [배포 가이드](./deployment.md)

## 보안 주의사항

- 실제 키/비밀번호는 절대 코드/리포지토리에 커밋 금지
- `.env`만 사용하고 `.gitignore`에 포함
- CORS/Rate Limit/입력 검증 등 기본 보안 적용. 상세: 각 문서 참고
