'use client'

import React from 'react'
import { useI18n } from '@/core/providers'
import { BaseStyledProps } from '@/types'

// ================================
// INTERFACES
// ================================

interface FooterText {
  pt?: string
  en?: string
}

interface LayoutFooterProps {
  className?: string
  footerText?: string | FooterText
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Rodapé da aplicação com informações de copyright
 * Exibe texto de direitos traduzido com design responsivo
 */
export const LayoutFooter: React.FC<LayoutFooterProps> = ({ 
  className = '',
  footerText
}) => {
  const { t, language } = useI18n()

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const footerClasses = [
    'bg-primary-white dark:bg-primary-black transition-all duration-300',
    className
  ]
    .filter(Boolean)
    .join(' ')

  // Determinar qual texto exibir baseado no idioma
  let displayText: string
  
  if (!footerText) {
    displayText = t.footer.rights
  } else if (typeof footerText === 'string') {
    // Compatibilidade com formato antigo (string única)
    displayText = footerText
  } else {
    // Novo formato com objeto { pt, en }
    displayText = language === 'pt' 
      ? (footerText.pt || footerText.en || t.footer.rights)
      : (footerText.en || footerText.pt || t.footer.rights)
  }

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <footer className={footerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center text-primary-black dark:text-primary-white">
            <p className="font-medium tracking-wide">{displayText}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
