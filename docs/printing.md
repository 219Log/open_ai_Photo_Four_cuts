# 프린팅 가이드

## 목표
- 변환된 4컷 이미지를 세로 스트립(포토부스 스타일)로 인쇄
- 브라우저 인쇄(`window.print()`)와 `@media print` CSS로 정확한 사이즈 제어

## 레이아웃 권장
- 스트립 비율 예: 2:7 (폭:높이) 또는 4:14 (단순화하면 2:7)
- 실제 인쇄 용지: A4(210×297mm) 또는 포토 프린터 100×150mm(4×6 inch)
- 안전 여백: 상하좌우 각 5mm 이상 권장

## CSS 예시 (A4 한 장에 1 스트립)
```css
/* 화면 전용 */
.strip-preview {
  width: 300px; /* 화면 프리뷰용 */
  background: #fff;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.strip-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
  aspect-ratio: 3/4; /* 개별 컷 비율 예시 */
}

/***************************
 *  Print Styles (A4)
 ***************************/
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm; /* 프린터/여백 상황에 맞게 조정 */
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-container {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  .strip {
    width: 60mm; /* 세로 스트립 폭 */
    background: #ffffff;
    padding: 4mm;
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    gap: 4mm;
    border: 0.5mm solid #000; /* 선택 */
  }

  .strip img {
    width: 100%;
    height: auto;
    object-fit: cover;
    aspect-ratio: 3/4; /* 각 컷 비율 통일 */
  }
}
```

## 인쇄 트리거
```ts
// 인쇄 페이지에서 실행
window.print();
```

## 데이터 전달
- `/camera`에서 `localStorage`에 `convertedSlots: {1: dataUrl, 2: ..., 3: ..., 4: ...}` 저장
- `/print`에서 이를 읽어 `<img src="..." />`로 렌더

## 품질 팁
- PNG로 인쇄 품질 유지(투명 필요 없으면 고품질 JPEG도 가능)
- 과도한 해상도는 스풀링 지연 가능(한 컷 1024~1536px 변환 권장)
- 프린터 여백/확대 축소 옵션은 시스템 인쇄 대화상자에서 "실제 크기"/"여백 없음" 등 확인
