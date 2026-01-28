import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { I18nProvider } from '@/core/providers/I18nProvider'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { MainLayout } from '@/shared/components/layouts/MainLayout'
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'
import { DataPrefetcher, RoutePrefetcher } from '@/lib/prefetch'
import { GlobalLoader } from '@/components/ui/GlobalLoader'
import { PreloadProvider } from '@/providers/GlobalPreloadProvider'
import { validateEnvironment } from '@/shared/utils/envValidation'
import { getPortfolioSeoData, getPortfolioSettings, getNavigationItems } from '@/lib/api/server'
import '@/styles/global.css'
import { Language } from '@/types'

// Valida variáveis de ambiente no servidor
if (typeof window === 'undefined') {
  validateEnvironment()
}

// Cache do layout por 60 segundos
export const revalidate = 60

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

async function getLanguageFromHeaders(): Promise<Language> {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')

  if (acceptLanguage?.toLowerCase().includes('pt')) {
    return 'pt'
  }

  return 'en'
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguageFromHeaders()
  // Sempre busca dados em 'pt' para ter base, mas podemos ajustar getPortfolioSeoData para aceitar 'en' se necessário.
  // O getPortfolioSeoData já tem suporte a locale, vamos usar.
  const seoData = await getPortfolioSeoData(lang)
  const settingsData = await getPortfolioSettings()

  const title = (lang === 'pt' ? seoData?.title_pt : seoData?.title_en) || seoData?.title_pt || 'Dark - Portfolio'
  const description = (lang === 'pt' ? seoData?.description_pt : seoData?.description_en) || seoData?.description_pt || 'Digital Art & Design Portfolio'
  const keywordsStr = (lang === 'pt' ? seoData?.keywords_pt : seoData?.keywords_en) || seoData?.keywords_pt || 'dark, portfolio, digital art, design'
  const keywords = keywordsStr.split(',').map(k => k.trim())

  const canonicalUrl = (lang === 'pt' ? seoData?.canonical_url_pt : seoData?.canonical_url_en) || seoData?.canonical_url_pt

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
    keywords,
    robots,
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl
      }
    }),
    openGraph: {
      title,
      description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    verification: {
      google: '9hf7cUmB50oxkbfJaaOBC6ciXx7HLHscwiKkFqWX4kw',
    },
  }

  return metadata
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await getLanguageFromHeaders()

  // Passamos o idioma detectado para as queries
  const seoData = await getPortfolioSeoData(lang)
  const settingsData = await getPortfolioSettings()
  const navigationItems = await getNavigationItems()
  const gaMeasurementId = seoData?.ga_measurement_id

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.variable}>
        <I18nProvider initialLanguage={lang}>
          <ThemeProvider>
            <PreloadProvider>
              <AnalyticsInitializer />
              {/* Google Analytics Injection */}
              {gaMeasurementId && (
                <>
                  <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                    strategy="afterInteractive"
                  />
                  <Script id="google-analytics" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());

                      gtag('config', '${gaMeasurementId}');
                    `}
                  </Script>
                </>
              )}
              <GlobalLoader loadingImage={settingsData?.loading_image_url} />
              <DataPrefetcher />
              <RoutePrefetcher />
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
            </PreloadProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

