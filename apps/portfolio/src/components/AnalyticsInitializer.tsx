'use client'

import { useEffect } from 'react'
import { initializeAnalytics } from '@/features/analytics'
import { useAnalytics } from '@/features/analytics/hooks'

interface AnalyticsInitializerProps {
  gaMeasurementId?: string
}

export function AnalyticsInitializer({ gaMeasurementId }: AnalyticsInitializerProps) {
  useEffect(() => {
    if (gaMeasurementId) {
      initializeAnalytics(gaMeasurementId)
    } else {
      initializeAnalytics()
    }
  }, [gaMeasurementId])

  useAnalytics()

  return null
}

