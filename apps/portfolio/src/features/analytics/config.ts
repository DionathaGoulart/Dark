import { AnalyticsConfig } from './types'

// ================================
// CONFIGURAÇÃO
// ================================

/**
 * Configuração do Google Analytics
 * O measurementId é configurado via admin e vem do banco de dados
 */
export const ANALYTICS_CONFIG: AnalyticsConfig = {
  measurementId: undefined, // Será definido dinamicamente via props
  enabled: process.env.NODE_ENV === 'production'
}

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Valida se o ID de medição do Google Analytics está configurado corretamente
 * @param {string | undefined} measurementId - ID de medição do GA4
 * @returns {boolean} True se o ID for válido
 */
export const validateAnalyticsConfig = (measurementId?: string): boolean => {
  if (!measurementId) {
    return false
  }

  // Valida formato do GA4 (deve começar com "G-")
  if (!measurementId.startsWith('G-')) {
    console.warn('Analytics: ID de medição deve começar com "G-"')
    return false
  }

  // Valida se não é um placeholder
  if (measurementId === 'G-XXXXXXXXXX') {
    console.warn('Analytics: Usando ID de placeholder - substitua pelo ID real')
    return false
  }

  return true
}
