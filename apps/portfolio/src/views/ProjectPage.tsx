'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  AdaptiveSoloGrid,
  AdaptiveTwoColumnGrid,
  AdaptiveThreeColumnGrid,
  AdaptiveFiveColumnGrid,
  ModalZoom
} from '@/shared'
import { useI18n } from '@/core/providers'
import type { Project, ProjectImage } from '@/lib/api/portfolio'
import { ImageItem } from '@/types'

// ================================
// INTERFACES & TYPES
// ================================

interface ProjectPageProps {
  project: Project
  images: ProjectImage[]
}

interface GridSection {
  component: React.ReactNode
  imageIndices: number[]
  context: 'grid' | 'solo'
  loadingComponent: React.ReactNode
  containerClass?: string
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Converte ProjectImage para ImageItem
 */
const convertToImageItem = (img: ProjectImage, index: number): ImageItem => ({
  id: img.id,
  url: img.image_url,
  urls: {
    original: img.image_url,
    thumbnail: img.image_url,
    medium: img.image_url,
    large: img.image_url
  },
  title: img.alt_text_pt || img.alt_text_en || '',
  alt: img.alt_text_pt || img.alt_text_en || ''
})

/**
 * Mapeia aspect_ratio para classes Tailwind
 */
const getAspectRatioClass = (aspectRatio?: string): string => {
  switch (aspectRatio) {
    case 'square':
      return 'aspect-square'
    case 'wide':
      return 'aspect-video'
    case 'portrait':
      return 'aspect-[3/4]'
    case 'card':
      return 'aspect-[4/5]'
    case 'cinema':
      return 'aspect-[21/9]'
    case 'tall':
      return 'aspect-[9/16]'
    default:
      return 'aspect-auto'
  }
}

/**
 * Cria seções de grid baseado no layout_type e grid_group_id das imagens
 * Agrupa imagens que pertencem ao mesmo grid_group_id
 */
const createGridSections = (
  images: ImageItem[],
  projectImages: ProjectImage[],
  onImageClick: (image: ImageItem) => void,
  onImageError: (image: ImageItem) => void,
  language: string
): GridSection[] => {
  const sections: GridSection[] = []
  const processedIndices = new Set<number>()

  // Agrupar imagens por grid_group_id
  const groups = new Map<string, { images: ImageItem[], projectImages: ProjectImage[], indices: number[] }>()
  const soloImages: { image: ImageItem, projectImage: ProjectImage, index: number }[] = []

  projectImages.forEach((projectImg, index) => {
    if (processedIndices.has(index)) return

    if (projectImg.grid_group_id) {
      // É parte de um grid - agrupar todas as imagens com o mesmo grid_group_id
      if (!groups.has(projectImg.grid_group_id)) {
        groups.set(projectImg.grid_group_id, { images: [], projectImages: [], indices: [] })
      }
      
      const group = groups.get(projectImg.grid_group_id)!
      group.images.push(images[index])
      group.projectImages.push(projectImg)
      group.indices.push(index)
      processedIndices.add(index)
    } else if (!projectImg.layout_type || projectImg.layout_type === 'solo') {
      // É solo (sem grid_group_id e layout_type é solo ou null)
      soloImages.push({ image: images[index], projectImage: projectImg, index })
      processedIndices.add(index)
    }
  })

  // Processar grupos de grid
  groups.forEach((group, groupId) => {
    // Encontrar a primeira imagem do grupo que tem layout_type definido
    const firstImageWithLayout = group.projectImages.find(img => img.layout_type) || group.projectImages[0]
    const layoutType = firstImageWithLayout.layout_type || 'solo'
    const aspectRatio = firstImageWithLayout.aspect_ratio || 'auto'
    const objectFit = firstImageWithLayout.object_fit || 'cover'

    if (layoutType === 'grid-2' && group.images.length >= 2) {
      // Processar em pares
      for (let i = 0; i < group.images.length; i += 2) {
        if (i + 1 < group.images.length) {
          const gridImages = group.images.slice(i, i + 2)
          sections.push({
            component: (
              <AdaptiveTwoColumnGrid
                images={gridImages}
                adaptiveMode="manual"
                fallbackAspectRatio={aspectRatio}
                fallbackObjectFit={objectFit}
                onImageClick={onImageClick}
                onImageError={onImageError}
                gap={1}
              />
            ),
            imageIndices: group.indices.slice(i, i + 2),
            context: 'grid',
            loadingComponent: (
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 2 }, (_, j) => (
                  <div key={j} className={`${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
                ))}
              </div>
            ),
            containerClass: 'mb-12 sm:px-16'
          })
        } else {
          // Imagem solitária no final
          sections.push({
            component: (
              <AdaptiveSoloGrid
                images={[group.images[i]]}
                adaptiveMode="manual"
                fallbackAspectRatio={aspectRatio}
                fallbackObjectFit={objectFit}
                onImageClick={onImageClick}
                onImageError={onImageError}
                gap={1}
              />
            ),
            imageIndices: [group.indices[i]],
            context: 'solo',
            loadingComponent: (
              <div className={`max-w-2xl mx-auto ${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
            ),
            containerClass: 'mb-12'
          })
        }
      }
    } else if (layoutType === 'grid-3' && group.images.length >= 3) {
      // Processar em grupos de 3
      for (let i = 0; i < group.images.length; i += 3) {
        if (i + 2 < group.images.length) {
          const gridImages = group.images.slice(i, i + 3)
          sections.push({
            component: (
              <AdaptiveThreeColumnGrid
                images={gridImages}
                adaptiveMode="manual"
                fallbackAspectRatio={aspectRatio}
                fallbackObjectFit={objectFit}
                onImageClick={onImageClick}
                onImageError={onImageError}
                gap={1}
              />
            ),
            imageIndices: group.indices.slice(i, i + 3),
            context: 'grid',
            loadingComponent: (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className={`${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
                ))}
              </div>
            ),
            containerClass: 'mb-12 sm:px-16'
          })
        } else {
          // Imagens restantes como solo
          const remaining = group.images.slice(i)
          remaining.forEach((img, idx) => {
            sections.push({
              component: (
                <AdaptiveSoloGrid
                  images={[img]}
                  adaptiveMode="manual"
                  fallbackAspectRatio={aspectRatio}
                  fallbackObjectFit={objectFit}
                  onImageClick={onImageClick}
                  onImageError={onImageError}
                  gap={1}
                />
              ),
              imageIndices: [group.indices[i + idx]],
              context: 'solo',
              loadingComponent: (
                <div className={`max-w-2xl mx-auto ${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
              ),
              containerClass: 'mb-12'
            })
          })
        }
      }
    } else if (layoutType === 'grid-5' && group.images.length >= 5) {
      // Processar em grupos de 5
      for (let i = 0; i < group.images.length; i += 5) {
        if (i + 4 < group.images.length) {
          const gridImages = group.images.slice(i, i + 5)
          sections.push({
            component: (
              <AdaptiveFiveColumnGrid
                images={gridImages}
                adaptiveMode="manual"
                fallbackAspectRatio={aspectRatio}
                fallbackObjectFit={objectFit}
                onImageClick={onImageClick}
                onImageError={onImageError}
                gap={1}
              />
            ),
            imageIndices: group.indices.slice(i, i + 5),
            context: 'grid',
            loadingComponent: (
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className={`${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
                ))}
              </div>
            ),
            containerClass: 'mb-12 sm:px-16'
          })
        } else {
          // Imagens restantes como solo
          const remaining = group.images.slice(i)
          remaining.forEach((img, idx) => {
            sections.push({
              component: (
                <AdaptiveSoloGrid
                  images={[img]}
                  adaptiveMode="manual"
                  fallbackAspectRatio={aspectRatio}
                  fallbackObjectFit={objectFit}
                  onImageClick={onImageClick}
                  onImageError={onImageError}
                  gap={1}
                />
              ),
              imageIndices: [group.indices[i + idx]],
              context: 'solo',
              loadingComponent: (
                <div className={`max-w-2xl mx-auto ${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
              ),
              containerClass: 'mb-12'
            })
          })
        }
      }
    } else {
      // Se não houver imagens suficientes ou layout inválido, tratar como solo
      group.images.forEach((img, idx) => {
        sections.push({
          component: (
            <AdaptiveSoloGrid
              images={[img]}
              adaptiveMode="manual"
              fallbackAspectRatio={aspectRatio}
              fallbackObjectFit={objectFit}
              onImageClick={onImageClick}
              onImageError={onImageError}
              gap={1}
            />
          ),
          imageIndices: [group.indices[idx]],
          context: 'solo',
          loadingComponent: (
            <div className={`max-w-2xl mx-auto ${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
          ),
          containerClass: 'mb-12'
        })
      })
    }
  })

  // Processar imagens solo (ordenadas por order_index)
  soloImages
    .sort((a, b) => a.projectImage.order_index - b.projectImage.order_index)
    .forEach(({ image, projectImage, index }) => {
      const aspectRatio = projectImage.aspect_ratio || 'auto'
      const objectFit = projectImage.object_fit || 'cover'

      sections.push({
        component: (
          <AdaptiveSoloGrid
            images={[image]}
            adaptiveMode="manual"
            fallbackAspectRatio={aspectRatio}
            fallbackObjectFit={objectFit}
            onImageClick={onImageClick}
            onImageError={onImageError}
            gap={1}
          />
        ),
        imageIndices: [index],
        context: 'solo',
        loadingComponent: (
          <div className={`max-w-2xl mx-auto ${getAspectRatioClass(aspectRatio)} bg-gray-200 dark:bg-gray-800 animate-pulse`} />
        ),
        containerClass: 'mb-12'
      })
    })

  // Ordenar seções por order_index da primeira imagem
  sections.sort((a, b) => {
    const aIndex = Math.min(...a.imageIndices)
    const bIndex = Math.min(...b.imageIndices)
    return aIndex - bIndex
  })

  return sections
}

// ================================
// MAIN COMPONENT
// ================================

export const ProjectPage: React.FC<ProjectPageProps> = ({ project, images: projectImages }) => {
  const { language } = useI18n()
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

  // Filtrar apenas imagens ativas e ordenar
  const activeImages = useMemo(() => {
    return projectImages
      .filter(img => img.is_active)
      .sort((a, b) => a.order_index - b.order_index)
  }, [projectImages])

  // Converter ProjectImage para ImageItem diretamente
  const images = useMemo(() => {
    return activeImages.map((img, idx) => {
      const altText = language === 'pt' 
        ? (img.alt_text_pt || img.alt_text_en || '')
        : (img.alt_text_en || img.alt_text_pt || '')
      
      return {
        id: img.id,
        url: img.image_url,
        urls: {
          original: img.image_url,
          thumbnail: img.image_url,
          medium: img.image_url,
          large: img.image_url
        },
        title: altText,
        alt: altText
      } as ImageItem
    })
  }, [activeImages, language])

  const [loading, setLoading] = useState(false)
  const [lazyLoading, setLazyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handlers definidos antes do useMemo
  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image)
  }

  const handleImageError = (image: ImageItem) => {
    console.error(`Falha ao carregar a imagem: ${image.url}`)
  }

  // Criar seções de grid baseado no layout_type
  const gridSections = useMemo(() => {
    if (images.length === 0) return []
    
    return createGridSections(
      images,
      activeImages,
      handleImageClick,
      handleImageError,
      language
    )
  }, [images, activeImages, language])

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    const title = language === 'pt' ? project.title_pt : project.title_en
    document.title = `${title} - Dark`
  }, [project, language])

  // ================================
  // HANDLERS
  // ================================

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  // ================================
  // RENDER
  // ================================

  if (error) {
    return (
      <div className="py-12 md:py-16">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">Erro ao carregar imagens: {error}</p>
        </div>
      </div>
    )
  }

  const title = language === 'pt' ? project.title_pt : project.title_en
  const description = language === 'pt' ? project.description_pt : project.description_en

  return (
    <div className="py-12 md:py-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Projeto */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-black dark:text-primary-white mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-primary-black/70 dark:text-primary-white/70 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Grid Sections */}
        <div className="space-y-8">
          {loading && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && gridSections.map((section, index) => (
            <div key={index} className={section.containerClass || ''}>
              {lazyLoading && index === gridSections.length - 1 ? (
                section.loadingComponent
              ) : (
                section.component
              )}
            </div>
          ))}

          {!loading && gridSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-black/70 dark:text-primary-white/70">
                Nenhuma imagem disponível para este projeto.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedImage && (
        <ModalZoom image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  )
}

