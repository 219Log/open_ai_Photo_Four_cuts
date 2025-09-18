# 클라이언트 저장소(localStorage / sessionStorage)

## 개요
- 서버 저장 없이 브라우저 저장소를 사용해 4컷과 상태를 유지합니다.

## 키와 역할
- `localStorage.slots`: 원본 이미지 4컷(1~4) — Base64 JPEG
- `localStorage.convertedSlots`: 변환 이미지 4컷(1~4) — Base64 JPEG/PNG
- `localStorage.prompt`: 마지막 프롬프트 문자열
- `sessionStorage.printPayload`: 프린트 페이지로 이동 직전, 변환 4컷의 스냅샷(최신)

## 저장 포맷/용량
- Base64 Data URL. 저장 전 `downscaleDataUrl(maxDim=1024, quality=0.85)`로 압축하여 용량을 절감합니다.
- 용량 초과 시 `safeSetItem()`이 오류를 잡아 앱 크래시를 방지합니다.

## 로딩 우선순위(`/print`)
1) `sessionStorage.printPayload`
2) `localStorage.convertedSlots` (폴백)

## 보안/주의
- 로컬 저장소는 사용자 브라우저에 남습니다. 공용 기기에서는 브라우저 데이터 삭제를 권장합니다.
- 민감 정보(키/토큰)는 절대 저장하지 않습니다.
