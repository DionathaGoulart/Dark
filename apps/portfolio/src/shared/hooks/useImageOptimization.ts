import { useState, useEffect } from 'react'
import { ImageItem } from '@/types'
import { batchPreloadImages } from '../utils'

// ================================
// Tipos e Interfaces
// ================================

/** URLs otimizadas para diferentes tamanhos de tela (usando URLs originais do Supabase Storage) */
interface OptimizedUrls {
  small: string
  medium: string
  large: string
  main: string
}

/** ImageItem estendido com URLs otimizadas */
export interface OptimizedImageItem extends ImageItem {
  urls: OptimizedUrls
  alt: string
}

/** Estado de imagens organizadas por contexto */
interface ImageOptimizationState {
  grid: OptimizedImageItem[]
  solo: OptimizedImageItem[]
}

/** Interface de retorno do hook */
interface UseImageOptimizationReturn {
  images: ImageOptimizationState
  loading: boolean
  lazyLoading: boolean
  error: string | null
}

// ================================
// Funções Utilitárias
// ================================

/**
 * Gera múltiplas variantes de URL para carregamento responsivo
 * Usa a URL original do Supabase Storage (sem transformações)
 * @param originalUrl - URL base
 * @returns Objeto com URLs para diferentes tamanhos de tela
 */
const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => {
  return {
    small: originalUrl,
    medium: originalUrl,
    large: originalUrl,
    main: originalUrl
  }
}

// ================================
// Hook Customizado
// ================================

/**
 * Hook para otimizar e carregar imagens com estratégia de carregamento baseada em prioridade
 * @param originalUrls - Array de URLs originais das imagens
 * @param language - Configuração de idioma atual
 * @param priorityCount - Número de imagens para carregar com alta prioridade
 * @param bypassCache - Flag para ignorar cache durante desenvolvimento
 * @returns Objeto contendo imagens otimizadas e estados de carregamento
 */
export const useImageOptimization = (
  originalUrls: string[],
  language: string,
  priorityCount: number = 5,
  bypassCache: boolean = false
): UseImageOptimizationReturn => {
  // ================================
  // Gerenciamento de Estado
  // ================================
  const [images, setImages] = useState<ImageOptimizationState>({
    grid: [],
    solo: []
  })
  const [loading, setLoading] = useState(true)
  const [lazyLoading, setLazyLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ================================
  // Efeito de Carregamento de Imagens
  // ================================
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      setLazyLoading(true)
      setError(null)

      try {
        // FASE 1: Carregar imagens prioritárias primeiro
        const priorityUrls = originalUrls.slice(0, priorityCount)
        const priorityPromises = priorityUrls.map(
          async (originalUrl, index) => {
            let optimizedUrl = originalUrl

            // Adiciona cache-busting para desenvolvimento
            if (bypassCache) {
              optimizedUrl += `?t=${Date.now()}&i=${index}`
            }

            const [validImage] = await batchPreloadImages([optimizedUrl])

            if (validImage) {
              return {
                ...validImage,
                urls: generateOptimizedUrls(originalUrl),
                alt: `Design de imagem ${index + 1}`
              } as OptimizedImageItem
            }
            return null
          }
        )

        const priorityResults = await Promise.all(priorityPromises)
        const validPriorityImages = priorityResults.filter(
          Boolean
        ) as OptimizedImageItem[]

        // Define imagens prioritárias para ambos os contextos grid e solo
        setImages({
          grid: validPriorityImages,
          solo: validPriorityImages
        })

        setLoading(false)

        // FASE 2: Carregar imagens restantes
        if (originalUrls.length > priorityCount) {
          const remainingUrls = originalUrls.slice(priorityCount)
          const remainingPromises = remainingUrls.map(
            async (originalUrl, index) => {
              const actualIndex = index + priorityCount
              let optimizedUrl = originalUrl

              // Adiciona cache-busting para desenvolvimento
              if (bypassCache) {
                optimizedUrl += `?t=${Date.now()}&i=${actualIndex}`
              }

              const [validImage] = await batchPreloadImages([optimizedUrl])

              if (validImage) {
                return {
                  ...validImage,
                  urls: generateOptimizedUrls(originalUrl),
                  alt: `Design de imagem ${actualIndex + 1}`
                } as OptimizedImageItem
              }
              return null
            }
          )

          const remainingResults = await Promise.all(remainingPromises)
          const validRemainingImages = remainingResults.filter(
            Boolean
          ) as OptimizedImageItem[]

          // Adiciona imagens restantes ao estado existente
          setImages((prevImages) => {
            const allImages = [...validPriorityImages, ...validRemainingImages]
            return {
              grid: allImages,
              solo: allImages
            }
          })
        }

        setLazyLoading(false)
      } catch (err) {
        setError('Falha ao carregar imagens.')
        setLoading(false)
        setLazyLoading(false)
      }
    }

    loadImages()
  }, [originalUrls, language, priorityCount, bypassCache])

  // ================================
  // Retorna API do Hook
  // ================================
  return {
    images,
    loading,
    lazyLoading,
    error
  }
}
