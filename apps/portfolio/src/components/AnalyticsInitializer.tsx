'use client'

import { useAnalytics } from '@/features/analytics/hooks'


export function AnalyticsInitializer() {
  useAnalytics()
  return null
}

