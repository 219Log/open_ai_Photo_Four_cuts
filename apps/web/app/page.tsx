import Link from 'next/link'

export default function Page() {
  return (
    <main style={{ display: 'grid', gap: 16, padding: 16 }}>
      <h1 style={{ margin: 0 }}>AI 네컷 스튜디오</h1>
      <p style={{ color: '#556', marginTop: 4 }}>원하는 기능을 선택하세요</p>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
          alignItems: 'stretch',
        }}
      >
        <Link
          href="/camera"
          style={{
            display: 'grid',
            placeItems: 'center',
            background: '#111827',
            color: 'white',
            borderRadius: 16,
            aspectRatio: '1 / 1',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>카메라</div>
          </div>
        </Link>

        <Link
          href="/print"
          style={{
            display: 'grid',
            placeItems: 'center',
            background: '#111827',
            color: 'white',
            borderRadius: 16,
            aspectRatio: '1 / 1',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>🖨️</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>프린트</div>
          </div>
        </Link>
      </div>
    </main>
  )
}
