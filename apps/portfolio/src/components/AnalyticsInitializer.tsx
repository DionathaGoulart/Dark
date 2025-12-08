'use client'

import { useEffect } from 'react'
import { initializeAnalytics } from '@/features/analytics'
import { useAnalytics } from '@/features/analytics/hooks'

export function AnalyticsInitializer() {
  useEffect(() => {
    initializeAnalytics()
  }, [])

  useAnalytics()

  return null
}

