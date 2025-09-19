# 백엔드 API 사양 (Express)

> 참고: Vercel 배포에서는 Next.js Route Handler(`/api/generate`)를 사용하는 구성이 기본입니다. 해당 사양은 [Next.js Route Handler(API) 사양](./route-handler.md)을 참고하세요. 이 문서는 Self‑Hosted(Express) 구성을 위한 사양입니다.

## 기본
- 베이스 URL: `/api`
- 인증: (기본 없음) — 필요 시 토큰 기반 인증 추가 가능
- CORS: 프론트 도메인만 허용(권장)
- Rate Limit: IP/세션 기준 제한 권장

## POST /api/generate
- 설명: 프롬프트와 원본 이미지(최대 4)를 전달하여 AI 변환 이미지를 생성
- 요청 헤더:
  - `Content-Type: application/json` 또는 `multipart/form-data` (둘 중 하나 선택 구현)
- 요청 바디(JSON 예시):
```json
{
  "prompt": "네온 사이버펑크 초상화 스타일로 변환",
  "images": [
    { "slot": 1, "dataUrl": "data:image/jpeg;base64,..." },
    { "slot": 2, "dataUrl": "data:image/jpeg;base64,..." }
  ],
  "modelId": "gemini-2.5-flash-image",
  "options": {
    "strength": 0.7,
    "seed": 42,
    "stylePreset": "cyber"
  }
}
```

기본 모델 권장값: `gemini-2.5-flash-image-preview`
- 응답(JSON 예시):
```json
{
  "results": [
    { "slot": 1, "image": "data:image/png;base64,..." },
    { "slot": 2, "image": "data:image/png;base64,..." },
    { "slot": 3, "image": null },
    { "slot": 4, "image": null }
  ],
  "provider": "google-gemini" 
}
```
- 오류 코드:
  - 400: 요청 검증 실패(프롬프트/이미지 없음 등)
  - 429: 과도한 요청
  - 500: 내부 오류 또는 AI 제공자 오류

## 보안/검증
- MIME/크기 제한(예: 이미지 10MB 이하)
- 허용 확장자: jpg, jpeg, png, webp
- data URL 유효성 검증
- 프롬프트 길이 제한/금칙어 필터(선택)

## 내부 설계 제안
- `AIProvider` 어댑터 패턴으로 공급자 교체 용이화
  - `AI_PROVIDER=google|nanobanana`
  - Google(Gemini) 자격증명: `GEMINI_API_KEY`
- 큐잉/동시성 제한으로 백엔드 안정성 확보
