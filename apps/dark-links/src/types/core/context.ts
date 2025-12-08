// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Internal Imports
// ================================
import { Theme, Language } from './index'
import { Translation } from './translation'

// ================================
// Context Types
// ================================

/**
 * Interface do contexto de tema
 * @interface ThemeContextType
 */
export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

/**
 * Props do provider de tema
 * @interface ThemeProviderProps
 */
export interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * Interface do contexto de internacionalização
 * @interface I18nContextType
 */
export interface I18nContextType {
  language: Language
  translations: Translation
  setLanguage: (language: Language) => void
  t: Translation
}

/**
 * Props do provider de internacionalização
 * @interface I18nProviderProps
 */
export interface I18nProviderProps {
  children: React.ReactNode
}

