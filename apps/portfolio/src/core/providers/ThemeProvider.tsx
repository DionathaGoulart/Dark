'use client'

import { trackThemeChange } from '@/features/analytics'
import React, { createContext, useContext, useEffect, useState } from 'react'

// ================================
// INTERFACES E TIPOS
// ================================

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

interface ThemeProviderProps {
  children: React.ReactNode
}

// ================================
// CONSTANTES
// ================================

const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'dark'
const DARK_CLASS = 'dark'
const SUPPORTED_THEMES: Theme[] = ['light', 'dark']

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Valida se o valor do tema é suportado
 */
const isValidTheme = (theme: string): theme is Theme => {
  return SUPPORTED_THEMES.includes(theme as Theme)
}

/**
 * Obtém tema de forma segura do localStorage
 */
const getStoredTheme = (): Theme | null => {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    if (savedTheme && isValidTheme(savedTheme)) {
      return savedTheme
    }
  } catch (error) {
    console.warn('Não foi possível acessar o localStorage para o tema:', error)
  }

  return null
}

/**
 * Obtém tema inicial do armazenamento ou retorna padrão
 */
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return DEFAULT_THEME
  return getStoredTheme() || DEFAULT_THEME
}

/**
 * Salva tema de forma segura no localStorage
 */
const saveThemeToStorage = (theme: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Não foi possível salvar tema no localStorage:', error)
  }
}

/**
 * Aplica tema ao elemento raiz do documento
 */
const applyThemeToDOM = (theme: Theme): void => {
  try {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add(DARK_CLASS)
    } else {
      root.classList.remove(DARK_CLASS)
    }
  } catch (error) {
    console.warn('Não foi possível aplicar tema ao DOM:', error)
  }
}

// ================================
// CONTEXTO
// ================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ================================
// COMPONENTE PROVEDOR
// ================================

/**
 * Provedor de Tema que gerencia estado de tema claro/escuro
 * Persiste automaticamente preferência de tema e aplica ao DOM
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // ================================
  // EFEITOS
  // ================================

  useEffect(() => {
    saveThemeToStorage(theme)
    applyThemeToDOM(theme)
  }, [theme])

  // ================================
  // MANIPULADORES
  // ================================

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    trackThemeChange(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  }

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// ================================
// HOOKS
// ================================

/**
 * Hook para acessar contexto de tema
 * Deve ser usado dentro do ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }

  return context
}
