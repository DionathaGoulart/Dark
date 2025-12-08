'use client'

import React from 'react'
import { Languages } from 'lucide-react'

import { useI18n } from '@/core/providers'
import { LanguageSwitchProps } from '@/types'

// ================================
// CONSTANTES
// ================================

const languageLabels = {
  pt: 'Português',
  en: 'English'
} as const

const languageDisplayNames = {
  pt: 'PT',
  en: 'EN'
} as const

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Componente de troca de idioma que alterna entre Português e Inglês
 * Usa o contexto I18n para gerenciar o estado do idioma
 */
export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  className = ''
}) => {
  const { language, setLanguage, t } = useI18n()

  // ================================
  // MANIPULADORES
  // ================================

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt')
  }

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const currentLanguageLabel = languageLabels[language]
  const displayName = languageDisplayNames[language]

  const ariaLabel = `${t.footer.language}: ${currentLanguageLabel}`

  const buttonClasses = [
    'flex items-center space-x-2 px-3 py-2 text-sm',
    'text-primary-black dark:text-primary-white',
    'hover:text-primary-black/70 dark:hover:text-primary-white/70',
    'transition-colors duration-200',
    className
  ]
    .filter(Boolean)
    .join(' ')

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <button
      onClick={toggleLanguage}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      <Languages size={16} />
      <span className="font-medium">{displayName}</span>
    </button>
  )
}
