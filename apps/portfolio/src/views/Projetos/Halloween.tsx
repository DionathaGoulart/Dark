'use client'

import React, { useState, useEffect } from 'react'
import {
  AdaptiveSoloGrid,
  AdaptiveThreeColumnGrid,
  AdaptiveTwoColumnGrid,
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

interface GridSection {
  component: React.ReactNode
  imageIndices: number[]
  context: 'grid' | 'solo'
  loadingComponent: React.ReactNode
  containerClass?: string
}

// ================================
// CONSTANTS
// ================================

const originalUrls = [
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048660/pj6_1.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048661/pj6_2.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048642/pj6_3.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048648/pj6_4.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048645/pj6_5.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048663/pj6_6.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048647/pj6_7.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048654/pj6_8.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048669/pj6_9.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048656/pj6_10.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048652/pj6_11.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048665/pj6_12.webp'
]

const pageTexts: PageTextsConfig = {
  pt: {
    title: 'Halloween',
    description: 'Designs de Halloween para estampas de camisetas.'
  },
  en: {
    title: 'Halloween',
    description: 'Halloween designs for t-shirt prints.'
  }
}

const horrorAdaptiveRules = {
  portrait: { aspectRatio: 'card', objectFit: 'cover' },
  landscape: { aspectRatio: 'wide', objectFit: 'cover' },
  square: { aspectRatio: 'square', objectFit: 'cover' },
  ultraWide: { aspectRatio: 'cinema', objectFit: 'cover' },
  ultraTall: { aspectRatio: 'tall', objectFit: 'contain' }
} as const

const PRIORITY_IMAGES_COUNT = 6
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
  aspectRatio = 'aspect-square'
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

/**
 * Reusable grid section wrapper component
 */
const GridSectionWrapper: React.FC<{
  section: GridSection
  images: any
  loading: boolean
  lazyLoading: boolean
}> = ({ section, images, loading, lazyLoading }) => {
  const hasAllImages = section.imageIndices.every((index) => {
    const imageArray = section.context === 'grid' ? images.grid : images.solo
    return imageArray[index] !== undefined
  })

  const shouldShowLoading = loading || (!hasAllImages && lazyLoading)
  const content = shouldShowLoading
    ? section.loadingComponent
    : section.component

  return section.containerClass ? (
    <div className={section.containerClass}>{content}</div>
  ) : (
    <div>{content}</div>
  )
}

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
 * Creates grid sections configuration for the Halloween page layout
 */
const createGridSections = (
  images: any,
  onImageClick: (image: any) => void,
  onImageError: (image: any) => void
): GridSection[] => [
  {
    component: (
      <AdaptiveThreeColumnGrid
        images={images.grid.slice(0, 3)}
        adaptiveMode="manual"
        fallbackAspectRatio="portrait"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [0, 1, 2],
    context: 'grid' as const,
    loadingComponent: (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <ImageSectionLoader key={i} />
        ))}
      </div>
    )
  },
  {
    component: (
      <AdaptiveTwoColumnGrid
        images={images.grid.slice(3, 5)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
        dominantSide="right"
        fallbackObjectFit="scale-down"
      />
    ),
    imageIndices: [3, 4],
    context: 'grid' as const,
    loadingComponent: (
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: 2 }, (_, i) => (
          <ImageSectionLoader key={i} aspectRatio="aspect-video" />
        ))}
      </div>
    )
  },
  {
    component: (
      <AdaptiveSoloGrid
        images={images.solo.slice(5, 6)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        fallbackObjectFit="contain"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [5],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />
  },
  {
    component: (
      <AdaptiveTwoColumnGrid
        images={images.grid.slice(6, 8)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
        dominantSide="left"
        fallbackObjectFit="scale-down"
      />
    ),
    imageIndices: [6, 7],
    context: 'grid' as const,
    loadingComponent: (
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: 2 }, (_, i) => (
          <ImageSectionLoader key={i} aspectRatio="aspect-video" />
        ))}
      </div>
    )
  },
  {
    component: (
      <AdaptiveSoloGrid
        images={images.solo.slice(8, 9)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        fallbackObjectFit="contain"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [8],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />
  },
  {
    component: (
      <AdaptiveTwoColumnGrid
        images={images.grid.slice(9, 11)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
        dominantSide="right"
        fallbackObjectFit="scale-down"
      />
    ),
    imageIndices: [9, 10],
    context: 'grid' as const,
    loadingComponent: (
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: 2 }, (_, i) => (
          <ImageSectionLoader key={i} aspectRatio="aspect-video" />
        ))}
      </div>
    )
  },
  {
    component: (
      <AdaptiveSoloGrid
        images={images.solo.slice(11, 12)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [11],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />
  }
]

// ================================
// MAIN COMPONENT
// ================================

/**
 * Halloween page component displaying spooky and festive Halloween designs.
 * Features adaptive image loading with priority rendering and modal zoom.
 */
export const Halloween: React.FC = () => {
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

  const gridSections = createGridSections(
    images,
    handleImageClick,
    handleImageError
  )

  return (
    <div className="py-12 md:py-16">
      <section className="px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary-black/60 dark:text-primary-white/60 leading-relaxed">
            {texts.description}
          </p>
        </div>
        <div className="space-y-8">
          {/* Render priority sections (first 3 sections) */}
          {gridSections.slice(0, 3).map((section, index) => (
            <GridSectionWrapper
              key={`priority-${index}`}
              section={section}
              images={images}
              loading={loading}
              lazyLoading={lazyLoading}
            />
          ))}

          {/* Lazy loading indicator */}
          {!loading && lazyLoading && <LazyLoadingIndicator />}

          {/* Render remaining sections with lazy loading */}
          {gridSections.slice(3).map((section, index) => (
            <GridSectionWrapper
              key={`lazy-${index}`}
              section={section}
              images={images}
              loading={loading}
              lazyLoading={lazyLoading}
            />
          ))}
        </div>
      </section>

      {selectedImage && (
        <ModalZoom image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  )
}
