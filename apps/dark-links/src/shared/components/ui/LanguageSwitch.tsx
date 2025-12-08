'use client'

// ================================
// External Imports
// ================================
import React from 'react'
import { Languages } from 'lucide-react'

// ================================
// Internal Imports
// ================================
import { useI18n } from '@/core/providers/I18nProvider'

// ================================
// Constants
// ================================

const ICON_SIZE = 16

// ================================
// Helper Functions
// ================================

/**
 * Retorna o label completo do idioma
 * @param language - Código do idioma
 * @returns Label formatado
 */
const getLanguageLabel = (language: string): string => {
  return language === 'pt' ? 'Português' : 'English'
}

/**
 * Retorna o código abreviado do idioma
 * @param language - Código do idioma
 * @returns Código abreviado
 */
const getLanguageCode = (language: string): string => {
  return language === 'pt' ? 'PT' : 'EN'
}

// ================================
// Main Component
// ================================

/**
 * Componente de botão para alternar entre português e inglês
 * @component
 */
export const LanguageSwitch: React.FC = () => {
  // ================================
  // Hooks
  // ================================

  const { language, setLanguage, t } = useI18n()

  // ================================
  // Helper Functions
  // ================================

  /**
   * Alterna entre os idiomas disponíveis
   */
  const toggleLanguage = (): void => {
    const newLanguage = language === 'pt' ? 'en' : 'pt'
    setLanguage(newLanguage)
  }

  // ================================
  // Constants
  // ================================

  const languageLabel = getLanguageLabel(language)
  const languageCode = getLanguageCode(language)

  // ================================
  // Render
  // ================================

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-black dark:text-primary-white hover:text-primary-black/70 dark:hover:text-primary-white/70 transition-colors duration-200"
      aria-label={`${t.footer.language}: ${languageLabel}`}
    >
      <Languages size={ICON_SIZE} />
      <span className="font-medium">{languageCode}</span>
    </button>
  )
}

