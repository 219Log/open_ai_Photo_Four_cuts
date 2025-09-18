"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

type SlotId = 1 | 2 | 3 | 4

export default function PrintPage() {
  const [converted, setConverted] = useState<Record<SlotId, string | null>>({ 1: null, 2: null, 3: null, 4: null })

  useEffect(() => {
    // Try session payload first (set right before navigation)
    try {
      const sess = typeof window !== 'undefined' ? sessionStorage.getItem('printPayload') : null
      if (sess) {
        const p = JSON.parse(sess)
        const finalRec: Record<SlotId, string | null> = { 1: p?.[1] ?? p?.['1'] ?? null, 2: p?.[2] ?? p?.['2'] ?? null, 3: p?.[3] ?? p?.['3'] ?? null, 4: p?.[4] ?? p?.['4'] ?? null }
        setConverted(finalRec)
        return
      }
    } catch {}

    // Fallback to localStorage convertedSlots
    try {
      const rawConv = localStorage.getItem('convertedSlots')
      const conv = rawConv ? JSON.parse(rawConv) : {}
      const finalRec: Record<SlotId, string | null> = { 1: null, 2: null, 3: null, 4: null }
      ;([1,2,3,4] as SlotId[]).forEach((i) => {
        finalRec[i] = (conv?.[i as any] || conv?.[String(i)] || null) as string | null
      })
      setConverted(finalRec)
    } catch {}
  }, [])

  function handlePrint() {
    window.print()
  }

  return (
    <main style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2 className="no-print">프린트</h2>

      <div className="print-container" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="strip" style={{ width: 300, background: '#fff', padding: 8, display: 'grid', gap: 8 }}>
          {[1,2,3,4].map((i) => (
            <div key={i} className="slot" style={{ width: '100%', aspectRatio: '3/4', background: '#f2f2f2', display: 'grid', placeItems: 'center' }}>
              {converted[i as SlotId] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={converted[i as SlotId] as string} alt={`print-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#aaa' }}>대기</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 앱 아이콘 카드 (프린트, 다시하기, 홈) */}
      <div
        className="no-print"
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
          alignItems: 'stretch',
        }}
      >
        <div
          onClick={handlePrint}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePrint() }}
          style={{
            display: 'grid', placeItems: 'center', background: '#111827', color: 'white',
            borderRadius: 16, aspectRatio: '1 / 1', cursor: 'pointer', userSelect: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>🖨️</div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              프린트/PDF<br />
              변환
            </div>
          </div>
        </div>

        <Link
          href="/camera"
          style={{
            display: 'grid', placeItems: 'center', background: '#111827', color: 'white',
            borderRadius: 16, aspectRatio: '1 / 1', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>🔄</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>다시하기</div>
          </div>
        </Link>

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
      </div>
    </main>
  )
}
