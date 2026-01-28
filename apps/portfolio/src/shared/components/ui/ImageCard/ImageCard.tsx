'use client'


import React, { useState, memo } from 'react'
import Image from 'next/image'
import { ImageCardPropsExtended } from '@/types'
import supabaseLoader from '@/lib/imageLoader'

const OBJECT_FIT_CLASSES = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  'scale-down': 'object-scale-down',
  none: 'object-none'
} as const

export const ImageCard: React.FC<ImageCardPropsExtended & { priority?: boolean, autoHeight?: boolean }> = memo(({
  image,
  onClick,
  onLoad,
  onError,
  className = '',
  isSquare = false,
  showHoverEffect = false,
  objectFit = 'cover',
  showTitle = true,
  disableShadow = false,
  priority = false,
  autoHeight = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!isVisible) return null

  const objectFitClass = OBJECT_FIT_CLASSES[objectFit] || 'object-cover'
  const hasAspectClass = className.includes('aspect-')
  // Se autoHeight for true, não aplicamos aspect-ratio padrão nem fill
  const containerClasses = autoHeight
    ? className
    : `${isSquare ? 'aspect-square' : hasAspectClass ? '' : 'aspect-[4/5]'} ${className}`.trim()

  const handleClick = () => onClick?.(image)
  const handleError = () => { setIsVisible(false); onError?.(image) }
  const handleLoad = () => { setIsLoaded(true); onLoad?.(image) }

  return (
    <div
      className={`group relative overflow-hidden w-full h-full ${onClick ? 'cursor-pointer' : ''} ${containerClasses}`}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick() : undefined}
      style={showHoverEffect ? { transform: 'translateZ(0)' } : undefined}
    >
      <div
        className={`relative w-full h-full ${disableShadow ? '' : 'shadow-lg'} ${showHoverEffect ? 'group-hover:shadow-xl' : ''}`}
        style={showHoverEffect ? { transition: 'box-shadow 200ms' } : undefined}
      >
        {autoHeight ? (
          <Image
            src={image.url}
            alt={image.alt || ''}
            width={0}
            height={0}
            sizes={sizes}
            className={`w-full h-auto ${showHoverEffect ? 'group-hover:scale-105 group-hover:brightness-90' : ''} transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              width: '100%',
              height: 'auto',
              ...(showHoverEffect ? { transition: 'transform 200ms, filter 200ms, opacity 300ms', willChange: 'transform' } : {})
            }}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            quality={85}
            loader={supabaseLoader}
          />
        ) : (
          <Image
            src={image.url}
            alt={image.alt || ''}
            fill
            sizes={sizes}
            className={`${objectFitClass} ${showHoverEffect ? 'group-hover:scale-105 group-hover:brightness-90' : ''} transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={showHoverEffect ? { transition: 'transform 200ms, filter 200ms, opacity 300ms', willChange: 'transform' } : undefined}
            priority={priority}
            onLoad={handleLoad}
            onError={handleError}
            quality={85}
            loader={supabaseLoader}
          />
        )}

        {/* Skeleton de carregamento */}
        {!isLoaded && !autoHeight && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        )}
        {/* Skeleton para autoHeight (altura mínima) */}
        {!isLoaded && autoHeight && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse min-h-[200px]" />
        )}

        {showHoverEffect && image.title && showTitle && (
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100"
            style={{ transition: 'opacity 200ms' }}
          >
            <h3 className="text-white font-semibold text-lg">{image.title}</h3>
          </div>
        )}
      </div>
    </div>
  )
})

ImageCard.displayName = 'ImageCard'
