# AI 연동 가이드 (Gemini / 나노바나나)

## 개요
- 기본 모델: `GEMINI_MODEL_ID=gemini-2.5-flash-image`
- 공급자 전환 가능: `AI_PROVIDER=google|nanobanana`

## 환경 변수
- `GEMINI_API_KEY`: Google AI Studio/Gemini API 키
- `GEMINI_MODEL_ID`: 기본 `gemini-2.5-flash-image`


## 호출 방식 (개념)
1) 프론트에서 슬롯별 원본 이미지와 프롬프트를 백엔드 `/api/generate`로 전송
2) 백엔드가 공급자에 맞게 어댑트하여 호출
3) 결과 이미지를 Base64 data URL로 프론트에 반환

## 프롬프트 프리셋 예시
- 만화주인공:
  - "Convert the portrait into an animated manga main character. Big expressive eyes, clean line art, vibrant cel-shaded colors. Preserve identity and lighting."
- 사이버:
  - "Transform into a neon cyberpunk portrait. Holographic accents, neon rim light, city night ambiance, high-tech textures. Keep facial identity."
- 픽셀:
  - "Render as retro 32x32 pixel-art portrait. Crisp pixel edges, limited palette, arcade vibe. Maintain key facial features."
- 초상화:
  - "Enhance into a studio-grade realistic portrait. Soft key light, shallow depth of field, fine skin texture, natural color grading."

## 품질 옵션 제안
- `strength`(0~1): 스타일 적용 강도
- `seed`: 재현성 있는 결과를 위한 시드
- `stylePreset`: "cartoon|cyber|pixel|portrait" 등

## 안전/정책
- 인물 이미지 처리 시 개인정보/저작권 고려
- 금칙어/부적절 컨텐츠 필터링

## 성능/비용 팁
- 요청 당 이미지 수를 4장 이하로 제한
- 이미지 해상도를 과도하게 키우지 않기(예: 1024px 내)
- 동일 프롬프트/옵션은 캐싱 고려
