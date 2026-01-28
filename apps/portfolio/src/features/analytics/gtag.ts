import { ANALYTICS_CONFIG } from './config'
import type { PageViewEvent, CustomEvent, UserPreferences } from './types'

// ================================
// DECLARAÇÕES GLOBAIS
// ================================

/**
 * Declaração global do gtag para Google Analytics
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void
  }
}

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Verifica se o Google Analytics está pronto e disponível
 * @returns {boolean} True se gtag estiver disponível e analytics estiver habilitado
 */
const isAnalyticsReady = (): boolean => {
  return ANALYTICS_CONFIG.enabled && typeof window.gtag !== 'undefined'
}

/**
 * Cria e anexa um elemento script ao head do documento
 * @param {string} src - URL de origem do script (opcional)
 * @param {string} content - Conteúdo inline do script (opcional)
 */
const createScript = (src?: string, content?: string): void => {
  const script = document.createElement('script')

  if (src) {
    script.async = true
    script.src = src
  }

  if (content) {
    script.innerHTML = content
  }

  document.head.appendChild(script)
}

// ================================
// FUNÇÕES PRINCIPAIS
// ================================

/**
 * Inicializa o Google Analytics com configuração GA4
 * Configura os scripts de rastreamento e configuração básica
 * @param {string | undefined} gaMeasurementId - ID de medição do GA4 (vem do banco de dados via admin)
 */
export const initializeAnalytics = (gaMeasurementId?: string): void => {
  // O measurementId deve vir sempre via prop (configurado no admin)
  if (!ANALYTICS_CONFIG.enabled || !gaMeasurementId) return

  // Adiciona script de rastreamento GA4
  createScript(
    `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
  )

  // Adiciona script de configuração
  const configScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaMeasurementId}', {
      page_title: document.title,
      page_location: window.location.href,
      anonymize_ip: true
    });
  `
  createScript(undefined, configScript)
}

/**
 * Rastreia eventos de visualização de página
 * @param {PageViewEvent} data - Dados do evento de visualização de página
 */
export const trackPageView = (data: PageViewEvent): void => {
  if (!isAnalyticsReady()) return

  window.gtag('event', 'page_view', {
    page_title: data.page_title,
    page_location: data.page_location
  })
}

/**
 * Rastreia eventos customizados
 * @param {CustomEvent} data - Dados do evento customizado com nome e parâmetros
 */
export const trackEvent = (data: CustomEvent): void => {
  if (!isAnalyticsReady()) return

  window.gtag('event', data.event_name, data.event_parameters)
}

/**
 * Rastreia mudanças nas preferências do usuário
 * @param {UserPreferences} preferences - Dados das preferências do usuário
 */
export const trackUserPreferences = (preferences: UserPreferences): void => {
  if (!ANALYTICS_CONFIG.enabled) return

  trackEvent({
    event_name: 'user_preferences',
    event_parameters: {
      theme: preferences.theme,
      language: preferences.language,
      location: preferences.location || 'unknown'
    }
  })
}

/**
 * Rastreia eventos de mudança de tema
 * @param {'light' | 'dark'} theme - Tema selecionado
 */
export const trackThemeChange = (theme: 'light' | 'dark'): void => {
  trackEvent({
    event_name: 'theme_change',
    event_parameters: {
      theme
    }
  })
}

/**
 * Rastreia eventos de mudança de idioma
 * @param {'pt' | 'en'} language - Idioma selecionado
 */
export const trackLanguageChange = (language: 'pt' | 'en'): void => {
  trackEvent({
    event_name: 'language_change',
    event_parameters: {
      language
    }
  })
}
