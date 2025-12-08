// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Page Types
// ================================

/**
 * Configuração de link social
 * @interface SocialLink
 */
export interface SocialLink {
  /** Componente de ícone SVG */
  icon: React.ReactNode
  /** URL do link */
  href: string
  /** Label acessível para o link */
  label: string
}

/**
 * Configuração de botão de link
 * @interface LinkButton
 */
export interface LinkButton {
  /** Texto do título do botão */
  title: string
  /** URL do botão */
  href: string
}

