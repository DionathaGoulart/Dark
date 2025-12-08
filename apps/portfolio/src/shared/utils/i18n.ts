// ================================
// Importações Internas
// ================================
import { Language } from '@/types'

// ================================
// Configuração de Idioma
// ================================

/** Array de códigos de idiomas suportados */
export const SUPPORTED_LANGUAGES: Language[] = ['pt', 'en']

/** Mapeamento de códigos de idioma para nomes de exibição */
export const LANGUAGE_NAMES = {
  pt: 'Português',
  en: 'English'
} as const

// ================================
// Utilitários de Detecção de Idioma
// ================================

/**
 * Detecta o idioma a partir do pathname da URL
 * Verifica se o primeiro segmento do caminho corresponde a um idioma suportado
 * @param pathname - O pathname da URL para analisar
 * @returns Código do idioma se encontrado, null caso contrário
 */
export const detectLanguageFromPath = (pathname: string): Language | null => {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language
  }

  return null
}

/**
 * Detecta o idioma preferido do usuário a partir das configurações do navegador
 * Retorna ao inglês se o idioma do navegador não for suportado
 * @returns Código de idioma suportado baseado na preferência do navegador
 */
export const getBrowserLanguage = (): Language => {
  // Trata renderização do lado do servidor
  if (typeof navigator === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()

  // Português (brasileiro ou português geral)
  if (browserLang.startsWith('pt')) {
    return 'pt'
  }

  // Padrão para inglês para idiomas não suportados
  return 'en'
}

// ================================
// Utilitários de Exibição de Idioma
// ================================

/**
 * Formata o código de idioma para exibição na interface
 * Retorna o nome localizado do idioma ou código em maiúsculas como fallback
 * @param language - Código do idioma para formatar
 * @returns Nome formatado para exibição do idioma
 */
export const formatLanguageDisplay = (language: Language): string => {
  return LANGUAGE_NAMES[language] || language.toUpperCase()
}
