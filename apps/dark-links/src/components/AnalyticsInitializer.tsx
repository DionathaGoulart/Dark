'use client'

import { useEffect } from 'react'
import { initializeAnalytics } from '@/features/analytics'

export function AnalyticsInitializer() {
  useEffect(() => {
    initializeAnalytics()
  }, [])

  return null
}

