import { useState } from 'react'
import { trackEvent } from '@/features/analytics'
import { batchPreloadImages, generateOptimizedUrls, optimizeCloudinaryUrl } from '../utils'
import { ImageItem, LoadingState, CloudinaryOptions } from '../types'

// ================================
// Constantes
// ================================

const PRIORITY_IMAGES_COUNT = 12

const DEFAULT_CLOUDINARY_OPTIONS: CloudinaryOptions = {
  quality: 'auto',
  format: 'auto',
  crop: 'fit'
}

// ================================
// Utilitários
// ================================

/**
 * Processes batch of URLs and returns ImageItems with optimized URLs
 */
const processBatchImages = async (urls: string[]): Promise<ImageItem[]> => {
  const optimizedUrls = urls.map((url) =>
    optimizeCloudinaryUrl(url, {
      width: 600,
      quality: 'auto',
      format: 'auto'
    })
  )

  const preloadedImages = await batchPreloadImages(optimizedUrls)

  return preloadedImages.map((image, index) => ({
    ...image,
    urls: generateOptimizedUrls(urls[index])
  }))
}

// ================================
// Hook
// ================================

/**
 * Custom hook to handle image loading and state management
 */
export const useImageLoader = (t: any) => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    lazyLoading: true,
    error: null
  })

  const loadImages = async (originalUrls: string[]) => {
    setLoadingState({ loading: true, lazyLoading: true, error: null })

    try {
      // Load priority images first
      const priorityUrls = originalUrls.slice(0, PRIORITY_IMAGES_COUNT)
      const priorityImages = await processBatchImages(priorityUrls)

      setImages(priorityImages)
      setLoadingState((prev) => ({ ...prev, loading: false }))

      trackEvent({
        event_name: 'images_loaded',
        event_parameters: {
          images_count: priorityImages.length,
          load_type: 'priority',
          load_time: 'initial'
        }
      })

      // Load remaining images lazily
      if (originalUrls.length > PRIORITY_IMAGES_COUNT) {
        const remainingUrls = originalUrls.slice(PRIORITY_IMAGES_COUNT)
        const remainingImages = await processBatchImages(remainingUrls)

        setImages((prev) => [...prev, ...remainingImages])

        trackEvent({
          event_name: 'lazy_images_loaded',
          event_parameters: {
            total_images: priorityImages.length + remainingImages.length,
            lazy_images: remainingImages.length,
            load_type: 'lazy'
          }
        })
      }

      setLoadingState((prev) => ({ ...prev, lazyLoading: false }))

      if (priorityImages.length === 0) {
        setLoadingState((prev) => ({
          ...prev,
          error: t.common.noImages || 'Nenhuma imagem encontrada'
        }))
      }
    } catch (err) {
      console.error('Error loading images:', err)

      trackEvent({
        event_name: 'image_load_error',
        event_parameters: {
          error_message: err instanceof Error ? err.message : 'Unknown error',
          error_type: 'batch_load_failure'
        }
      })

      setLoadingState({
        loading: false,
        lazyLoading: false,
        error: t.common.error || 'Erro ao carregar imagens'
      })
    }
  }

  return { images, setImages, loadingState, loadImages }
}
