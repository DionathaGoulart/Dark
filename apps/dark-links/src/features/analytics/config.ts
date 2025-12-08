// ================================
// Analytics Configuration
// ================================

export interface AnalyticsConfig {
  measurementId: string | undefined
  enabled: boolean
}

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
}

