'use client'

import React, { useState, useMemo } from 'react'
import { ImageItem } from '@/types'
import { MasonryGrid, ModalZoom, useDocumentTitle } from '@/shared'
import { useI18n } from '@/core/providers'
import { trackEvent } from '@/features'
import { generateOptimizedUrls } from '@/features/gallery/utils'
import { useHomeImages } from '@/lib/prefetch'

// ================================
// CONSTANTS
// ================================

const COLUMN_CONFIG = {
  sm: 2,
  md: 2,
  lg: 4,
  xl: 4
} as const

// ================================
// MAIN COMPONENT
// ================================

interface HomePageProps {
  homeImages?: Array<{
    id: string
    image_url: string
    alt_text_pt?: string
    alt_text_en?: string
    order_index: number
  }>
}

/**
 * Home page component with masonry grid of images
 * Usa dados do servidor + cache do sessionStorage para navegação instantânea
 */
export const HomePage: React.FC<HomePageProps> = ({ homeImages = [] }) => {
  const { language } = useI18n()
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  
  // Usa dados do servidor ou do cache
  const { data: cachedImages } = useHomeImages(homeImages)
  const sourceImages = cachedImages || homeImages

  useDocumentTitle('home')

  // Converte imagens para ImageItems (instantâneo)
  const images: ImageItem[] = useMemo(() => {
    return sourceImages.map((img: any) => ({
      id: img.id,
      url: img.image_url,
      alt: language === 'pt'
        ? (img.alt_text_pt || img.alt_text_en || '')
        : (img.alt_text_en || img.alt_text_pt || ''),
      title: language === 'pt'
        ? (img.alt_text_pt || img.alt_text_en || '')
        : (img.alt_text_en || img.alt_text_pt || ''),
      urls: generateOptimizedUrls(img.image_url)
    }))
  }, [sourceImages, language])

  // ================================
  // HANDLERS
  // ================================

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image)
    trackEvent({
      event_name: 'image_click',
      event_parameters: {
        image_id: image.id,
        image_title: image.title || 'untitled',
        action: 'open_modal'
      }
    })
  }

  const handleImageError = (image: ImageItem) => {
    console.error(`Error displaying image: ${image.id}`)
    trackEvent({
      event_name: 'image_display_error',
      event_parameters: {
        image_id: image.id,
        error_type: 'display_failure'
      }
    })
  }

  const handleModalClose = () => {
    if (selectedImage) {
      trackEvent({
        event_name: 'image_modal_close',
        event_parameters: {
          image_id: selectedImage.id,
          action: 'close_modal'
        }
      })
    }
    setSelectedImage(null)
  }

  // ================================
  // RENDER
  // ================================

  return (
    <div className="min-h-screen bg-primary-white dark:bg-primary-black transition-colors duration-300">
      <section className="py-8 px-2 sm:px-8 lg:px-12">
        <MasonryGrid
          images={images}
          loading={false}
          error={null}
          onImageClick={handleImageClick}
          onImageError={handleImageError}
          columnCount={COLUMN_CONFIG}
          gap={3}
        />
      </section>

      {selectedImage && (
        <ModalZoom image={selectedImage} onClose={handleModalClose} />
      )}
    </div>
  )
}
