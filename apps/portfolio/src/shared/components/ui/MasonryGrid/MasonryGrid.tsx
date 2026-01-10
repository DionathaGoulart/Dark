'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ImageCard } from '@/shared'
import { ImageItem, MasonryGridProps, MasonryGridPropsExtended } from '@/types'

// ================================
// UTILITÁRIOS
// ================================

/**
 * Utilitário de debounce para otimizar eventos de redimensionamento
 */
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

// ================================
// HOOKS CUSTOMIZADOS
// ================================

/**
 * Hook para gerenciar colunas responsivas baseado na largura da tela
 */
const useResponsiveColumns = (columnCount: MasonryGridProps['columnCount']) => {
  const getInitialColumns = () => {
    if (typeof window === 'undefined') return columnCount?.lg || 3

    const width = window.innerWidth
    if (width < 640) return columnCount?.sm || 1
    if (width < 1024) return columnCount?.md || 2
    if (width < 1280) return columnCount?.lg || 3
    return columnCount?.xl || 4
  }

  const [columns, setColumns] = useState(getInitialColumns)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      let newCols = columnCount?.lg || 3

      if (width < 640) newCols = columnCount?.sm || 1
      else if (width < 1024) newCols = columnCount?.md || 2
      else if (width < 1280) newCols = columnCount?.lg || 3
      else newCols = columnCount?.xl || 4

      setColumns((prev) => (prev !== newCols ? newCols : prev))
    }

    const debouncedUpdate = debounce(updateColumns, 150)
    window.addEventListener('resize', debouncedUpdate)
    return () => window.removeEventListener('resize', debouncedUpdate)
  }, [columnCount])

  return columns
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Componente MasonryGrid para exibir imagens em layout de alvenaria
 * Suporta colunas responsivas, efeitos de hover e vários modos de ajuste de imagem
 */
export const MasonryGrid: React.FC<MasonryGridPropsExtended> = ({
  images = [],
  columnCount = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = '',
  onImageClick,
  onImageLoad,
  onImageError,
  loading = false,
  error = null,
  isSquareGrid = false,
  showHoverEffect = false,
  objectFit = 'cover',
  emptyMessage,
  autoHeight = false
}) => {
  // ================================
  // ESTADO E REFS
  // ================================

  const [validImages, setValidImages] = useState<ImageItem[]>(images)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentColumns = useResponsiveColumns(columnCount)

  // ================================
  // EFEITOS
  // ================================

  useEffect(() => {
    setValidImages(images)
  }, [images])

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const distributedColumns = useMemo(() => {
    if (validImages.length === 0 || currentColumns === 0) return []

    const columns: ImageItem[][] = Array.from(
      { length: currentColumns },
      () => []
    )

    validImages.forEach((image, index) => {
      columns[index % currentColumns].push(image)
    })

    return columns
  }, [validImages, currentColumns])

  const gapClasses = useMemo(
    () => ({
      container: `-m-${gap}`,
      item: `p-${gap}`
    }),
    [gap]
  )

  // ================================
  // MANIPULADORES DE EVENTOS
  // ================================

  const handleImageLoad = (image: ImageItem) => onImageLoad?.(image)

  const handleImageError = (image: ImageItem) => {
    setValidImages((prev) => prev.filter((img) => img.id !== image.id))
    onImageError?.(image)
  }

  // ================================
  // RETORNOS ANTECIPADOS
  // ================================

  if (error) {
    return (
      <div
        className={`w-full flex items-center justify-center p-8 ${className}`}
      >
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-lg mb-2">
            ⚠️ Erro ao carregar imagens
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (validImages.length === 0 && !loading) {
    return (
      <div
        className={`w-full flex items-center justify-center p-8 ${className}`}
      >
        <div className="text-center">
          <div className="text-gray-700 dark:text-gray-300 text-lg">
            {emptyMessage || '📷 Nenhuma imagem disponível'}
          </div>
        </div>
      </div>
    )
  }

  // ================================
  // RENDERIZAÇÃO PRINCIPAL
  // ================================

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <div className={`flex ${gapClasses.container}`}>
        {distributedColumns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col">
            {columnImages.map((image) => (
              <div key={image.id} className={`w-full ${gapClasses.item}`}>
                <ImageCard
                  image={image}
                  onClick={onImageClick}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  isSquare={isSquareGrid}
                  showHoverEffect={showHoverEffect}
                  objectFit={objectFit}
                  autoHeight={autoHeight}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
