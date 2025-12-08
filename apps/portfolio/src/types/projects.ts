// ================================
// PROJECT RELATED TYPES
// ================================

/**
 * Statistics for individual projects
 */
export interface ProjectStats {
  lines: string
  commits: number
  stars: number
  forks: number
}

/**
 * External links for projects
 */
export interface ProjectLinks {
  live?: string
  github?: string
  figma?: string
}

/**
 * Detailed project item interface
 * Used in ProjectDetail.tsx and project-related components
 */
export interface ProjectItem {
  id: string
  title: string
  subtitle: string
  description: string
  coverImage: string
  gallery: string[]
  technologies: string[]
  features: string[]
  metadata: {
    type: string
    createdAt: string
    updatedAt: string
    status: string
    team: string[]
    duration: string
    client: string
  }
  links: ProjectLinks
  stats: ProjectStats
}

/**
 * Basic project data for project covers/grid display
 */
export interface ProjectData {
  id: string
  title: string
  titlePt: string
  url: string
  linkTo: string
}

/**
 * Optimized URLs for different project image sizes
 */
export interface ProjectUrls {
  thumbnail: string
  medium: string
  large: string
  original: string
}

/**
 * Stable translations for project-related text
 */
export interface StableTranslations {
  title: string
  description: string
  error: string
}

/**
 * Props for ProjectDetail page component
 */
export interface ProjectDetailProps {
  projectId?: string
}

/**
 * Props for project grid loader component
 */
export interface ProjectGridLoaderProps {
  count?: number
}
