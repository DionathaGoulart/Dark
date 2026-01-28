'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { trackEvent } from '@/features/analytics'
import {
  MasonryGrid,
  useDocumentTitle,
  startNavigationLoading
} from '@/shared'
import { useI18n } from '@/core/providers'
import {
  ImageItem,
  ProjectUrls
} from '@/types'
import type { Project } from '@/lib/api/portfolio'
import { useProjects } from '@/lib/prefetch'

// ================================
// CONSTANTS
// ================================

const GRID_COLUMN_CONFIG = {
  sm: 1,
  md: 2,
  lg: 2,
  xl: 4
} as const

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Generates URLs for different project image sizes (using original URL from Supabase Storage)
 */
const generateProjectUrls = (originalUrl: string): ProjectUrls => ({
  thumbnail: originalUrl,
  medium: originalUrl,
  large: originalUrl,
  original: originalUrl
})

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Converte projetos do servidor para ImageItems
 */
const convertProjectsToImages = (
  projects: Project[],
  language: string
): ImageItem[] => {
  return projects.map((project) => ({
    id: project.id,
    url: project.cover_image_url || '',
    alt: language === 'pt' ? project.title_pt : project.title_en,
    title: language === 'pt' ? project.title_pt : project.title_en,
    linkTo: `/projects/${project.slug}`,
    urls: generateProjectUrls(project.cover_image_url || '')
  }))
}

/**
 * Custom hook to handle project interactions
 */
const useProjectHandlers = (
  router: ReturnType<typeof useRouter>,
  language: string
) => {
  const handleProjectClick = (image: ImageItem) => {
    trackEvent({
      event_name: 'project_click',
      event_parameters: {
        project_id: image.id,
        project_title: image.title || 'untitled',
        project_link: image.linkTo || 'unknown',
        language: language,
        action: 'navigate_to_project'
      }
    })

    if (image.linkTo) {
      startNavigationLoading()
      router.push(image.linkTo)
    } else {
      startNavigationLoading()
      router.push(`/projects/${image.id}`)
      console.warn(`Project ${image.id} missing linkTo definition`)
    }
  }

  const handleImageError = (image: ImageItem) => {
    console.error(`Error loading cover: ${image.id}`)

    trackEvent({
      event_name: 'project_image_error',
      event_parameters: {
        project_id: image.id,
        error_type: 'project_cover_display_failure'
      }
    })
  }

  return { handleProjectClick, handleImageError }
}

// ================================
// MAIN COMPONENT
// ================================

interface ProjectsPageProps {
  projects?: Project[]
}

/**
 * Projects page component with optimized image loading and responsive grid.
 * Usa dados do servidor + cache do sessionStorage para navegação instantânea
 */
export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects = [] }) => {
  const { language } = useI18n()
  const router = useRouter()

  // Usa dados do servidor ou do cache
  const { data: cachedProjects } = useProjects(projects)
  const sourceProjects = (cachedProjects || projects) as Project[]

  useDocumentTitle('projects')

  // Converte projetos para ImageItems (memoizado para evitar recálculos)
  const images = useMemo(
    () => convertProjectsToImages(sourceProjects, language),
    [sourceProjects, language]
  )

  const { handleProjectClick, handleImageError } = useProjectHandlers(
    router,
    language
  )

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    trackEvent({
      event_name: 'page_view_projects',
      event_parameters: {
        page_title: 'Projects - Portfolio',
        projects_total: images.length,
        language: language,
        content_type: 'project_gallery'
      }
    })
  }, [language, images.length])

  // ================================
  // RENDER
  // ================================

  return (
    <div className="py-12 md:py-16 min-h-screen bg-primary-white dark:bg-primary-black transition-colors duration-300">
      <section className="pb-8 px-6 sm:px-8 lg:px-12">
        <MasonryGrid
          images={images}
          loading={false}
          error={null}
          onImageClick={handleProjectClick}
          onImageError={handleImageError}
          columnCount={GRID_COLUMN_CONFIG}
          gap={3}
          isSquareGrid={true}
          showHoverEffect
          emptyMessage={language === 'pt' ? 'Nenhum projeto disponível' : 'No projects available'}
        />
      </section>

      <div className="mt-16 w-32 h-0.5 bg-primary-black dark:bg-primary-white mx-auto" />
    </div>
  )
}
