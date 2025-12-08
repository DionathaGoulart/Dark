import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Site 3',
  description: 'Site 3 - Base preset',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}

