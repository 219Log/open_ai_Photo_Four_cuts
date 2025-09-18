"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type SlotId = 1 | 2 | 3 | 4

const PRESETS = [
  { key: 'manga', label: '만화', prompt: 'Convert the portrait into an animated manga main character. Big expressive eyes, clean line art, vibrant cel-shaded colors. Preserve identity and lighting.' },
  { key: 'harajuku_pop', label: '일본식', prompt: "Makes captured images look like Japanese sticker photos. Preserves the original mood and lighting. Maximizes the unique feel of Japanese sticker photos. Sets the correction level to maximum. (Eye size is adjusted within approximately 0% to 20%.)"},
  { key: 'photoreal_ulzzang', label: '실사 미인', prompt: "Transform the image into a hyper-realistic, high-fashion magazine style portrait of a Korean 'ulzzang' or influencer. The primary goal is photorealism combined with idealized beauty. The facial features should be perfected as if through subtle, expert-level cosmetic surgery and professional photo retouching—a delicate v-line jaw, high nose bridge, and full lips. The skin must be rendered to be absolutely flawless and smooth with a velvety, semi-matte texture, but it MUST retain a believable, photorealistic quality with natural highlights and shadows, avoiding any flat, painted, or overly airbrushed appearance. Place the subject in a mundane but chic, realistic setting like a sunlit café, a minimalist modern interior, or a clean studio. The lighting must be natural and believable, simulating soft daylight from a window or professional studio strobes. Crucially, there should be NO glowing halos, fantasy elements, artificial vignettes, or special effect auras around the subject. The final image should look like a real, professionally shot photograph of an impossibly beautiful person."},
  {
    key: 'context_aware_bg',
    label: 'AI 추천 배경',
    prompt: `This is an advanced background replacement task. Your primary goal is to intelligently generate a new, contextually appropriate background based on a deep analysis of the foreground subject(s).
  
  First, the unbreakable rule: The foreground subject(s)—including every detail of their pose, expression, hair, clothing, and accessories—must remain ABSOLUTELY UNCHANGED and identical to the original image.
  
  Second, the creative task: Instead of being given a location, you must first ANALYZE the subject(s):
  - Their expressions and overall mood (e.g., joyful, serious, romantic, energetic).
  - Their poses and actions (e.g., formally posing, dancing, candidly laughing, walking).
  - Their clothing and style (e.g., formal wear, casual street style, beachwear, business attire).
  
  Third, the generation task: Based on your analysis, create a new, hyper-realistic background that logically and aesthetically complements the subjects. The background should feel like the natural, original setting for their observed state and activity. It should enhance the story the subjects are telling.
  
  Finally, the integration task: The final composite must be FLAWLESS.
  - The lighting on the subjects must be perfectly adapted to match the lighting of your newly generated background.
  - Cast realistic, soft shadows from the subjects onto the new environment.
  - The boundary between subjects and background must be completely seamless and natural, with no 'cutout' appearance.
  
  The final image must look like a single, plausible, and cohesive photograph.`
  }
]

interface SlotImage { slot: SlotId; dataUrl: string | null }

