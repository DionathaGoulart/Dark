import { validateAnalyticsEnv } from '@/shared/utils/envValidation'
import { AnalyticsConfig } from './types'

// ================================
// CONFIGURAÇÃO
// ================================

/**
 * Configuração do Google Analytics usando variáveis de ambiente
 * Garante que nenhuma informação sensível seja exposta no código
 */
export const ANALYTICS_CONFIG: AnalyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  enabled: process.env.NODE_ENV === 'production' && validateAnalyticsEnv()
}

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Valida se as variáveis de ambiente necessárias estão definidas
 * @returns {boolean} True se o ambiente de analytics estiver configurado corretamente
 */
export const validateAnalyticsConfig = (): boolean => {
  return validateAnalyticsEnv()
}
