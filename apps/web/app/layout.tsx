import './globals.css'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
