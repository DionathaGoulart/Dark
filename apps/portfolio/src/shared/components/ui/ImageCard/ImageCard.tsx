'use client'

/* eslint-disable react/prop-types */
import React, { useState, memo } from 'react'
import { ImageLoader } from '@/shared'
import { ImageCardPropsExtended } from '@/types'

const OBJECT_FIT_CLASSES = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  'scale-down': 'object-scale-down',
  none: 'object-none'
} as const

export const ImageCard: React.FC<ImageCardPropsExtended & { priority?: boolean }> = memo(({
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
  priority = false
}) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const objectFitClass = OBJECT_FIT_CLASSES[objectFit]
  const imageClasses = `${isSquare ? 'w-full h-full' : 'w-full h-auto'} ${objectFitClass}`

  const handleClick = () => onClick?.(image)
  const handleError = () => { setIsVisible(false); onError?.(image) }

  return (
    <div
      className={`group ${onClick ? 'cursor-pointer' : ''} ${className} ${isSquare ? 'aspect-square' : 'w-full'}`}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick() : undefined}
      style={showHoverEffect ? { transform: 'translateZ(0)' } : undefined}
    >
      <div 
        className={`relative overflow-hidden ${disableShadow ? '' : 'shadow-lg'} w-full h-full ${showHoverEffect ? 'group-hover:shadow-xl' : ''}`}
        style={showHoverEffect ? { transition: 'box-shadow 200ms' } : undefined}
      >
        <img
          src={image.url}
          alt={image.alt || ''}
          className={`${imageClasses} ${showHoverEffect ? 'group-hover:scale-105 group-hover:brightness-90' : ''}`}
          style={showHoverEffect ? { transition: 'transform 200ms, filter 200ms', willChange: 'transform' } : undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => onLoad?.(image)}
          onError={handleError}
        />
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
