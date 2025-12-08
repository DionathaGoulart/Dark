import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { I18nProvider } from '@/core/providers/I18nProvider'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { MainLayout } from '@/shared/components/layouts/MainLayout'
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'
import { validateEnvironment } from '@/shared/utils/envValidation'
import '@/styles/global.css'

// Valida variáveis de ambiente no servidor
if (typeof window === 'undefined') {
  validateEnvironment()
}

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Dark - Portfolio',
  description: 'Portfolio de arte digital e design',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon-32x32.png',
  },
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

