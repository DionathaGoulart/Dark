// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Layout Types
// ================================

/**
 * Props do layout principal
 * @interface MainLayoutProps
 */
export interface MainLayoutProps {
  children: React.ReactNode
  header?: {
    showNavigation?: boolean
  }
  footer?: {
    show?: boolean
  }
  className?: string
}

/**
 * Configuração do cabeçalho
 * @interface HeaderConfig
 */
export interface HeaderConfig {
  showNavigation?: boolean
}

