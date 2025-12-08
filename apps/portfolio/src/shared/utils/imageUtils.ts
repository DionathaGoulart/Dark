import { ImageItem } from '@/types'

// ================================
// Constantes
// ================================

/** Timeout padrão para pré-carregamento de imagens (em milissegundos) */
const IMAGE_PRELOAD_TIMEOUT = 10000

// ================================
// Utilitários de Geração de ID
// ================================

/**
 * Gera um identificador único para uma imagem
 * @param url - A URL da imagem
 * @param index - Índice opcional para identificação sequencial
 * @returns String de ID único da imagem
 */
export const generateImageId = (url: string, index?: number): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `img-${index ?? 0}-${timestamp}-${random}`
}

// ================================
// Utilitários de Validação de URL
// ================================

/**
 * Valida se uma string é uma URL de imagem HTTP/HTTPS válida
 * @param url - String da URL para validar
 * @returns True se for uma URL HTTP/HTTPS válida, false caso contrário
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// ================================
// Utilitários de Criação de Imagem
// ================================

/**
 * Cria um objeto ImageItem a partir de uma URL
 * @param url - URL da imagem
 * @param index - Índice opcional para identificação e texto alternativo
 * @returns ImageItem com ID gerado e propriedades básicas
 */
export const createImageFromUrl = (url: string, index?: number): ImageItem => {
  const imageNumber = (index ?? 0) + 1

  return {
    id: generateImageId(url, index),
    url,
    alt: `Imagem ${imageNumber}`,
    title: `Imagem ${imageNumber}`,
    urls: undefined
  }
}

/**
 * Cria um array de objetos ImageItem a partir de strings de URL
 * Filtra URLs inválidas e cria objetos ImageItem apropriados
 * @param urls - Array de strings de URL de imagem
 * @returns Array de objetos ImageItem válidos
 */
export const createImagesFromUrls = (urls: string[]): ImageItem[] => {
  return urls
    .filter((url) => url.trim() && isValidImageUrl(url.trim()))
    .map((url, index) => createImageFromUrl(url.trim(), index))
}

// ================================
// Utilitários de Dimensão de Imagem
// ================================

/**
 * Obtém as dimensões naturais de uma imagem
 * @param url - URL da imagem para medir
 * @returns Promise que resolve para largura e altura em pixels
 */
export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = reject
    img.src = url
  })
}

// ================================
// Utilitários de Pré-carregamento de Imagem
// ================================

/**
 * Pré-carrega uma única imagem e retorna o status de sucesso
 * @param url - URL da imagem para pré-carregar
 * @returns Promise que resolve para true se carregada com sucesso, false caso contrário
 */
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url

    // Fallback de timeout
    setTimeout(() => resolve(false), IMAGE_PRELOAD_TIMEOUT)
  })
}

/**
 * Pré-carrega múltiplas imagens em paralelo e retorna as carregadas com sucesso
 * @param urls - Array de URLs de imagem para pré-carregar
 * @returns Promise que resolve para array de objetos ImageItem das imagens carregadas com sucesso
 */
export const batchPreloadImages = async (
  urls: string[]
): Promise<ImageItem[]> => {
  const results = await Promise.allSettled(
    urls.map(async (url, index) => {
      const isValid = await preloadImage(url)

      if (isValid) {
        return createImageFromUrl(url, index)
      }

      throw new Error(`Falha ao carregar: ${url}`)
    })
  )

  return results
    .filter(
      (result): result is PromiseFulfilledResult<ImageItem> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value)
}
