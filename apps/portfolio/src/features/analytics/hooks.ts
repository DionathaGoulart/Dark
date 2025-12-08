'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from './gtag'

// ================================
// TIPOS
// ================================

/**
 * Opções de configuração do hook de analytics
 */
interface UseAnalyticsOptions {
  /** Se deve rastrear visualizações de página automaticamente */
  trackPageViews?: boolean
  /** Substituição customizada do título da página */
  pageTitle?: string
}

// ================================
// HOOKS
// ================================

/**
 * Hook para rastrear automaticamente mudanças de rota e visualizações de página
 * Integra com React Router para monitorar eventos de navegação
 *
 * @param {UseAnalyticsOptions} options - Opções de configuração para rastreamento de analytics
 */
export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const pathname = usePathname()
  const { trackPageViews = true, pageTitle } = options

  useEffect(() => {
    if (!trackPageViews) return

    trackPageView({
      page_title: pageTitle || document.title,
      page_location: window.location.href
    })
  }, [pathname, trackPageViews, pageTitle])
}
