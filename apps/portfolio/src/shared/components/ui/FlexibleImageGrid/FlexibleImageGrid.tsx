'use client'

import React, { useState, useEffect } from 'react'

import { ImageCard } from '@/shared'
import { ImageItem } from '@/types'

// ================================
// INTERFACES E TIPOS
// ================================

/**
 * Regras adaptáveis para diferentes orientações de imagem
 */
interface AdaptiveRules {
  portrait: { aspectRatio: string; objectFit: string }
  landscape: { aspectRatio: string; objectFit: string }
  square: { aspectRatio: string; objectFit: string }
  ultraWide: { aspectRatio: string; objectFit: string }
  ultraTall: { aspectRatio: string; objectFit: string }
}

/**
 * Props para o componente AdaptiveImageGrid
 */
export interface AdaptiveImageGridProps {
  images?: ImageItem[]
  mode?: 'solo' | 'grid'
  gridColumns?: 2 | 3 | 4 | 5
  adaptiveMode?: 'auto' | 'manual'
  fallbackAspectRatio?:
    | 'auto'
    | 'square'
    | 'portrait'
    | 'landscape'
    | 'wide'
    | 'ultrawide'
    | 'tall'
    | 'photo'
    | 'golden'
    | 'cinema'
    | 'vertical'
    | 'instagram'
    | 'story'
    | 'banner'
    | 'card'
  fallbackObjectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  dominantSide?: 'left' | 'right' | 'none'
  gap?: number
  backgroundColor?: string
  className?: string
  onImageClick?: (image: ImageItem) => void
  onImageLoad?: (image: ImageItem) => void
  onImageError?: (image: ImageItem) => void
  loading?: boolean
  error?: string | null
  adaptiveRules?: AdaptiveRules
}

type ImageOrientation =
  | 'ultraWide'
  | 'landscape'
  | 'square'
  | 'portrait'
  | 'ultraTall'

// ================================
// CONSTANTES E AUXILIARES
// ================================

const defaultAdaptiveRules: AdaptiveRules = {
  portrait: { aspectRatio: 'portrait', objectFit: 'cover' },
  landscape: { aspectRatio: 'landscape', objectFit: 'cover' },
  square: { aspectRatio: 'square', objectFit: 'cover' },
  ultraWide: { aspectRatio: 'ultrawide', objectFit: 'cover' },
  ultraTall: { aspectRatio: 'tall', objectFit: 'cover' }
}

/**
 * Detecta orientação da imagem baseada na proporção largura/altura
 */
const detectImageOrientation = (
  width: number,
  height: number
): ImageOrientation => {
  const ratio = width / height

  if (ratio > 2.5) return 'ultraWide'
  if (ratio > 1.3) return 'landscape'
  if (ratio > 0.9 && ratio < 1.1) return 'square'
  if (ratio > 0.4) return 'portrait'
  return 'ultraTall'
}

/**
 * Mapeia strings de proporção para classes do Tailwind
 */
const getAspectRatioClass = (aspectRatio: string): string => {
  const aspectRatioMap: Record<string, string> = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    ultrawide: 'aspect-[21/9]',
    tall: 'aspect-[2/3]',
    vertical: 'aspect-[9/16]',
    story: 'aspect-[9/16]',
    photo: 'aspect-[5/4]',
    golden: 'aspect-[8/5]',
    cinema: 'aspect-[2/1]',
    banner: 'aspect-[5/1]',
    instagram: 'aspect-square',
    card: 'aspect-[5/6]'
  }

  return aspectRatioMap[aspectRatio] || ''
}

/**
 * Mapeia números de espaçamento para classes do Tailwind
 */