// Resize a dataURL to max dimension, output as JPEG
async function downscaleDataUrl(dataUrl: string, maxDim = 1024, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxDim && height <= maxDim) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        return resolve(canvas.toDataURL('image/jpeg', quality))
      }
      const scale = Math.min(maxDim / width, maxDim / height)
      const w = Math.round(width * scale)
      const h = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function safeSetItem(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch (e) { console.warn('localStorage quota exceeded for', key) }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [facingMode, setFacingMode] = useState<MediaTrackConstraints['facingMode']>('environment')
  const [activeSlot, setActiveSlot] = useState<SlotId>(1)
  const [slots, setSlots] = useState<Record<SlotId, string | null>>({ 1: null, 2: null, 3: null, 4: null })
  const [converted, setConverted] = useState<Record<SlotId, string | null>>({ 1: null, 2: null, 3: null, 4: null })
  const [prompt, setPrompt] = useState('')
  const [loadingSlots, setLoadingSlots] = useState<Record<SlotId, boolean>>({ 1: false, 2: false, 3: false, 4: false })
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    const rawSlots = typeof window !== 'undefined' ? localStorage.getItem('slots') : null
    const rawConverted = typeof window !== 'undefined' ? localStorage.getItem('convertedSlots') : null
    const rawPrompt = typeof window !== 'undefined' ? localStorage.getItem('prompt') : null
    if (rawSlots) setSlots(JSON.parse(rawSlots))
    if (rawConverted) setConverted(JSON.parse(rawConverted))
    if (rawPrompt) setPrompt(rawPrompt)
  }, [])

  useEffect(() => { safeSetItem('slots', JSON.stringify(slots)) }, [slots])
  useEffect(() => { safeSetItem('convertedSlots', JSON.stringify(converted)) }, [converted])
  useEffect(() => { safeSetItem('prompt', prompt) }, [prompt])

  function canUseCamera(): boolean {
    if (typeof window === 'undefined') return false
    const secure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    const supported = !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia
    if (!secure) {
      setCameraError('카메라는 HTTPS 또는 localhost에서만 동작합니다. 9443 포트의 HTTPS로 접속해 주세요.')
      return false
    }
    if (!supported) {
      setCameraError('브라우저가 카메라를 지원하지 않습니다. 파일 업로드를 사용해 주세요.')
      return false
    }
    setCameraError(null)
    return true
  }

  async function openStream() {
    try {
      if (!canUseCamera()) return
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await new Promise<void>((resolve) => {
          const onLoaded = () => { video.removeEventListener('loadedmetadata', onLoaded); resolve() }
          video.addEventListener('loadedmetadata', onLoaded)
        })
        await video.play()
      }
    } catch (e) {
      console.error('camera error', e)
      setCameraError('카메라 권한을 허용해 주세요. 허용 후 페이지를 새로고침하세요.')
    }
  }

  useEffect(() => {
    openStream()
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null
      stream?.getTracks().forEach(t => t.stop())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  function captureToDataUrlRaw(): string | null {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return null
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  async function onShoot() {
    const raw = captureToDataUrlRaw()
    if (!raw) return
    const dataUrl = await downscaleDataUrl(raw, 1024, 0.85)
    setSlots(prev => ({ ...prev, [activeSlot]: dataUrl }))
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = await downscaleDataUrl(reader.result as string, 1024, 0.85)
      setSlots(prev => ({ ...prev, [activeSlot]: dataUrl }))
    }
    reader.readAsDataURL(file)
    e.currentTarget.value = ''
  }

  function choosePreset(p: string) { setPrompt(p) }

  async function convertAll() {
    const images: SlotImage[] = (Object.entries(slots) as [string, string | null][]) 
      .filter(([, v]) => !!v)
      .map(([k, v]) => ({ slot: Number(k) as SlotId, dataUrl: v as string }))

    if (images.length === 0) return
    const slotsConverting = images.map(i => i.slot)
    setLoadingSlots(prev => ({ ...prev, ...Object.fromEntries(slotsConverting.map(s => [s, true])) }))

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, images, modelId: 'gemini-2.5-flash-image-preview', options: { concurrency: 2 } })
      })
      if (!res.ok) {
        let msg = ''
        try { msg = await res.text() } catch {}
        console.error('API error', res.status, msg)
        alert(`API 오류(${res.status}): ${msg || '서버에서 오류가 발생했습니다.'}`)
        return
      }
      const json = await res.json() as { results: { slot: SlotId, image: string | null }[] }
      // Start from current state to preserve previously converted slots
      const nextConverted: Record<SlotId, string | null> = { 1: converted[1], 2: converted[2], 3: converted[3], 4: converted[4] }
      // Downscale/Compress each returned image before saving to reduce localStorage usage
      for (const r of json.results) {
        if (!r.image) continue
        try {
          const compressed = await downscaleDataUrl(r.image, 1024, 0.85)
          nextConverted[r.slot] = compressed
        } catch {
          nextConverted[r.slot] = r.image
        }
      }
      setConverted(nextConverted)
      // Persist immediately so /print page finds data right away
      safeSetItem('convertedSlots', JSON.stringify(nextConverted))
    } catch (e) {
      console.error(e)
      alert('AI 변환 중 네트워크 오류가 발생했습니다.')
    } finally {
      const slotsConvertingSet = new Set(slotsConverting)
      setLoadingSlots(prev => ({ ...prev, ...Object.fromEntries(Array.from(slotsConvertingSet).map(s => [s, false])) }))
    }
  }

  // [프린트 이동 전 준비 절차]
  // 1) 현재 메모리의 변환된 4컷을 payload로 구성한다.
  // 2) payload를 sessionStorage.printPayload 에 저장한다(동일 탭 이동 시 즉시 사용).
  // 3) 같은 데이터를 localStorage.convertedSlots 에도 백업 저장한다(새 탭/재방문 대비).
  // 4) 이후 /print 로 이동하면 프린트 페이지가 위 저장소에서 데이터를 읽어 즉시 렌더한다.
  function persistForPrint() {
    try {
      const payload = { 1: converted[1], 2: converted[2], 3: converted[3], 4: converted[4] }
      // Persist to both storages for reliability
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('printPayload', JSON.stringify(payload)) } catch {}
      }
      safeSetItem('convertedSlots', JSON.stringify(payload))
    } catch {}
  }

  return (
    <main style={{ display: 'grid', gap: 12, padding: 12 }}>
      <h2>카메라</h2>

      {/* 상단: 카메라 미리보기(1:1) → 컨트롤(가로) 순서 */}
      <div className="camera-top-grid" style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 6 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>촬영 카메라</div>
          <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#000', borderRadius: 6, overflow: 'hidden' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
          </div>
          {cameraError && (
            <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{cameraError}</div>
          )}
          {/* 컷 선택 버튼 2x2 */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>타겟 컷 선택</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[1,2,3,4].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlot(i as SlotId)}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    border: activeSlot===i? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: activeSlot===i? '#e0efff' : '#fff',
                    fontWeight: 700
                  }}
                >{i}컷</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, textAlign: 'center' }}>컨트롤</div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center', maxWidth: 260, margin: '0 auto' }}>
            <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} style={{ width: 72, height: 72, borderRadius: 12 }}>전/후면</button>
            <button onClick={onShoot} style={{ width: 72, height: 72, borderRadius: 12 }}>촬영</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ width: 72, height: 72, borderRadius: 12 }}>업로드</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      {/* 중앙: 변환전 → 변환후 레이아웃 (화살표 제거) */}
      <div className="camera-compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, alignItems: 'center' }}>
        {/* 변환전 */}
        <div style={{ border: '2px solid #90a4ae', borderRadius: 16, padding: 8 }}>
          <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>변환전</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[1,2,3,4].map((i) => (
              <div key={i}
                   onClick={() => setActiveSlot(i as SlotId)}
                   style={{
                     border: activeSlot===i? '2px solid #1976d2':'1px solid #cfd8dc',
                     borderRadius: 8, padding: 4, cursor: 'pointer'
                   }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>{i}</div>
                <div style={{ aspectRatio: '3/4', background: '#f9f9f9', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {slots[i as SlotId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slots[i as SlotId] as string} alt={`slot-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#888' }}>비어있음</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 변환후 */}
        <div style={{ border: '2px solid #90a4ae', borderRadius: 16, padding: 8 }}>
          <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>변환후</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ border: '1px solid #cfd8dc', borderRadius: 8, padding: 4, position: 'relative' }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>{i}</div>
                <div style={{ aspectRatio: '3/4', background: '#f4f6f8', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {loadingSlots[i as SlotId] && <span style={{ position: 'absolute', top: 6, right: 10, fontSize: 11 }}>처리중...</span>}
                  {converted[i as SlotId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={converted[i as SlotId] as string} alt={`converted-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#aaa' }}>대기</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 프리셋/프롬프트 */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => choosePreset(p.prompt)} style={{ width: '100%', height: 48 }}>{p.label}</button>
          ))}
        </div>
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="프롬프트를 입력하거나 프리셋을 선택" />
      </div>

      {/* 하단: 앱 아이콘 카드 (AI 변환, 홈, 프린트) */}
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
          alignItems: 'stretch',
        }}
      >
        <div
          onClick={convertAll}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') convertAll() }}
          style={{
            display: 'grid', placeItems: 'center', background: '#111827', color: 'white',
            borderRadius: 16, aspectRatio: '1 / 1', cursor: 'pointer', userSelect: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>🎨</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>변환</div>
          </div>
        </div>

        <Link
          href="/"
          style={{
            display: 'grid', placeItems: 'center', background: '#111827', color: 'white',
            borderRadius: 16, aspectRatio: '1 / 1', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>🏠</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>홈</div>
          </div>
        </Link>

        {/* 5) 프린트 페이지로 이동하기 전에 persistForPrint 를 호출해 데이터 보존 */}
        <Link
          href="/print"
          onClick={persistForPrint}
          style={{
            display: 'grid', placeItems: 'center', background: '#111827', color: 'white',
            borderRadius: 16, aspectRatio: '1 / 1', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>🖨️</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>프린트/PDF 변환</div>
          </div>
        </Link>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  )
}
