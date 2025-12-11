// ================================
// Internal Imports
// ================================
import { ANALYTICS_CONFIG } from './config'

// ================================
// Global Types
// ================================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

// ================================
// INITIALIZATION
// ================================
export const initializeAnalytics = (measurementId?: string): void => {
  if (typeof window === 'undefined') return
  
  const id = measurementId || ANALYTICS_CONFIG.measurementId
  const enabled = process.env.NODE_ENV === 'production' && !!id
  
  if (!enabled || !id) return

  // Add GA4 tracking script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script1)

  // Add configuration script
  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}', {
      anonymize_ip: true,
      linker: {
        domains: ['dark.art.br', 'links.dark.art.br']
      }
    });
  `
  document.head.appendChild(script2)
}

// ================================
// LINK TRACKING
// ================================
export const trackLinkClick = (linkTitle: string, url: string): void => {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'undefined') return

  window.gtag('event', 'click', {
    event_category: 'link',
    event_label: linkTitle,
    link_url: url,
    custom_parameter: 'linktree_click'
  })
}

