import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { I18nProvider } from '@/core/providers/I18nProvider'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { MainLayout } from '@/shared/components/layouts/MainLayout'
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'
import '@/styles/global.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Dark Links',
  description: 'Links do artista Dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={inter.variable}>
        <I18nProvider>
          <ThemeProvider>
            <AnalyticsInitializer />
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

