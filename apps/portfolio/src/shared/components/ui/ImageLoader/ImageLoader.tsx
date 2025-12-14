'use client'

import { ImageLoaderProps } from '@/types'
import React, { useState, useRef, useEffect } from 'react'

// ================================
// UTILITÁRIOS
// ================================

/**
 * Garante que a URL use protocolo HTTPS
 */
const ensureHttps = (url: string): string => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return url
}

/**
 * Adiciona parâmetro cache-busting para prevenir problemas de cache
 */
const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}cb=${Date.now()}`
}

/**
 * Preconnect para domínios de imagens (otimização de performance)
 */
const preconnectImageDomain = (url: string) => {
  try {
    const urlObj = new URL(url)
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = `${urlObj.protocol}//${urlObj.hostname}`
    link.crossOrigin = 'anonymous'
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link)
    }
  } catch {
    // Ignora erros de URL inválida
  }
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Componente ImageLoader otimizado com Intersection Observer, preload inteligente e otimizações de performance
 * Possui lazy loading eficiente, decodificação assíncrona e cache-busting para carregamentos que falharam
 */
export const ImageLoader: React.FC<ImageLoaderProps & { priority?: boolean; sizes?: string; thumbnailUrl?: string }> = ({
  src,
  alt,
  onLoad,
  onError,
  className = '',
  crossOrigin = 'anonymous',
  priority = false,
  sizes,
  thumbnailUrl
}) => {
  // ================================
  // ESTADO E REFS
  // ================================

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Só usa thumbnail se for diferente de src (para evitar loops quando são iguais)
  const hasValidThumbnail = thumbnailUrl && thumbnailUrl !== src
  const initialSrc = hasValidThumbnail ? thumbnailUrl : ensureHttps(src)
  const [imageSrc, setImageSrc] = useState(initialSrc)
  const [shouldLoad, setShouldLoad] = useState(priority) // Carrega imediatamente se for prioridade
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ================================
  // EFEITOS
  // ================================

  useEffect(() => {
    // Garante que a URL inicial use HTTPS
    const httpsUrl = ensureHttps(src)
    
    // Preconnect para domínio da imagem (otimização)
    if (httpsUrl) {
      preconnectImageDomain(httpsUrl)
    }
    
    // Se não tiver thumbnail válido (diferente de src), sempre usar src direto
    if (!hasValidThumbnail) {
      if (imageSrc !== httpsUrl) {
        setImageSrc(httpsUrl)
      }
    }
    // Se tiver thumbnail válido mas já carregou, usar src completo
    else if (isThumbnailLoaded && imageSrc !== httpsUrl) {
      setImageSrc(httpsUrl)
    }
  }, [src, hasValidThumbnail, isThumbnailLoaded])

  // Intersection Observer para lazy loading eficiente com rootMargin otimizado
  useEffect(() => {
    if (priority || shouldLoad) return // Já está carregando ou é prioridade

    // RootMargin maior para conexões rápidas, menor para lentas
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
    const rootMargin = isSlowConnection ? '100px' : '200px' // Carrega mais cedo para conexões rápidas

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin, // Começa a carregar antes de entrar na viewport
        threshold: 0.01 // Dispara quando 1% da imagem está visível
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority, shouldLoad])

  // ================================
  // MANIPULADORES DE EVENTOS
  // ================================

  const handleLoad = () => {
    // Se estiver carregando thumbnail válido, carregar a imagem completa depois
    if (hasValidThumbnail && !isThumbnailLoaded && imageSrc === thumbnailUrl) {
      setIsThumbnailLoaded(true)
      setIsLoading(true) // Continua loading enquanto carrega a versão completa
      // Aguardar um pouco antes de carregar a versão completa para melhor UX
      setTimeout(() => {
        const httpsUrl = ensureHttps(src)
        setImageSrc(httpsUrl)
      }, 100)
      return
    }
    
    // Se não tiver thumbnail válido ou já carregou o thumbnail e agora está carregando a versão completa
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)

    // Tentativa de recuperação: força HTTPS e adiciona cache buster
    const httpsUrl = ensureHttps(src)
    const urlWithCacheBuster = addCacheBuster(httpsUrl)

    // Se ainda não tentamos com cache buster, tenta mais uma vez
    if (!imageSrc.includes('cb=')) {
      setImageSrc(urlWithCacheBuster)
      setHasError(false)
      setIsLoading(true)
      return
    }

    onError?.()
  }

  // ================================
  // FUNÇÕES AUXILIARES DE RENDERIZAÇÃO
  // ================================

  const renderErrorState = () => (
    <div
      className={`flex items-center justify-center bg-transparent dark:bg-transparent ${className}`}
    >
      <div className="text-center p-4">
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          ⚠️ Erro ao carregar
        </div>
      </div>
    </div>
  )

  const renderLoadingState = () => (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-transparent dark:bg-transparent ${className}`}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  )

  // ================================
  // RETORNOS ANTECIPADOS
  // ================================

  if (hasError) {
    return renderErrorState()
  }

  // ================================
  // RENDERIZAÇÃO PRINCIPAL
  // ================================

  // Determina se deve mostrar placeholder blur (só quando tem thumbnail válido e ainda está carregando ele)
  const showBlurPlaceholder = hasValidThumbnail && !isThumbnailLoaded && imageSrc === thumbnailUrl
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {isLoading && !showBlurPlaceholder && renderLoadingState()}

      {shouldLoad && (
        <>
          {/* Placeholder blur enquanto carrega thumbnail */}
          {showBlurPlaceholder && thumbnailUrl && (
            <div 
              className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
              style={{ backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', filter: 'blur(10px)' }}
            />
          )}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            crossOrigin={crossOrigin}
            referrerPolicy="no-referrer-when-downgrade"
            className={`${className} ${
              isLoading && !showBlurPlaceholder
                ? 'opacity-0' 
                : 'opacity-100'
            } transition-opacity duration-300`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            sizes={sizes}
          />
        </>
      )}
    </div>
  )
}
