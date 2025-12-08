'use client'

import React from 'react'
import { LayoutFooter, LayoutHeader, ScrollToTopButton } from '@/shared'
import { MainLayoutProps } from '@/types'

// ================================
// CONSTANTES
// ================================

const DEFAULT_SOCIAL_URLS = {
  instagram: 'https://www.instagram.com/darkning.art',
  youtube: 'https://www.youtube.com/@darkning_art'
} as const

const DEFAULT_SCROLL_CONFIG = {
  showAfter: 300,
  smooth: true
} as const

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Wrapper de layout principal com cabeçalho, rodapé e funcionalidade de voltar ao topo
 * Fornece a estrutura base para todas as páginas da aplicação
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  header = { showNavigation: true },
  footer = { show: true },
  className = ''
}) => {
  // ================================
  // VALORES COMPUTADOS
  // ================================

  const containerClasses = [
    'min-h-screen flex flex-col bg-primary-white dark:bg-primary-black transition-all duration-300',
    className
  ]
    .filter(Boolean)
    .join(' ')

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <div className={containerClasses}>
      <LayoutHeader
        instagramUrl={DEFAULT_SOCIAL_URLS.instagram}
        youtubeUrl={DEFAULT_SOCIAL_URLS.youtube}
        showNavigation={header.showNavigation}
      />

      <main className="flex-1 bg-primary-white dark:bg-primary-black text-primary-black dark:text-primary-white transition-all duration-300">
        {children}
      </main>

      {footer.show && <LayoutFooter />}

      <ScrollToTopButton
        showAfter={DEFAULT_SCROLL_CONFIG.showAfter}
        smooth={DEFAULT_SCROLL_CONFIG.smooth}
      />
    </div>
  )
}
