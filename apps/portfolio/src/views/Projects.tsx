'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent } from '@/features/analytics'
import {
  batchPreloadImages,
  MasonryGrid,
  useDocumentTitle
} from '@/shared'
import { useI18n } from '@/core/providers'
import {
  ImageItem,
  ProjectData,
  CloudinaryOptions,
  ProjectUrls,
  LoadingState,
  StableTranslations,
  ProjectGridLoaderProps,
  ErrorStateProps
} from '@/types'

// ================================
// CONSTANTS
// ================================

const CLOUDINARY_BASE_URL =
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739'

const cloudinaryCovers = {
  cover1: `${CLOUDINARY_BASE_URL}/pj1_cover.webp`,
  cover2: `${CLOUDINARY_BASE_URL}/pj2_cover.webp`,
  cover3: `${CLOUDINARY_BASE_URL}/pj3_cover.webp`,
  cover4: `${CLOUDINARY_BASE_URL}/pj4_cover.webp`,
  cover5: `${CLOUDINARY_BASE_URL}/pj5_cover.webp`,
  cover6: `${CLOUDINARY_BASE_URL}/pj6_cover.webp`,
  cover7: `${CLOUDINARY_BASE_URL}/pj7_cover.webp`,
  cover8: `${CLOUDINARY_BASE_URL}/p8_cover.webp`
} as const

const DEFAULT_CLOUDINARY_OPTIONS: CloudinaryOptions = {
  quality: 'auto',
  format: 'auto',
  crop: 'fit'
}

const PRIORITY_PROJECTS_COUNT = 4
const GRID_COLUMN_CONFIG = {
  sm: 1,
  md: 2,
  lg: 2,
  xl: 4
} as const

const LOADER_KEYFRAMES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

const projectsData: ProjectData[] = [
  {
    id: 'faces-of-horror',
    title: 'Faces of Horror',
    titlePt: 'Faces do Horror',
    url: cloudinaryCovers.cover1,
    linkTo: '/facesofhorror'
  },
  {
    id: 'macabre-faces',
    title: 'Macabre Faces T-shirt',
    titlePt: 'Camiseta Faces Macabras',
    url: cloudinaryCovers.cover2,
    linkTo: '/tshirt-raglan'
  },
  {
    id: 'killer-ladybugs',
    title: 'Killer Ladybugs',
    titlePt: 'Joaninhas Assassinas',
    url: cloudinaryCovers.cover3,
    linkTo: '/ladybugs'
  },
  {
    id: 'creepy-faces',
    title: 'Creepy Faces',
    titlePt: 'Rostos Assustadores',
    url: cloudinaryCovers.cover4,
    linkTo: '/creepy'
  },
  {
    id: 'horror-art',
    title: 'Horror Art',
    titlePt: 'Arte de Horror',
    url: cloudinaryCovers.cover5,
    linkTo: '/horror-art'
  },
  {
    id: 'halloween-tshirts',
    title: 'Halloween T-shirts',
    titlePt: 'Camisetas de Halloween',
    url: cloudinaryCovers.cover6,
    linkTo: '/halloween'
  },
  {
    id: 'fantasy-creatures',
    title: 'Fantasy Creatures',
    titlePt: 'Criaturas Fantásticas',
    url: cloudinaryCovers.cover7,
    linkTo: '/fantasy'
  },
  {
    id: 'arachnophobia',
    title: 'Arachnophobia',
    titlePt: 'Aracnofobia',
    url: cloudinaryCovers.cover8,
    linkTo: '/arachnophobia'
  }
]

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Optimizes Cloudinary URLs with transformation parameters
 */
