// ================================
// Translation Types
// ================================

/**
 * Interface de tradução para internacionalização
 * @interface Translation
 */
export interface Translation {
  pageTitles: {
    home: string
  }
  pages: {
    home: {
      title: string
    }
  }
  linktree: {
    bio: string
    redbubble: string
    colab55: string
    inprnt: string
    displate: string
    behance: string
    portfolio: string
    donate: string
  }
  footer: {
    language: string
  }
}

/**
 * Chave da página para obter título das traduções
 */
export type PageKey = keyof typeof import('../../shared/translations/pt').ptTranslations.pages

