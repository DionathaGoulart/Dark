// ================================
// TIPOS E INTERFACES DE ANALYTICS
// ================================

/**
 * Interface de configuração do Google Analytics
 * Define a estrutura para configuração e controle de analytics
 */
export interface AnalyticsConfig {
  /** ID de medição do Google Analytics (GA4) */
  measurementId: string | undefined
  /** Se o rastreamento de analytics está habilitado */
  enabled: boolean
}

/**
 * Estrutura de dados do evento de visualização de página
 * Usado para rastrear navegação e visitas de página
 */
export interface PageViewEvent {
  /** Título da página atual */
  page_title: string
  /** URL completa da página atual */
  page_location: string
}

/**
 * Estrutura de dados do evento customizado
 * Interface flexível para rastrear interações e comportamentos do usuário
 */
export interface CustomEvent {
  /** Nome do evento customizado */
  event_name: string
  /** Parâmetros adicionais para o evento (opcional) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event_parameters?: Record<string, any>
}

/**
 * Estrutura de dados das preferências do usuário
 * Rastreia configurações do usuário e escolhas de personalização
 */
export interface UserPreferences {
  /** Preferência de tema selecionada */
  theme: 'light' | 'dark'
  /** Preferência de idioma selecionada */
  language: 'pt' | 'en'
  /** Localização do usuário (opcional) */
  location?: string
}
