'use client'

import React, { useState, useEffect } from 'react'
import {
  AdaptiveSoloGrid,
  ModalZoom,
  useImageOptimization
} from '@/shared'
import { useI18n } from '@/core/providers'

// ================================
// INTERFACES & TYPES
// ================================

interface ImageSectionLoaderProps {
  className?: string
  aspectRatio?: string
}

interface PageTexts {
  title: string
  description: string
}

interface PageTextsConfig {
  pt: PageTexts
  en: PageTexts
}

// ================================
// CONSTANTS
// ================================

const originalUrls = [
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/p8_1.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048728/p8_2.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048730/p8_3.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048732/p8_4.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048736/p8_5.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048734/p8_6.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048723/p8_7.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048726/p8_8.webp'
]

const pageTexts: PageTextsConfig = {
  pt: {
    title: 'Arac',
    description:
      'Uma coleção de designs inspirados em aracnídeos, com uma estética perturbadora e intrigante. As imagens se adaptam automaticamente para se encaixar em qualquer dispositivo.'
  },
  en: {
    title: 'Arac',
    description:
      'A collection of designs inspired by arachnids, with a disturbing and intriguing aesthetic. The images automatically adapt to fit any device.'
  }
}

const horrorAdaptiveRules = {
  portrait: { aspectRatio: 'card', objectFit: 'cover' },
  landscape: { aspectRatio: 'wide', objectFit: 'cover' },
  square: { aspectRatio: 'square', objectFit: 'cover' },
  ultraWide: { aspectRatio: 'cinema', objectFit: 'cover' },
  ultraTall: { aspectRatio: 'tall', objectFit: 'contain' }
} as const

const PRIORITY_IMAGES_COUNT = 3
const ANIMATION_KEYFRAMES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

// ================================
// SUB COMPONENTS
// ================================

/**
 * Loading skeleton component for image sections
 */
const ImageSectionLoader: React.FC<ImageSectionLoaderProps> = ({
  className = '',
  aspectRatio = 'aspect-video'
}) => (
  <div
    className={`relative w-full ${aspectRatio} overflow-hidden rounded-lg bg-primary-white dark:bg-primary-black border border-primary-black/10 dark:border-primary-white/10 ${className}`}
  >
    <style dangerouslySetInnerHTML={{ __html: ANIMATION_KEYFRAMES }} />

    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-black/5 dark:via-primary-white/5 to-transparent transform -skew-x-12"
      style={{
        animation: 'shimmer 2s infinite',
        transform: 'translateX(-100%) skewX(-12deg)'
      }}
    />

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex space-x-1">
        {[0, 200, 400].map((delay, index) => (
          <div
            key={index}
            className="w-2 h-2 bg-primary-black/30 dark:bg-primary-white/30 rounded-full"
            style={{ animation: `bounce 1.4s infinite ${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
)

/**
 * Lazy loading indicator component
 */
const LazyLoadingIndicator: React.FC = () => (
  <div className="text-center py-8">
    <div className="inline-flex flex-col items-center space-y-3 text-primary-black/70 dark:text-primary-white/70">
      <div className="flex space-x-1">
        {[0, 200, 400].map((delay, index) => (
          <div
            key={index}
            className="w-3 h-3 bg-primary-black/40 dark:bg-primary-white/40 rounded-full"
            style={{ animation: `bounce 1.4s infinite ${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
)

/**
 * Error state component
 */
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="py-12 md:py-16">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Erro ao carregar imagens
      </h2>
      <p className="text-gray-600">{error}</p>
    </div>
  </div>
)

// ================================
// HOOKS
// ================================

/**
 * Custom hook for managing page texts based on language
 */
const usePageTexts = (language: string) => {
  return pageTexts[language as keyof typeof pageTexts] || pageTexts.en
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Renders section with loading fallback
 */
const renderSection = (
  component: React.ReactNode,
  imageIndices: number[],
  loadingComponent: React.ReactNode,
  images: any,
  loading: boolean,
  lazyLoading: boolean
) => {
  const hasAllImages = imageIndices.every((index) => {
    return images.solo[index] !== undefined
  })

  if (loading || (!hasAllImages && lazyLoading)) {
    return loadingComponent
  }

  return component
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * Arac page component displaying a collection of arachnid-inspired designs.
 * Features adaptive image loading and modal zoom functionality.
 */
export const Arac: React.FC = () => {
  const { language } = useI18n()
  const texts = usePageTexts(language)

  const { images, loading, lazyLoading, error } = useImageOptimization(
    originalUrls,
    language,
    PRIORITY_IMAGES_COUNT
  )

  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    document.title = `${texts.title} - Dark`
  }, [texts.title])

  // ================================
  // HANDLERS
  // ================================

  const handleImageClick = (image: any) => {
    setSelectedImage(image)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  const handleImageError = (image: any) => {
    console.error(`Falha ao carregar a imagem: ${image.url}`)
  }

  // ================================
  // RENDER
  // ================================

  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className="py-12 md:py-16">
      <section className="px-6 sm:px-8 lg:px-12">
        <div className="space-y-8">
          {!loading && lazyLoading && <LazyLoadingIndicator />}

          {/* Render all 8 images with optimized loading */}
          {Array.from({ length: originalUrls.length }, (_, index) => (
            <div key={index}>
              {renderSection(
                <AdaptiveSoloGrid
                  images={images.solo.slice(index, index + 1)}
                  adaptiveMode="manual"
                  fallbackAspectRatio="auto"
                  adaptiveRules={horrorAdaptiveRules}
                  onImageClick={handleImageClick}
                  onImageError={handleImageError}
                  gap={1}
                />,
                [index],
                <ImageSectionLoader
                  className="max-w-2xl mx-auto"
                  aspectRatio="aspect-video"
                />,
                images,
                loading,
                lazyLoading
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedImage && (
        <ModalZoom image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  )
}
