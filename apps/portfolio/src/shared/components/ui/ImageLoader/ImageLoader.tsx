'use client'

import { ImageLoaderProps } from '@/types'
import React from 'react'

export const ImageLoader: React.FC<ImageLoaderProps & { priority?: boolean }> = ({
  src,
  alt,
  onLoad,
  onError,
  className = '',
  priority = false
}) => {
  return (
    <img // eslint-disable-line @next/next/no-img-element
      src={src}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="sync"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}
