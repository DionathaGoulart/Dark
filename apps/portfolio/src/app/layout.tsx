import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { unstable_noStore as noStore } from 'next/cache'
import { I18nProvider } from '@/core/providers/I18nProvider'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { MainLayout } from '@/shared/components/layouts/MainLayout'
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'
import { validateEnvironment } from '@/shared/utils/envValidation'
import { getPortfolioSeoData, getPortfolioSettings, getNavigationItems } from '@/lib/api/server'
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

export async function generateMetadata(): Promise<Metadata> {
  noStore()
  const seoData = await getPortfolioSeoData('pt')
  const settingsData = await getPortfolioSettings()

  const title = seoData?.title_pt || 'Dark - Portfolio'
  const description = seoData?.description_pt || 'Portfolio de arte digital e design'
  const keywords = seoData?.keywords_pt || 'dark, portfolio, arte digital, design'
  const canonicalUrl = seoData?.canonical_url_pt
  const ogImage = seoData?.og_image_url
  const ogType = seoData?.og_type || 'website'
  const ogSiteName = seoData?.og_site_name || 'Dark - Portfolio'
  const twitterCard = seoData?.twitter_card_type || 'summary_large_image'
  const twitterSite = seoData?.twitter_site
  const twitterCreator = seoData?.twitter_creator
  const robots = seoData?.robots_txt || 'index, follow'
  const favicon = settingsData?.site_icon_url || '/favicon-32x32.png'

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    robots,
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl
      }
    }),
    openGraph: {
      title,
      description,
      type: ogType as any,
      siteName: ogSiteName,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      })
    },
    twitter: {
      card: twitterCard as any,
      title,
      description,
      ...(twitterSite && { site: twitterSite }),
      ...(twitterCreator && { creator: twitterCreator }),
      ...(ogImage && {
        images: [ogImage]
      })
    },
    icons: {
      icon: favicon,
      apple: favicon,
    },
  }

  return metadata
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()
  const seoData = await getPortfolioSeoData('pt')
  const settingsData = await getPortfolioSettings()
  const navigationItems = await getNavigationItems()
  const gaMeasurementId = seoData?.ga_measurement_id

  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={inter.variable}>
        <I18nProvider>
          <ThemeProvider>
            <AnalyticsInitializer gaMeasurementId={gaMeasurementId} />
            <MainLayout
              logoSrc={settingsData?.logo_url}
              instagramUrl={settingsData?.instagram_url}
              youtubeUrl={settingsData?.youtube_url}
              footerText={
                settingsData?.footer_text_pt || settingsData?.footer_text_en
                  ? {
                      pt: settingsData?.footer_text_pt || settingsData?.footer_text || '',
                      en: settingsData?.footer_text_en || settingsData?.footer_text || ''
                    }
                  : undefined
              }
              navigationItems={navigationItems}
            >
              {children}
            </MainLayout>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

