'use client'

import React, { useEffect } from 'react'

import { trackEvent } from '@/features/analytics'
import { useDocumentTitle } from '@/shared'
import { useI18n } from '@/core/providers'
import { Translation, LinkItemProps, LinkData, DecorativeDividerProps } from '@/types'

// ================================
// CONSTANTS
// ================================

const LINKS_DATA: LinkData[] = [
  {
    titleKey: 'redbubble',
    url: 'http://GoodDark.redbubble.com',
    icon: '',
    eventName: 'click_redbubble'
  },
  {
    titleKey: 'inprnt',
    url: 'https://www.inprnt.com/gallery/darkning/',
    icon: '',
    eventName: 'click_inprnt'
  },
  {
    titleKey: 'displate',
    url: 'https://displate.com/Darkning?art=683cd403062f7',
    icon: '',
    eventName: 'click_displate'
  }
]

// ================================
// HELPER COMPONENTS
// ================================

/**
 * Decorative divider element
 */
const DecorativeDivider: React.FC<DecorativeDividerProps> = ({
  className = ''
}) => (
  <div
    className={`mt-8 w-16 h-0.5 bg-black dark:bg-white mx-auto ${className}`}
  />
)

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

/**
 * Get translated title for a link with fallback logic
 */
const getLinkTitle = (link: LinkData, t: any): string => {
  if (link.titleKey && t.pages?.prints?.links?.[link.titleKey]) {
    return t.pages.prints.links[link.titleKey]
  }
  return link.title || link.titleKey || 'Unknown'
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * Prints & Artwork links page component
 * Displays a collection of links to various art platforms and portfolio sites
 */
export const PrintsPage: React.FC = () => {
  const { t, language } = useI18n()

  useDocumentTitle('prints')

  // ================================
  // EVENT HANDLERS
  // ================================

  const handleLinkClick = (link: LinkData) => {
    trackEvent({
      event_name: link.eventName,
      event_parameters: {
        link_url: link.url,
        link_title: link.titleKey || link.title || 'Unknown',
        language: language,
        page_title: 'Prints & Artwork - Portfolio'
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
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {LINKS_DATA.map((link, index) => (
              <LinkItem
                key={index}
                title={getLinkTitle(link, t)}
                url={link.url}
                icon={link.icon}
                onClick={() => handleLinkClick(link)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintsPage
