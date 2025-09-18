# 문제 해결(트러블슈팅)

## GEMINI_API_KEY missing (500)
- 원인: 현재 접속한 환경(Production/Preview)에 키가 없음
- 조치: 해당 환경에 `GEMINI_API_KEY` 추가 → Redeploy(Use existing Build Cache 해제)

## DNS_HOSTNAME_RESOLVED_PRIVATE / 404처럼 보임
- 원인: Vercel에서 사설(LAN) 주소로 API 호출
- 조치: `NEXT_PUBLIC_API_BASE` 제거 → 상대경로 `/api/generate` 사용

## 404/405 on /api/generate
- 원인: 프론트가 다른 호스트로 호출하거나 경로가 잘못됨
- 조치: Vercel 단일 앱이면 상대경로 사용. Self‑Hosted는 Caddy의 `/api/*` 프록시 확인.

## QuotaExceededError(localStorage 용량 초과)
- 원인: Base64 이미지 과다 저장
- 조치: 이미 다운스케일 적용(1024px, q=0.85). 그래도 초과 시 일부 슬롯 정리 또는 브라우저 저장소 비우기.

## getUserMedia 오류
- 원인: 비보안(HTTP) 또는 권한 거부, 호환성 부족
- 조치: HTTPS/localhost에서 접속, 권한 허용, 또는 업로드 사용

## 프린트가 2페이지로 나옴
- 조치: `@media print`에서 스트립 폭/여백 조정, `page-break-inside: avoid` 유지. 브라우저 인쇄 옵션에서 축소/여백 확인.

## 포트 사용 중(EADDRINUSE)
- 로컬 개발에서 `kill-port`로 선점 포트 종료 후 실행하거나, 동시에 여러 dev 서버를 켜지 않도록 주의.
