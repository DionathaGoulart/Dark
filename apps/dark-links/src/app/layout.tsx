import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { unstable_noStore as noStore } from 'next/cache'
import { I18nProvider } from '@/core/providers/I18nProvider'
import { ThemeProvider } from '@/core/providers/ThemeProvider'
import { MainLayout } from '@/shared/components/layouts/MainLayout'
import { AnalyticsInitializer } from '@/components/AnalyticsInitializer'
import { getSeoData, getSettings } from '@/lib/api/server'
import '@/styles/global.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export async function generateMetadata(): Promise<Metadata> {
  noStore()
  const seoData = await getSeoData('pt')
  
  const title = seoData?.title_pt || 'Dark Links'
  const description = seoData?.description_pt || 'Links do artista Dark'
  const keywords = seoData?.keywords_pt || 'dark, artista, links'
  const canonicalUrl = seoData?.canonical_url_pt
  const ogImage = seoData?.og_image_url
  const ogType = seoData?.og_type || 'website'
  const ogSiteName = seoData?.og_site_name || 'Dark Links'
  const twitterCard = seoData?.twitter_card_type || 'summary_large_image'
  const twitterSite = seoData?.twitter_site
  const twitterCreator = seoData?.twitter_creator
  const robots = seoData?.robots_txt || 'index, follow'

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
    }
  }

  return metadata
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()
  const seoData = await getSeoData('pt')
  const settings = await getSettings()
  const gaMeasurementId = seoData?.ga_measurement_id || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {settings?.site_icon_url && (
          <link rel="icon" href={settings.site_icon_url} />
        )}
      </head>
      <body className={inter.variable}>
        <I18nProvider>
          <ThemeProvider>
            <AnalyticsInitializer gaMeasurementId={gaMeasurementId} />
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