const getGapClass = (gap: number): string => {
  const gapMap: Record<number, string> = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return gapMap[gap] || 'gap-4'
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * Grade de imagens adaptável que ajusta automaticamente o layout baseado nas orientações das imagens
 * Suporta várias configurações de grade e layouts de lado dominante
 */
export const AdaptiveImageGrid: React.FC<AdaptiveImageGridProps> = ({
  images = [],
  mode = 'grid',
  gridColumns = 3,
  adaptiveMode = 'auto',
  fallbackAspectRatio = 'auto',
  fallbackObjectFit = 'cover',
  dominantSide = 'none',
  gap = 4,
  backgroundColor,
  className = '',
  onImageClick,
  onImageLoad,
  onImageError,
  loading = false,
  error = null,
  adaptiveRules = defaultAdaptiveRules
}) => {
  const [validImages, setValidImages] = useState<ImageItem[]>(images)
  const [imageOrientations, setImageOrientations] = useState<
    Record<string, string>
  >({})
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({})

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    setValidImages(images)

    const loadImageDimensions = async () => {
      const orientations: Record<string, string> = {}
      const dimensions: Record<string, { width: number; height: number }> = {}

      for (const image of images) {
        try {
          const img = new Image()
          img.src = image.url

          await new Promise((resolve, reject) => {
            img.onload = () => {
              const orientation = detectImageOrientation(
                img.naturalWidth,
                img.naturalHeight
              )
              orientations[image.id] = orientation
              dimensions[image.id] = {
                width: img.naturalWidth,
                height: img.naturalHeight
              }
              resolve(img)
            }
            img.onerror = reject
          })
        } catch {
          orientations[image.id] = 'square'
          dimensions[image.id] = { width: 100, height: 100 }
        }
      }

      setImageOrientations(orientations)
      setImageDimensions(dimensions)
    }

    loadImageDimensions()
  }, [images])

  // ================================
  // MANIPULADORES
  // ================================

  const handleImageLoad = (image: ImageItem) => {
    onImageLoad?.(image)
  }

  const handleImageError = (image: ImageItem) => {
    setValidImages((prev) => prev.filter((img) => img.id !== image.id))
    onImageError?.(image)
  }

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const getAdaptiveAspectRatio = (imageId: string): string => {
    if (adaptiveMode === 'manual') return fallbackAspectRatio

    const orientation = imageOrientations[imageId]
    if (!orientation) return fallbackAspectRatio

    return (
      adaptiveRules[orientation as keyof AdaptiveRules]?.aspectRatio ||
      fallbackAspectRatio
    )
  }

  const getAdaptiveObjectFit = (imageId: string): string => {
    if (adaptiveMode === 'manual') return fallbackObjectFit

    const orientation = imageOrientations[imageId]
    if (!orientation) return fallbackObjectFit

    return (
      adaptiveRules[orientation as keyof AdaptiveRules]?.objectFit ||
      fallbackObjectFit
    )
  }

  const getGridClass = (): string => {
    if (mode === 'solo') return 'grid grid-cols-1'

    if (gridColumns === 2 && dominantSide !== 'none') {
      // Para modo dominante, usamos flex column ao invés de grid
      return 'flex flex-col'
    }

    const gridMap: Record<number, string> = {
      2: 'grid grid-cols-2',
      3: 'grid grid-cols-3',
      4: 'grid grid-cols-4',
      5: 'grid grid-cols-5'
    }

    return gridMap[gridColumns] || 'grid grid-cols-3'
  }

  /**
   * Calcula a altura mínima para uma linha do grid baseada nas dimensões das imagens
   * Isso garante que todas as imagens na linha tenham a mesma altura (a menor entre elas)
   */
  const getRowHeight = (startIndex: number): number | null => {
    if (mode !== 'grid' || gridColumns === 2 || dominantSide !== 'none') {
      return null
    }

    // Pega as imagens desta linha
    const rowImages = validImages.slice(startIndex, startIndex + gridColumns)
    
    if (rowImages.length === 0) return null

    // Calcula a altura proporcional de cada imagem se todas tiverem a mesma largura
    // A largura de cada célula é 100% / gridColumns
    const heights: number[] = []
    
    for (const img of rowImages) {
      const dims = imageDimensions[img.id]
      if (dims && dims.width > 0) {
        // Proporção: se a largura for 1 unidade, qual seria a altura?
        const aspectRatio = dims.height / dims.width
        heights.push(aspectRatio)
      }
    }

    if (heights.length === 0) return null

    // Retorna a menor altura proporcional (a imagem mais "larga" / menos alta)
    return Math.min(...heights)
  }

  const getGridStyle = (): React.CSSProperties => {
    return {}
  }

  const getDominanceClasses = (
    index: number,
    isInPair: boolean = false
  ): string => {
    if (mode !== 'grid' || gridColumns !== 2 || dominantSide === 'none') {
      return ''
    }

    const pairIndex = Math.floor(index / 2)
    const positionInPair = index % 2
    const isEvenPair = pairIndex % 2 === 0

    const getDominantClasses = (isDominant: boolean): string => {
      if (isDominant) {
        return 'flex-[4] flex items-center justify-center'
      } else {
        return 'flex-[2] flex items-center justify-center'
      }
    }

    if (dominantSide === 'left') {
      const isDominant = positionInPair === 0 ? isEvenPair : !isEvenPair
      return getDominantClasses(isDominant)
    }

    if (dominantSide === 'right') {
      const isDominant = positionInPair === 0 ? !isEvenPair : isEvenPair
      return getDominantClasses(isDominant)
    }

    return ''
  }

  const getAdjustedAspectRatio = (imageId: string, index: number): string => {
    // Remove proporção fixa para grade dominante para permitir ajuste de altura
    if (mode === 'grid' && gridColumns === 2 && dominantSide !== 'none') {
      return 'auto'
    }

    const aspectRatio = getAdaptiveAspectRatio(imageId)
    
    // Para grids (não solo), se o aspect ratio for 'auto', usar o fallback para garantir mesma altura
    if (mode === 'grid' && aspectRatio === 'auto' && fallbackAspectRatio !== 'auto') {
      return fallbackAspectRatio
    }

    return aspectRatio
  }

  const getCenteringClasses = (
    objectFit: string,
    isDominantGrid: boolean
  ): string => {
    if (
      (objectFit === 'scale-down' || objectFit === 'contain') &&
      isDominantGrid
    ) {
      return 'flex items-center justify-center'
    }
    return ''
  }

  // ================================
  // AUXILIARES DE RENDERIZAÇÃO
  // ================================

  const renderImageCard = (
    image: ImageItem,
    index: number,
    isInPair: boolean = false
  ) => {
    const dominanceClasses = getDominanceClasses(index, isInPair)
    const adaptiveAspectRatio = getAdjustedAspectRatio(image.id, index)
    const adaptiveObjectFit = getAdaptiveObjectFit(image.id)
    const aspectClasses = getAspectRatioClass(adaptiveAspectRatio)
    const isDominantGrid =
      mode === 'grid' && gridColumns === 2 && dominantSide !== 'none'

    // Verifica se é o item não dominante
    const pairIndex = Math.floor(index / 2)
    const positionInPair = index % 2
    const isEvenPair = pairIndex % 2 === 0

    let isNonDominant = false
    if (dominantSide === 'left') {
      isNonDominant = positionInPair === 0 ? !isEvenPair : isEvenPair
    } else if (dominantSide === 'right') {
      isNonDominant = positionInPair === 0 ? isEvenPair : !isEvenPair
    }

    const centeringClasses = getCenteringClasses(
      adaptiveObjectFit,
      isDominantGrid
    )

    // Container classes ajustadas para item não dominante
    // Para grids, garantir que todas as imagens tenham a mesma altura
    const isGridMode = mode === 'grid' && gridColumns !== 2 && !isDominantGrid
    const containerClasses = isDominantGrid
      ? isNonDominant
        ? 'w-full h-full flex items-center justify-center' // Não dominante: altura completa com fundo branco
        : 'w-full h-auto' // Dominante: deixa a altura se ajustar automaticamente
      : isGridMode
        ? `w-full h-full ${centeringClasses}` // Grid: usar altura 100% para preencher a célula
        : `${aspectClasses} ${centeringClasses}` // Solo: usar aspect ratio normal

    const imageClasses =
      isDominantGrid && isNonDominant
        ? 'max-w-full max-h-full object-contain' // Não dominante: centralizar e manter proporção
        : isDominantGrid &&
          (adaptiveObjectFit === 'scale-down' || adaptiveObjectFit === 'contain')
          ? 'max-w-full max-h-full'
          : 'w-full h-full'

    // Aplicar background tanto no container quanto no ImageCard
    // Se for imagem não dominante em grid dominante, usar fundo transparente
    const backgroundStyle = isDominantGrid && isNonDominant
      ? { backgroundColor: 'transparent' }
      : backgroundColor
        ? { backgroundColor }
        : {}

    return (
      <div key={image.id} className={dominanceClasses}>
        <div
          className={`${containerClasses} overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            ...backgroundStyle
          }}
        >
          <div 
            className={isDominantGrid && isNonDominant ? 'w-full h-full flex items-center justify-center' : 'w-full h-full'} 
            style={backgroundStyle}
          >
            <ImageCard
              image={image}
              onClick={onImageClick}
              onLoad={handleImageLoad}
              onError={handleImageError}
              isSquare={false}
              objectFit={
                isDominantGrid && isNonDominant
                  ? 'contain' // Não dominante: usar contain para centralizar
                  : isGridMode
                    ? 'cover' // Forçar cover em grids para cortar excesso
                    : (adaptiveObjectFit as any)
              }
              showHoverEffect={false}
              enableHoverScale={false}
              showTitle={false}
              className={imageClasses}
              disableShadow
              priority={index < 6} // Primeiras 6 imagens são prioritárias
            />
          </div>
        </div>
      </div>
    )
  }

  const renderDominantGrid = () => {
    const pairs = []
    for (let i = 0; i < validImages.length; i += 2) {
      const image1 = validImages[i]
      const image2 = validImages[i + 1]

      const backgroundStyle = backgroundColor ? { backgroundColor } : {}

      pairs.push(
        <div key={`pair-${i}`} className="w-full" style={backgroundStyle}>
          <div className={`flex items-stretch ${getGapClass(gap)}`}>
            {renderImageCard(image1, i, true)}
            {image2 && renderImageCard(image2, i + 1, true)}
          </div>
        </div>
      )
    }
    return pairs
  }

  /**
   * Renderiza o grid por linhas, onde cada linha tem altura baseada na menor imagem
   */
  const renderGridRows = () => {
    const rows = []
    
    for (let i = 0; i < validImages.length; i += gridColumns) {
      const rowImages = validImages.slice(i, i + gridColumns)
      const rowHeight = getRowHeight(i)
      
      // Calcula o aspect ratio da linha baseado na menor altura proporcional
      // Se não tiver dimensões ainda, usa um valor padrão
      const rowAspectRatio = rowHeight || 1
      
      rows.push(
        <div 
          key={`row-${i}`} 
          className={`grid ${getGridClass().replace('grid ', '')} ${getGapClass(gap)}`}
          style={{ 
            // Cada célula terá a mesma altura baseada no aspect ratio da menor imagem
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`
          }}
        >
          {rowImages.map((image, idx) => {
            const globalIndex = i + idx
            const dims = imageDimensions[image.id]
            
            return (
              <div 
                key={image.id} 
                className="relative overflow-hidden"
                style={{
                  // Altura proporcional baseada na menor imagem da linha
                  paddingBottom: `${rowAspectRatio * 100}%`
                }}
              >
                <div className="absolute inset-0">
                  {renderImageCardForRow(image, globalIndex)}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
    
    return rows
  }

  /**
   * Renderiza um card de imagem para o grid por linhas (versão simplificada)
   */
  const renderImageCardForRow = (image: ImageItem, index: number) => {
    const backgroundStyle = backgroundColor ? { backgroundColor } : {}

    return (
      <div
        className="w-full h-full overflow-hidden"
        style={{
          backfaceVisibility: 'hidden',
          ...backgroundStyle
        }}
      >
        <ImageCard
          image={image}
          onClick={onImageClick}
          onLoad={handleImageLoad}
          onError={handleImageError}
          isSquare={false}
          objectFit="cover"
          showHoverEffect={false}
          enableHoverScale={false}
          showTitle={false}
          className="w-full h-full"
          disableShadow
          priority={index < 6}
        />
      </div>
    )
  }

  // ================================
  // RENDERIZAÇÃO
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
    return <></>
  }

  const isDominantMode =
    mode === 'grid' && gridColumns === 2 && dominantSide !== 'none'

  return (
    <div className={`w-full ${className}`}>
      {isDominantMode ? (
        <div className={`${getGridClass()} ${getGapClass(gap)}`}>
          {renderDominantGrid()}
        </div>
      ) : mode === 'grid' && gridColumns >= 2 && dominantSide === 'none' ? (
        // Para grids de 2+ colunas, renderizar por linhas para garantir mesma altura
        <div className={`flex flex-col ${getGapClass(gap)}`}>
          {renderGridRows()}
        </div>
      ) : (
        <div className={`${getGridClass()} ${getGapClass(gap)}`} style={getGridStyle()}>
          {validImages.map((image, index) => renderImageCard(image, index))}
        </div>
      )}
    </div>
  )
}

// ================================
// COMPONENTES DE CONVENIÊNCIA
// ================================

export const AdaptiveSoloGrid: React.FC<
  Omit<AdaptiveImageGridProps, 'mode'>
> = (props) => <AdaptiveImageGrid {...props} mode="solo" />

export const AdaptiveTwoColumnGrid: React.FC<
  Omit<AdaptiveImageGridProps, 'mode' | 'gridColumns'>
> = (props) => <AdaptiveImageGrid {...props} mode="grid" gridColumns={2} />

export const AdaptiveThreeColumnGrid: React.FC<
  Omit<AdaptiveImageGridProps, 'mode' | 'gridColumns'>
> = (props) => <AdaptiveImageGrid {...props} mode="grid" gridColumns={3} />

export const AdaptiveFourColumnGrid: React.FC<
  Omit<AdaptiveImageGridProps, 'mode' | 'gridColumns'>
> = (props) => <AdaptiveImageGrid {...props} mode="grid" gridColumns={4} />

export const AdaptiveFiveColumnGrid: React.FC<
  Omit<AdaptiveImageGridProps, 'mode' | 'gridColumns'>
> = (props) => <AdaptiveImageGrid {...props} mode="grid" gridColumns={5} />
