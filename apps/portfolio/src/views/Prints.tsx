'use client'

import React, { useEffect } from 'react'

import { trackEvent } from '@/features/analytics'
import { useDocumentTitle } from '@/shared'
import { useI18n } from '@/core/providers'
import { LinkItemProps } from '@/types'

// ================================
// CONSTANTS
// ================================



// ================================
// HELPER COMPONENTS
// ================================



/**
 * Individual link item component
 */
const LinkItem: React.FC<LinkItemProps> = ({ title, url, icon, onClick }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="block w-full p-4 mb-4 bg-white dark:bg-black border-2 border-primary-black dark:border-primary-white rounded-full text-center font-medium text-primary-black dark:text-primary-white hover:bg-primary-black hover:text-white dark:hover:bg-primary-white dark:hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
  >
    <div className="flex items-center justify-center space-x-2">
      {icon && <span className="text-lg">{icon}</span>}
      <span>{title}</span>
    </div>
  </a>
)

// ================================
// HELPER FUNCTIONS
// ================================



// ================================
// MAIN COMPONENT
// ================================

interface PrintsPageData {
  title_pt: string
  title_en: string
  content_pt?: string
  content_en?: string
}

interface StoreCard {
  id: string
  title_pt?: string
  title_en?: string
  url: string
  description?: string
  icon_url?: string
  order_index: number
  is_active: boolean
}

/**
 * Prints & Artwork links page component
 * Displays a collection of links to various art platforms and portfolio sites
 */
export const PrintsPage: React.FC<{
  pageData?: PrintsPageData | null
  storeCards?: StoreCard[]
}> = ({ pageData, storeCards = [] }) => {
  const { t, language } = useI18n()

  useDocumentTitle('prints')

  // Usar dados do Supabase se disponíveis
  const title = pageData
    ? (language === 'pt' ? pageData.title_pt : pageData.title_en)
    : t.pages.prints.title

  // Usar apenas cards do banco, sem fallback
  const displayCards = storeCards.map(card => ({
    title: language === 'pt'
      ? (card.title_pt || card.title_en || '')
      : (card.title_en || card.title_pt || ''),
    url: card.url,
    icon: card.icon_url || '',
    eventName: 'click_store_card'
  }))

  // ================================
  // EVENT HANDLERS
  // ================================

  const handleLinkClick = (link: { title: string; url: string; eventName?: string }) => {
    trackEvent({
      event_name: link.eventName || 'click_store_link',
      event_parameters: {
        link_url: link.url,
        link_title: link.title || 'Unknown',
        language: language,
        page_title: 'Stores - Portfolio'
      }
    })
  }

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_prints_artwork',
      event_parameters: {
        page_title: 'Prints & Artwork - Portfolio',
        language: language,
        content_type: 'prints_artwork_page'
      }
    })
  }, [language])

  // ================================
  // RENDER
  // ================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-slide-up">
        {title && (
          <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-8 tracking-tight text-center">
            {title}
          </h1>
        )}
        {pageData && (language === 'pt' ? pageData.content_pt : pageData.content_en) && (
          <div className="prose prose-lg max-w-none mb-8 text-center">
            <p className="text-primary-black/60 dark:text-primary-white/60 leading-relaxed">
              {language === 'pt' ? pageData.content_pt : pageData.content_en}
            </p>
          </div>
        )}
        <div className="max-w-md mx-auto">
          {displayCards.length > 0 ? (
            <div className="space-y-4">
              {displayCards.map((link, index) => (
                <LinkItem
                  key={storeCards[index]?.id || `card-${index}`}
                  title={link.title}
                  url={link.url}
                  icon={link.icon}
                  onClick={() => handleLinkClick(link)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-black/50 dark:text-primary-white/50">
                {language === 'pt'
                  ? 'Nenhuma loja disponível no momento.'
                  : 'No stores available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrintsPage
