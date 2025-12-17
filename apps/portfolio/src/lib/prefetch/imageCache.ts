'use client'

// Cache de imagens em memória - persiste enquanto a página estiver aberta
const imageCache = new Map<string, HTMLImageElement>()

/**
 * Preload de uma imagem e guarda no cache em memória
 */
export const preloadImage = (url: string): Promise<void> => {
  if (!url || imageCache.has(url)) return Promise.resolve()

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(url, img)
      resolve()
    }
    img.onerror = () => resolve() // Ignora erros
    img.src = url
  })
}

/**
 * Preload de múltiplas imagens
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.filter(Boolean).map(preloadImage))
}

/**
 * Verifica se uma imagem está no cache
 */
export const isImageCached = (url: string): boolean => {
  return imageCache.has(url)
}

/**
 * Obtém imagem do cache
 */
export const getCachedImage = (url: string): HTMLImageElement | undefined => {
  return imageCache.get(url)
}

/**
 * Tamanho do cache
 */
export const getCacheSize = (): number => {
  return imageCache.size
}

