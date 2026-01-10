'use client'

import React, { useEffect } from 'react'

import { trackEvent } from '@/features/analytics'
import { useDocumentTitle } from '@/shared'
import { useI18n } from '@/core/providers'

// ================================
// MAIN COMPONENT
// ================================

interface AboutPageProps {
  pageData?: {
    title_pt: string
    title_en: string
    content_pt?: string
    content_en?: string
  } | null
}

/**
 * About page component that displays information about the application.
 * Uses internationalization for content and sets the document title.
 */
export const AboutPage: React.FC<AboutPageProps> = ({ pageData }) => {
  const { t, language } = useI18n()

  useDocumentTitle('about')

  // Usar dados do Supabase se disponíveis, senão usar traduções
  const title = pageData
    ? (language === 'pt' ? pageData.title_pt : pageData.title_en)
    : t.pages.about.title
  const description = pageData
    ? (language === 'pt' ? pageData.content_pt : pageData.content_en) || ''
    : t.pages.about.description
  const content = pageData
    ? ''
    : t.pages.about.content

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_about',
      event_parameters: {
        page_title: 'About - Portfolio',
        language: language,
        content_type: 'about_page'
      }
    })
  }, [language])

  // ================================
  // RENDER
  // ================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-8 tracking-tight">
          {title}
        </h1>

        <div className="prose prose-lg max-w-none">
          {description && (
            <p className="text-primary-black/60 dark:text-primary-white/60 leading-relaxed">
              {description}
            </p>
          )}
          {content && description && <br />}
          {content && (
            <p className="text-primary-black/60 dark:text-primary-white/60 leading-relaxed">
              {content}
            </p>
          )}
        </div>

        {/* Elemento decorativo */}
        <div className="mt-12 w-24 h-0.5 bg-primary-black dark:bg-primary-white"></div>
      </div>
    </div>
  )
}
