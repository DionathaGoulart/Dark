'use client'

import { useEffect } from 'react'

import { useI18n } from '@/core/providers'

// ================================
// Tipos e Constantes
// ================================

/** Chaves de página disponíveis para títulos localizados */
type PageKey = 'home' | 'about' | 'projects' | 'contact' | 'prints'

/** Nome base da aplicação para sufixo do título */
const APP_NAME = 'Dark'

// ================================
// Hooks de Título do Documento
// ================================

/**
 * Hook para definir título do documento usando títulos de página localizados
 * Atualiza automaticamente o título da aba do navegador baseado na página atual
 * @param pageKey - Chave correspondente a uma página nas traduções i18n
 */
export const useDocumentTitle = (pageKey: PageKey) => {
  const { t } = useI18n()

  useEffect(() => {
    const title = t.pages[pageKey].title
    document.title = `${title} - ${APP_NAME}`
  }, [t, pageKey])
}

/**
 * Hook para definir título do documento com string de título customizada
 * Útil para páginas dinâmicas ou páginas não cobertas pelas traduções principais
 * @param title - String de título customizada para exibir
 */
export const useCustomDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} - ${APP_NAME}`
  }, [title])
}
