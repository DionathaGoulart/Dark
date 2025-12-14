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
export const ImageLoader: React.FC<ImageLoaderProps & { priority?: boolean; sizes?: string }> = ({
  src,
  alt,
  onLoad,
  onError,
  className = '',
  crossOrigin = 'anonymous',
  priority = false,
  sizes
}) => {
  // ================================
  // ESTADO E REFS
  // ================================

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [shouldLoad, setShouldLoad] = useState(priority) // Carrega imediatamente se for prioridade
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ================================
  // EFEITOS
  // ================================

  useEffect(() => {
    // Garante que a URL inicial use HTTPS
    const httpsUrl = ensureHttps(src)
    if (httpsUrl !== imageSrc) {
      setImageSrc(httpsUrl)
    }
    
    // Preconnect para domínio da imagem (otimização)
    if (httpsUrl) {
      preconnectImageDomain(httpsUrl)
    }
  }, [src, imageSrc])

  // Intersection Observer para lazy loading eficiente
  useEffect(() => {
    if (priority || shouldLoad) return // Já está carregando ou é prioridade

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
        rootMargin: '50px' // Começa a carregar 50px antes de entrar na viewport
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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {isLoading && renderLoadingState()}

      {shouldLoad && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          crossOrigin={crossOrigin}
          referrerPolicy="no-referrer-when-downgrade"
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
        />
      )}
    </div>
  )
}