const optimizeCloudinaryUrl = (
  url: string,
  options: CloudinaryOptions = {}
): string => {
  const mergedOptions = { ...DEFAULT_CLOUDINARY_OPTIONS, ...options }
  const { width, height, quality, format, crop } = mergedOptions

  const cloudinaryRegex =
    /https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(.+)/
  const match = url.match(cloudinaryRegex)

  if (!match) return url

  const [, cloudName, imagePath] = match
  const transformations: string[] = []

  if (width || height) {
    const dimensions: string[] = []
    if (width) dimensions.push(`w_${width}`)
    if (height) dimensions.push(`h_${height}`)
    if (crop) dimensions.push(`c_${crop}`)
    transformations.push(dimensions.join(','))
  }

  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)

  transformations.push('fl_progressive', 'fl_immutable_cache')

  const transformationString = transformations.join('/')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${imagePath}`
}

/**
 * Generates optimized URLs for different project image sizes
 */
const generateProjectUrls = (originalUrl: string): ProjectUrls => ({
  thumbnail: optimizeCloudinaryUrl(originalUrl, {
    width: 400,
    height: 400,
    quality: 70,
    format: 'webp',
    crop: 'fill'
  }),
  medium: optimizeCloudinaryUrl(originalUrl, {
    width: 800,
    height: 800,
    quality: 80,
    format: 'webp',
    crop: 'fit'
  }),
  large: optimizeCloudinaryUrl(originalUrl, {
    width: 1200,
    height: 1200,
    quality: 85,
    format: 'webp',
    crop: 'fit'
  }),
  original: originalUrl
})

/**
 * Creates ImageItem from ProjectData
 */
const createImageItem = (
  project: ProjectData,
  language: string
): ImageItem => ({
  id: project.id,
  url: optimizeCloudinaryUrl(project.url, {
    width: 600,
    height: 600,
    quality: 80,
    format: 'webp',
    crop: 'fill'
  }),
  alt: language === 'pt' ? project.titlePt : project.title,
  title: language === 'pt' ? project.titlePt : project.title,
  linkTo: project.linkTo,
  urls: generateProjectUrls(project.url)
})

/**
 * Processes projects batch and returns ImageItems
 */
const processProjectsBatch = async (
  projects: ProjectData[],
  language: string
): Promise<ImageItem[]> => {
  const urls = projects.map((project) =>
    optimizeCloudinaryUrl(project.url, {
      width: 600,
      height: 600,
      quality: 80,
      format: 'webp',
      crop: 'fill'
    })
  )

  const preloadedImages = await batchPreloadImages(urls)

  return preloadedImages.map((image, index) => ({
    ...createImageItem(projects[index], language),
    url: image.url
  }))
}

// ================================
// SUB COMPONENTS
// ================================

/**
 * Loading skeleton component for project grid
 */
const ProjectGridLoader: React.FC<ProjectGridLoaderProps> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
    <style dangerouslySetInnerHTML={{ __html: LOADER_KEYFRAMES }} />

    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="relative aspect-square overflow-hidden rounded-lg bg-primary-white dark:bg-primary-black border border-primary-black/10 dark:border-primary-white/10"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-black/5 dark:via-primary-white/5 to-transparent transform -skew-x-12"
          style={{
            animation: 'shimmer 2s infinite',
            transform: 'translateX(-100%) skewX(-12deg)'
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {[0, 200, 400].map((delay, dotIndex) => (
              <div
                key={dotIndex}
                className="w-2 h-2 bg-primary-black/30 dark:bg-primary-white/30 rounded-full"
                style={{ animation: `bounce 1.4s infinite ${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    ))}
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
const ErrorState: React.FC<ErrorStateProps> = ({ error }) => (
  <div className="min-h-screen bg-primary-white dark:bg-primary-black transition-colors duration-300">
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Erro ao carregar projetos
      </h2>
      <p className="text-gray-600">{error}</p>
    </div>
  </div>
)

// ================================
// HOOKS
// ================================

/**
 * Custom hook for managing image loading state and operations
 */
