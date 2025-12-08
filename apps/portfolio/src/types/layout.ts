import React from 'react'

// ================================
// NAVIGATION TYPES
// ================================

/** Item de navegação com ação customizável */
export interface NavItem {
  label: string
  href: string
  onClick?: () => void
}

/** Props para componente de navegação */
export interface NavigationProps {
  items: NavItem[]
  className?: string
}

/** Retorno do hook de rota ativa */
export interface ActiveRouteHook {
  isActive: (href: string) => boolean
}

// ================================
// SCROLL TO TOP TYPES
// ================================

/** Configuração de comportamento de scroll */
export interface ScrollConfig {
  showAfter?: number
  smooth?: boolean
}

/** Props para botões de scroll to top */
export interface ScrollToTopProps extends ScrollConfig {
  className?: string
}

/** Informações de estado do scroll */
export interface ScrollInfo {
  isVisible: boolean
  scrollProgress: number
}

/** Retorno do hook de scroll to top */
export interface ScrollToTopHook {
  isVisible: boolean
  scrollToTop: (smooth?: boolean) => void
}

// ================================
// HEADER TYPES
// ================================

/** Configuração de URLs para redes sociais */
export interface SocialUrls {
  instagramUrl?: string
  youtubeUrl: string
}

/** Configuração completa do header */
export interface HeaderConfig extends SocialUrls {
  logoSrc?: string
  logoAlt?: string
  showNavigation?: boolean
  customNav?: NavItem[]
}

/** Props do componente LayoutHeader */
export interface LayoutHeaderProps extends HeaderConfig {}

// ================================
// FOOTER TYPES
// ================================

/** Configuração do footer */
export interface FooterConfig {
  show?: boolean
  content?: React.ReactNode
}

/** Props do componente LayoutFooter */
export interface LayoutFooterProps {
  className?: string
}

// ================================
// MAIN LAYOUT TYPES
// ================================

/** Configuração simplificada do header no MainLayout */
export interface MainLayoutHeaderConfig {
  showNavigation?: boolean
  logoSrc?: string
  logoAlt?: string
  instagramUrl?: string
  youtubeUrl?: string
}

/** Configuração simplificada do footer no MainLayout */
export interface MainLayoutFooterConfig {
  show?: boolean
}

/** Props do componente MainLayout */
export interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  header?: MainLayoutHeaderConfig
  footer?: MainLayoutFooterConfig
}

// ================================
// SPECIFIC COMPONENT TYPES
// ================================

/** Props para navegação desktop */
export interface DesktopNavigationProps {
  items: NavItem[]
  isActive: (href: string) => boolean
}

/** Props para botão do menu mobile */
export interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
}

/** Props para overlay mobile */
export interface MobileOverlayProps {
  isOpen: boolean
  onClose: () => void
}

/** Props para navegação mobile */
export interface MobileNavigationProps extends DesktopNavigationProps {
  isOpen: boolean
  onLinkClick: () => void
}

/** Props para ícone de seta */
export interface ArrowUpIconProps {
  className?: string
}

/** Props para círculo de progresso */
export interface ProgressCircleProps {
  progress: number
}

// ================================
// CONSTANTS
// ================================

/** Tipos de linha do menu hambúrguer */
export type HamburgerLineType = 'top' | 'middle' | 'bottom'

// ================================
// EXTENSIONS
// ================================

/** Props estendidas para componentes que precisam de controle de tema */
export interface ThemedComponentProps {
  className?: string
  darkMode?: boolean
}

/** Props para componentes com animações */
export interface AnimatedComponentProps {
  className?: string
  duration?: number
  easing?: string
}

// ================================
// DEFAULT CONFIGURATIONS
// ================================

/** Configurações padrão do layout */
export interface DefaultLayoutConfig {
  social: SocialUrls
  scroll: ScrollConfig
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}
