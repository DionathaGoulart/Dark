'use client'

import React, { useState, useEffect } from 'react'
import {
  AdaptiveFiveColumnGrid,
  AdaptiveSoloGrid,
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
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048536/pj3_1.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048538/pj3_2.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048539/pj3_3.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048541/pj3_4.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048534/pj3_5.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048525/pj3_6.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048531/pj3_7.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048524/pj3_8.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048526/pj3_9.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048528/pj3_10.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048529/pj3_11.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048535/pj3_12.webp',
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048533/pj3_13.webp'
]

const pageTexts: PageTextsConfig = {
  pt: {
    title: 'Joaninho',
    description:
      'Joaninhas devorando o rosto de uma garota que repousa serenamente em um campo de flores, revelando seu semblante cadavérico.'
  },
  en: {
    title: 'Joaninho',
    description:
      'Ladybugs devouring the face of a girl resting serenely in a field of flowers, revealing her cadaverous visage.'
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
 * Creates grid sections configuration for the Joaninho page layout
 */
const createGridSections = (
  images: any,
  onImageClick: (image: any) => void,
  onImageError: (image: any) => void
): GridSection[] => [
  {
    component: (
      <AdaptiveFiveColumnGrid
        images={images.grid.slice(0, 5)}
        adaptiveMode="manual"
        fallbackAspectRatio="card"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [0, 1, 2, 3, 4],
    context: 'grid' as const,
    loadingComponent: (
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <ImageSectionLoader key={i} />
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
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [5],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />,
    containerClass: 'sm:px-16'
  },
  {
    component: (
      <AdaptiveSoloGrid
        images={images.solo.slice(6, 7)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        fallbackObjectFit="contain"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [6],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />
  },
  {
    component: (
      <AdaptiveTwoColumnGrid
        images={images.grid.slice(7, 9)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [7, 8],
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
        images={images.solo.slice(9, 10)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        fallbackObjectFit="contain"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [9],
    context: 'solo' as const,
    loadingComponent: <ImageSectionLoader className="max-w-2xl mx-auto" />
  },
  {
    component: (
      <AdaptiveTwoColumnGrid
        images={images.grid.slice(10, 12)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [10, 11],
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
        images={images.solo.slice(12, 13)}
        adaptiveMode="manual"
        fallbackAspectRatio="auto"
        adaptiveRules={horrorAdaptiveRules}
        onImageClick={onImageClick}
        onImageError={onImageError}
        gap={1}
      />
    ),
    imageIndices: [12],
    context: 'solo' as const,
    loadingComponent: (
      <ImageSectionLoader
        className="max-w-2xl mx-auto"
        aspectRatio="aspect-video"
      />
    )
  }
]

// ================================
// MAIN COMPONENT
// ================================

/**
 * Joaninho page component displaying gothic and dark aesthetic designs.
 * Features adaptive image loading with priority rendering and modal zoom.
 * Includes unique five-column grid layout.
 */
export const Joaninho: React.FC = () => {
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
          {/* Render priority sections (first 2 sections) */}
          {gridSections.slice(0, 2).map((section, index) => (
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
          {gridSections.slice(2).map((section, index) => (
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
