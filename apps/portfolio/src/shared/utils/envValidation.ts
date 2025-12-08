// ================================
// TIPOS E INTERFACES
// ================================

/**
 * Configuração de validação das variáveis de ambiente
 * Define as variáveis de ambiente obrigatórias e opcionais
 */
interface EnvConfig {
  /** Lista de variáveis de ambiente obrigatórias */
  required: string[]
  /** Lista de variáveis de ambiente opcionais */
  optional: string[]
}

/**
 * Estrutura do resultado da validação
 */
interface ValidationResult {
  /** Lista de erros de validação */
  errors: string[]
  /** Lista de avisos de validação */
  warnings: string[]
}

// ================================
// CONFIGURAÇÃO
// ================================

/**
 * Configuração completa das variáveis de ambiente do projeto
 * Centraliza todos os requisitos de variáveis de ambiente
 */
const ENV_CONFIG: EnvConfig = {
  required: [
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY'
  ],
  optional: ['NEXT_PUBLIC_GA_MEASUREMENT_ID']
}

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Valida se uma variável de ambiente está definida e não está vazia
 * @param {string | undefined} value - Valor da variável de ambiente
 * @returns {boolean} Verdadeiro se a variável for válida
 */
const isValidEnvVar = (value: string | undefined): boolean => {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Valida variáveis de ambiente e coleta erros/avisos
 * @param {string[]} variables - Array de nomes de variáveis para validar
 * @param {boolean} isRequired - Se as variáveis são obrigatórias ou opcionais
 * @returns {string[]} Array de mensagens de validação
 */
const validateVariables = (
  variables: string[],
  isRequired: boolean
): string[] => {
  const messages: string[] = []
  const icon = isRequired ? '❌' : '⚠️'
  const suffix = isRequired
    ? 'é obrigatório mas não foi encontrado'
    : 'não foi encontrado (opcional)'

  variables.forEach((envVar) => {
    if (!isValidEnvVar(process.env[envVar])) {
      messages.push(`${icon} ${envVar} ${suffix}`)
    }
  })

  return messages
}

/**
 * Registra os resultados da validação no console
 * @param {ValidationResult} result - Erros e avisos de validação
 */
const logValidationResults = ({ errors, warnings }: ValidationResult): void => {
  if (errors.length > 0) {
    console.error('🚨 Variáveis de ambiente obrigatórias ausentes:')
    errors.forEach((error) => console.error(error))
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Variáveis de ambiente opcionais ausentes:')
    warnings.forEach((warning) => console.warn(warning))
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.info('✅ Todas as variáveis de ambiente estão configuradas')
  }
}

/**
 * Valida o formato do ID de medição do Google Analytics
 * @param {string} measurementId - ID de medição do GA4
 * @returns {boolean} Verdadeiro se o formato for válido
 */
const isValidGAFormat = (measurementId: string): boolean => {
  if (!measurementId.startsWith('G-')) {
    console.error('Analytics: VITE_GA_MEASUREMENT_ID deve começar com "G-"')
    return false
  }

  if (measurementId === 'G-XXXXXXXXXX') {
    console.warn('Analytics: Usando ID de placeholder - substitua pelo ID real')
    return false
  }

  return true
}

// ================================
// FUNÇÕES PRINCIPAIS
// ================================

/**
 * Valida todas as variáveis de ambiente necessárias
 * Mostra avisos para variáveis ausentes mas não quebra a aplicação
 */
export const validateEnvironment = (): void => {
  const errors = validateVariables(ENV_CONFIG.required, true)
  const warnings = validateVariables(ENV_CONFIG.optional, false)

  logValidationResults({ errors, warnings })
}

/**
 * Função específica para validar a configuração do Analytics
 * @returns {boolean} Verdadeiro se o ambiente do analytics estiver configurado corretamente
 */
export const validateAnalyticsEnv = (): boolean => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!isValidEnvVar(measurementId) || !measurementId) {
    console.info(
      'Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID não configurado - Analytics desabilitado'
    )
    return false
  }

  return isValidGAFormat(measurementId)
}
