/**
 * Utilitário para preload de imagens prioritárias
 * Otimiza o carregamento inicial da página
 */

/**
 * Preload de uma única imagem
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.crossOrigin = 'anonymous'
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to preload: ${url}`))
    
    document.head.appendChild(link)
  })
}

/**
 * Preload de múltiplas imagens em paralelo
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url).catch(() => {
    // Ignora erros individuais, continua com outras imagens
    console.warn(`Failed to preload image: ${url}`)
  }))
  
  await Promise.all(promises)
}

/**
 * Preconnect para domínios de imagens (otimização de DNS)
 */
export const preconnectImageDomain = (url: string): void => {
  try {
    const urlObj = new URL(url)
    const domain = `${urlObj.protocol}//${urlObj.hostname}`
    
    // Verifica se já existe preconnect
    if (document.querySelector(`link[href="${domain}"]`)) {
      return
    }
    
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  } catch {
    // Ignora erros de URL inválida
  }
}

