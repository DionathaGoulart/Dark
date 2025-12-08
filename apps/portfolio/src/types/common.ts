import React from 'react'

// ================================
// SHARED METADATA TYPES
// ================================

/**
 * Shared metadata interface for projects and folders
 * Allows for extensible metadata with type safety
 */
export interface Metadata {
  type: string
  createdAt: string
  [key: string]: any // Allows for additional, less strict metadata
}

// ================================
// BASE COMPONENT TYPES
// ================================

/** Props base com children para componentes container */
export interface BaseContainerProps {
  children: React.ReactNode
  className?: string
}

/** Props base para componentes com estilização customizável */
export interface BaseStyledProps {
  className?: string
}

// ================================
// INTERNATIONALIZATION TYPES
// ================================

/**
 * Supported languages
 */
export type Language = 'pt' | 'en'

/**
 * Complete translation interface structure
 * Covers all application text content
 */
export interface Translation {
  nav: {
    home: string
    about: string
    projects: string
    contact: string
    prints: string
  }
  pages: {
    home: {
      title: string
    }
    about: {
      title: string
      description: string
      content: string
    }
    projects: {
      title: string
      description: string
    }
    contact: {
      title: string
      subtitle: string
      info: {
        description: string
      }
      form: {
        name: string
        email: string
        message: string
        send: string
        sending: string
        namePlaceholder: string
        emailPlaceholder: string
        messagePlaceholder: string
        successTitle: string
        successMessage: string
        sendAnother: string
        errorMessage: string
      }
    }
    prints: {
      title: string
      links: {
        redbubble: string
        inprnt: string
        displate: string
        portfolio: string
        donate: string
      }
    }
  }
  footer: {
    rights: string
    language: string
  }
  common: {
    loading: string
    error: string
    noImages: string
  }
}

// ================================
// THEME TYPES
// ================================

export type Theme = 'light' | 'dark'

// ================================
// UTILITY TYPES
// ================================

/** Função para obter classes CSS condicionalmente */
export type ClassNameGetter = (...args: any[]) => string

/** Configuração de breakpoints */
export interface Breakpoints {
  mobile: number
  tablet: number
  desktop: number
}

/** Handlers de eventos comuns */
export interface EventHandlers {
  onClick?: () => void
  onToggle?: (isOpen: boolean) => void
  onClose?: () => void
}
