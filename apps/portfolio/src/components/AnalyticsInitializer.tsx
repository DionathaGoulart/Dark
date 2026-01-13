'use client'


import Script from 'next/script'
import { useAnalytics } from '@/features/analytics/hooks'
import { validateAnalyticsConfig } from '@/features/analytics/config'


interface AnalyticsInitializerProps {
  gaMeasurementId?: string
}

export function AnalyticsInitializer({ gaMeasurementId }: AnalyticsInitializerProps) {
  useAnalytics()

  if (!gaMeasurementId || !validateAnalyticsConfig(gaMeasurementId)) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

