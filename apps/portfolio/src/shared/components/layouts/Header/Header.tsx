'use client'

import React from 'react'
import { Instagram, Youtube } from 'lucide-react'

import {
  LanguageSwitch,
  Logo,
  Navigation,
  ThemeToggle
} from '@/shared'
import { useI18n } from '@/core/providers'
import { HeaderConfig, SocialUrls, NavItem } from '@/types'

// ================================
// CONSTANTES
// ================================

const DEFAULT_SOCIAL_URLS = {
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com'
} as const

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Cria itens de navegação com rótulos traduzidos
 */
const createNavItems = (t: any, language: string, customNav?: NavItem[], navigationItems?: any[]) => {
  // Se houver navigationItems do Supabase, usar eles
  if (navigationItems && navigationItems.length > 0) {
    return navigationItems.map(item => ({
      label: language === 'pt' ? item.label_pt : item.label_en,
      href: item.href
    }))
  }
  
  // Se houver customNav, usar ele
  if (customNav && customNav.length > 0) {
    return customNav
  }
  
  // Fallback para traduções padrão
  return [
    { label: t.nav.home, href: '/' },
    { label: t.nav.about, href: '/about' },
    { label: t.nav.projects, href: '/projects' },
    { label: t.nav.contact, href: '/contact' },
    { label: t.nav.prints, href: '/stores' }
  ]
}

// ================================
// SUB-COMPONENTES
// ================================

/**
 * Componente de links das redes sociais
 */
const SocialLinks: React.FC<SocialUrls> = ({ instagramUrl, youtubeUrl }) => (
  <div className="flex justify-center items-center pb-4 space-x-3">
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 transition-colors duration-200 flex items-center h-6"
      aria-label="Instagram"
    >
      <Instagram size={24} />
    </a>
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200 flex items-center h-6"
      aria-label="YouTube"
    >
      <Youtube size={30} />
    </a>
  </div>
)

/**
 * Navegação desktop com layout centralizado
 */
const DesktopNavigation: React.FC<{ navItems: any[] }> = ({ navItems }) => (
  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
    <Navigation items={navItems} />
  </div>
)

/**
 * Navegação mobile com controles
 */
const MobileNavigation: React.FC<{ navItems: any[] }> = ({ navItems }) => (
  <div className="md:hidden flex items-center space-x-3">
    <LanguageSwitch />
    <ThemeToggle />
    <Navigation items={navItems} />
  </div>
)

/**
 * Controles desktop (alternador de tema e troca de idioma)
 */
const DesktopControls: React.FC = () => (
  <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
    <LanguageSwitch />
    <ThemeToggle />
  </div>
)

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Cabeçalho da aplicação com logo, navegação e controles
 * Apresenta layout responsivo com navegação desktop centralizada e menu hambúrguer mobile
 */
export const LayoutHeader: React.FC<HeaderConfig> = ({
  logoSrc,
  logoAlt = 'Logo',
  showNavigation = true,
  instagramUrl = DEFAULT_SOCIAL_URLS.instagram,
  youtubeUrl = DEFAULT_SOCIAL_URLS.youtube,
  customNav,
  navigationItems
}) => {
  const { t, language } = useI18n()

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const navItems = createNavItems(t, language, customNav, navigationItems)

  // ================================
  // RETORNOS ANTECIPADOS
  // ================================

  if (!showNavigation && !logoSrc) return null

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <header className="relative w-full bg-primary-white dark:bg-primary-black transition-all duration-300 z-30">
      <div className="px-4 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <div className="flex-shrink-0">
            <Logo src={logoSrc} alt={logoAlt} />
          </div>

          {showNavigation && (
            <>
              <DesktopNavigation navItems={navItems} />
              <MobileNavigation navItems={navItems} />
            </>
          )}

          <DesktopControls />
        </div>

        <SocialLinks instagramUrl={instagramUrl} youtubeUrl={youtubeUrl} />
      </div>
    </header>
  )
}
