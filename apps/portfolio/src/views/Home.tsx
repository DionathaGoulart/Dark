'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

import {
  LoadingState,
  MasonryGridLoaderProps,
  ErrorStateProps,
  ImageItem,
  OptimizedUrls
} from '@/types'
import {
  batchPreloadImages,
  MasonryGrid,
  ModalZoom,
  useDocumentTitle
} from '@/shared'
import { useI18n } from '@/core/providers'
import { trackEvent } from '@/features'

// ================================
// CONSTANTS
// ================================

const PRIORITY_IMAGES_COUNT = 12
const MASONRY_HEIGHTS = [
  'h-48',
  'h-64',
  'h-56',
  'h-72',
  'h-52',
  'h-60'
] as const

const COLUMN_CONFIG = {
  sm: 2,
  md: 2,
  lg: 4,
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

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Generates URLs for different image sizes (using original URL from Supabase Storage)
 */
const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => ({
  thumbnail: originalUrl,
  medium: originalUrl,
  large: originalUrl,
  original: originalUrl
})

/**
 * Processes batch of URLs and returns ImageItems
 */
const processBatchImages = async (urls: string[]): Promise<ImageItem[]> => {
  const preloadedImages = await batchPreloadImages(urls)

  return preloadedImages.map((image, index) => ({
    ...image,
    urls: generateOptimizedUrls(urls[index])
  }))
}

// ================================
// SUB COMPONENTS
// ================================

/**
 * Loading skeleton component for masonry grid
 */
const MasonryGridLoader: React.FC<MasonryGridLoaderProps> = ({
  count = 12
}) => (
  <div className="columns-2 md:columns-2 lg:columns-4 xl:columns-4 gap-4 space-y-4">
    <style dangerouslySetInnerHTML={{ __html: LOADER_KEYFRAMES }} />

    {Array.from({ length: count }).map((_, index) => {
      const randomHeight = MASONRY_HEIGHTS[index % MASONRY_HEIGHTS.length]

      return (
        <div
          key={index}
          className={`relative w-full ${randomHeight} overflow-hidden rounded-lg bg-primary-white dark:bg-primary-black border border-primary-black/10 dark:border-primary-white/10 break-inside-avoid mb-4`}
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
      )
    })}
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Erro ao carregar imagens
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    </div>
  </div>
)

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
 * Implements progressive loading for better user experience
 */
export const HomePage: React.FC<HomePageProps> = ({ homeImages = [] }) => {
  const { t, language } = useI18n()
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [supabaseImages, setSupabaseImages] = useState<ImageItem[]>([])
  const [supabaseLoading, setSupabaseLoading] = useState<LoadingState>({
    loading: true,
    lazyLoading: false,
    error: null
  })

  // Criar uma string de referência estável baseada nos IDs das imagens
  const homeImagesKey = useMemo(
    () => homeImages.map(img => img.id).join(','),
    [homeImages]
  )

  // Remover duplicatas das imagens do Supabase antes de usar
  const uniqueSupabaseImages = useMemo(() => {
    return supabaseImages.filter((img, index, self) => 
      index === self.findIndex((i) => i.id === img.id)
    )
  }, [supabaseImages])

  // Usar apenas imagens do Supabase (sem fallback)
  const images = uniqueSupabaseImages
  const loadingState = supabaseLoading

  useDocumentTitle('home')

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_home',
      event_parameters: {
        page_title: 'Home - Portfolio',
        content_type: 'portfolio_gallery',
        total_images_available: homeImages.length
      }
    })
  }, [homeImages.length])

  // Ref para rastrear se o carregamento foi cancelado e evitar duplicação
  const loadingRef = useRef<string | null>(null)
  const hasLoadedRef = useRef<string | null>(null)

  useEffect(() => {
    // Criar uma chave única para este carregamento
    const loadKey = `${homeImagesKey}-${language}`
    
    // Se já carregamos com esta chave, não carregar novamente
    if (hasLoadedRef.current === loadKey) {
      return
    }
    
    loadingRef.current = loadKey
    
    // Limpar imagens anteriores para evitar duplicação
    setSupabaseImages([])
    
    if (homeImages.length > 0) {
      const loadImagesFromSupabase = async () => {
        setSupabaseLoading({ loading: true, lazyLoading: false, error: null })
        try {
          // Verificar se o carregamento ainda é válido antes de começar
          if (loadingRef.current !== loadKey || hasLoadedRef.current === loadKey) {
            return
          }

          const imageUrls = homeImages.map(img => img.image_url)
          
          // Carregar todas as imagens de uma vez para evitar duplicação
          const allImages = await processBatchImages(imageUrls)

          // Verificar se o carregamento ainda é válido
          if (loadingRef.current !== loadKey || hasLoadedRef.current === loadKey) {
            return
          }

          // Adicionar alt text baseado no idioma e garantir IDs únicos
          const imagesWithAlt = allImages.map((img, idx) => ({
            ...img,
            id: homeImages[idx]?.id || `img-${idx}-${Date.now()}`,
            alt: language === 'pt' 
              ? (homeImages[idx]?.alt_text_pt || homeImages[idx]?.alt_text_en || '')
              : (homeImages[idx]?.alt_text_en || homeImages[idx]?.alt_text_pt || ''),
            title: language === 'pt' 
              ? (homeImages[idx]?.alt_text_pt || homeImages[idx]?.alt_text_en || '')
              : (homeImages[idx]?.alt_text_en || homeImages[idx]?.alt_text_pt || '')
          }))

          // Remover duplicatas baseado no ID antes de definir o estado
          const uniqueImages = imagesWithAlt.filter((img, index, self) => 
            index === self.findIndex((i) => i.id === img.id)
          )

          // Verificar novamente antes de atualizar o estado
          if (loadingRef.current !== loadKey || hasLoadedRef.current === loadKey) {
            return
          }

          // Marcar como carregado ANTES de atualizar o estado
          hasLoadedRef.current = loadKey
          
          setSupabaseImages(uniqueImages)
          setSupabaseLoading({ loading: false, lazyLoading: false, error: null })

          if (uniqueImages.length === 0) {
            setSupabaseLoading({
              loading: false,
              lazyLoading: false,
              error: t.common.noImages || 'Nenhuma imagem encontrada'
            })
          }
        } catch (err) {
          // Verificar se ainda é o carregamento atual antes de atualizar o erro
          if (loadingRef.current !== loadKey || hasLoadedRef.current === loadKey) {
            return
          }
          console.error('Error loading images from Supabase:', err)
          setSupabaseLoading({
            loading: false,
            lazyLoading: false,
            error: t.common.error || 'Erro ao carregar imagens'
          })
        }
      }
      loadImagesFromSupabase()
    } else {
      // Se não houver imagens no banco, apenas definir estado como carregado e vazio
      setSupabaseLoading({ loading: false, lazyLoading: false, error: null })
      setSupabaseImages([])
    }
    
    // Cleanup function para cancelar carregamentos pendentes
    return () => {
      if (loadingRef.current === loadKey) {
        loadingRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeImagesKey, language])

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
    setSupabaseImages((prev) => prev.filter((img) => img.id !== image.id))

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
  // EARLY RETURNS
  // ================================

  if (loadingState.error) {
    return <ErrorState error={loadingState.error} />
  }

  // ================================
  // RENDER
  // ================================

  return (
    <div className="min-h-screen bg-primary-white dark:bg-primary-black transition-colors duration-300">
      {!loadingState.loading && loadingState.lazyLoading && (
        <LazyLoadingIndicator />
      )}

      <section className="py-8 px-2 sm:px-8 lg:px-12">
        {loadingState.loading ? (
          <MasonryGridLoader count={12} />
        ) : (
          <MasonryGrid
            images={images}
            loading={false}
            error={null}
            onImageClick={handleImageClick}
            onImageError={handleImageError}
            columnCount={COLUMN_CONFIG}
            gap={3}
          />
        )}
      </section>

      {selectedImage && (
        <ModalZoom image={selectedImage} onClose={handleModalClose} />
      )}
    </div>
  )
}
