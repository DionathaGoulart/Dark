'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ptTranslations } from '@/shared/translations/pt'
import { enTranslations } from '@/shared/translations/en'
import { Language, Translation } from '@/types'
import { trackLanguageChange } from '@/features/analytics'

// ================================
// INTERFACES E TIPOS
// ================================

interface I18nContextType {
  language: Language
  translations: Translation
  setLanguage: (language: Language) => void
  t: Translation
}

interface I18nProviderProps {
  children: ReactNode
}

// ================================
// CONSTANTES
// ================================

const STORAGE_KEY = 'app-language'

const translations = {
  pt: ptTranslations,
  en: enTranslations
} as const

const SUPPORTED_LANGUAGES: Language[] = ['pt', 'en']

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Detecta o idioma do navegador e retorna idioma suportado
 */
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt'
  
  const browserLang = navigator.language.toLowerCase()

  if (browserLang.startsWith('pt')) {
    return 'pt'
  }

  return 'en'
}

/**
 * Valida se o idioma é suportado
 */
const isValidLanguage = (lang: string): lang is Language => {
  return SUPPORTED_LANGUAGES.includes(lang as Language)
}

/**
 * Obtém idioma de forma segura do localStorage
 */
const getStoredLanguage = (): Language | null => {
  try {
    const savedLanguage = localStorage.getItem(STORAGE_KEY)
    if (savedLanguage && isValidLanguage(savedLanguage)) {
      return savedLanguage
    }
  } catch (error) {
    console.warn('Não foi possível acessar o localStorage:', error)
  }

  return null
}

/**
 * Obtém idioma inicial do armazenamento ou detecção do navegador
 */
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'pt'
  return getStoredLanguage() || detectBrowserLanguage()
}

/**
 * Salva idioma de forma segura no localStorage
 */
const saveLanguageToStorage = (language: Language): void => {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch (error) {
    console.warn('Não foi possível salvar idioma no localStorage:', error)
  }
}

// ================================
// CONTEXTO
// ================================

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// ================================
// COMPONENTE PROVEDOR
// ================================

/**
 * Provedor I18n que gerencia estado de idioma e traduções
 * Detecta automaticamente o idioma do navegador e persiste preferência do usuário
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  // ================================
  // MANIPULADORES
  // ================================

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    saveLanguageToStorage(newLanguage)
    trackLanguageChange(newLanguage)
  }

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const currentTranslations = translations[language]

  const contextValue: I18nContextType = {
    language,
    translations: currentTranslations,
    setLanguage,
    t: currentTranslations
  }

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  )
}

// ================================
// HOOKS
// ================================

/**
 * Hook para acessar contexto I18n
 * Deve ser usado dentro do I18nProvider
 */
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)

  if (context === undefined) {
    throw new Error('useI18n deve ser usado dentro de um I18nProvider')
  }

  return context
}