const useProjectImages = (
  language: string,
  stableTranslations: StableTranslations
) => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    lazyLoading: true,
    error: null
  })

  useEffect(() => {
    let isCancelled = false

    const loadImages = async () => {
      if (!isCancelled) {
        setImages([])
        setLoadingState({ loading: true, lazyLoading: true, error: null })
      }

      try {
        // Load priority projects
        const priorityProjects = projectsData.slice(0, PRIORITY_PROJECTS_COUNT)
        const priorityItems = await processProjectsBatch(
          priorityProjects,
          language
        )

        if (isCancelled) return

        setImages(priorityItems)
        setLoadingState((prev) => ({ ...prev, loading: false }))

        trackEvent({
          event_name: 'projects_loaded',
          event_parameters: {
            projects_count: priorityItems.length,
            load_type: 'priority',
            language: language
          }
        })

        // Load remaining projects
        if (projectsData.length > PRIORITY_PROJECTS_COUNT) {
          const remainingProjects = projectsData.slice(PRIORITY_PROJECTS_COUNT)
          const remainingItems = await processProjectsBatch(
            remainingProjects,
            language
          )

          if (isCancelled) return

          setImages((prevImages) => {
            if (prevImages.length >= projectsData.length) {
              return prevImages
            }

            const existingIds = new Set(prevImages.map((img) => img.id))
            const newItems = remainingItems.filter(
              (item) => !existingIds.has(item.id)
            )

            return [...prevImages, ...newItems]
          })

          trackEvent({
            event_name: 'projects_lazy_loaded',
            event_parameters: {
              total_projects: priorityItems.length + remainingItems.length,
              lazy_projects: remainingItems.length,
              language: language
            }
          })
        }

        if (!isCancelled) {
          setLoadingState((prev) => ({ ...prev, lazyLoading: false }))
        }
      } catch (err) {
        console.error('Error loading project covers:', err)
        if (!isCancelled) {
          trackEvent({
            event_name: 'projects_load_error',
            event_parameters: {
              error_message:
                err instanceof Error ? err.message : 'Unknown error',
              error_type: 'project_covers_load_failure',
              language: language
            }
          })

          setLoadingState({
            loading: false,
            lazyLoading: false,
            error: stableTranslations.error
          })
        }
      }
    }

    loadImages()

    return () => {
      isCancelled = true
    }
  }, [language, stableTranslations.error])

  return { images, loadingState, setImages }
}

/**
 * Custom hook to handle project interactions
 */
const useProjectHandlers = (
  router: ReturnType<typeof useRouter>,
  language: string,
  setImages: any
) => {
  const handleProjectClick = (image: ImageItem) => {
    trackEvent({
      event_name: 'project_click',
      event_parameters: {
        project_id: image.id,
        project_title: image.title || 'untitled',
        project_link: image.linkTo || 'unknown',
        language: language,
        action: 'navigate_to_project'
      }
    })

    if (image.linkTo) {
      router.push(image.linkTo)
    } else {
      router.push(`/projects/${image.id}`)
      console.warn(`Project ${image.id} missing linkTo definition`)
    }
  }

  const handleImageError = (image: ImageItem) => {
    console.error(`Error loading cover: ${image.id}`)
    setImages((prev: ImageItem[]) => prev.filter((img) => img.id !== image.id))

    trackEvent({
      event_name: 'project_image_error',
      event_parameters: {
        project_id: image.id,
        error_type: 'project_cover_display_failure'
      }
    })
  }

  return { handleProjectClick, handleImageError }
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * Projects page component with optimized image loading and responsive grid.
 * Implements progressive loading for better user experience.
 */
export const ProjectsPage: React.FC = () => {
  const { t, language } = useI18n()
  const router = useRouter()

  useDocumentTitle('projects')

  const stableTranslations = useMemo(
    () => ({
      title: t.pages.projects.title,
      description: t.pages.projects.description,
      error: t.common.error || 'Erro ao carregar projetos'
    }),
    [t.pages.projects.title, t.pages.projects.description, t.common.error]
  )

  const { images, loadingState, setImages } = useProjectImages(
    language,
    stableTranslations
  )
  const { handleProjectClick, handleImageError } = useProjectHandlers(
    router,
    language,
    setImages
  )

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_projects',
      event_parameters: {
        page_title: 'Projects - Portfolio',
        projects_total: projectsData.length,
        language: language,
        content_type: 'project_gallery'
      }
    })
  }, [language])

  // ================================
  // EARLY RETURNS
  // ================================

  if (loadingState.error) {
    return <ErrorState error={loadingState.error} />
  }

  // ================================
  // RENDER
  // ================================

  return (
    <div className="py-12 md:py-16 min-h-screen bg-primary-white dark:bg-primary-black transition-colors duration-300">

      {!loadingState.loading && loadingState.lazyLoading && (
        <LazyLoadingIndicator />
      )}

      <section className="pb-8 px-6 sm:px-8 lg:px-12">
        {loadingState.loading ? (
          <ProjectGridLoader count={8} />
        ) : (
          <MasonryGrid
            images={images}
            loading={false}
            error={null}
            onImageClick={handleProjectClick}
            onImageError={handleImageError}
            columnCount={GRID_COLUMN_CONFIG}
            gap={3}
            isSquareGrid
            showHoverEffect
          />
        )}
      </section>

      <div className="mt-16 w-32 h-0.5 bg-primary-black dark:bg-primary-white mx-auto" />
    </div>
  )
}
