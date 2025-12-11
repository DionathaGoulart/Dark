'use client'

import { useEffect } from 'react'
import { initializeAnalytics } from '@/features/analytics'

interface AnalyticsInitializerProps {
  gaMeasurementId?: string
}

export function AnalyticsInitializer({ gaMeasurementId }: AnalyticsInitializerProps) {
  useEffect(() => {
    if (gaMeasurementId) {
      initializeAnalytics(gaMeasurementId)
    }
  }, [gaMeasurementId])

  return null
}

