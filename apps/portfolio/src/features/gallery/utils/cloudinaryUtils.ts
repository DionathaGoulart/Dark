import { CloudinaryOptions, OptimizedUrls } from '../types'

// ================================
// Constantes
// ================================

const CLOUDINARY_BASE_URL =
  'https://res.cloudinary.com/dlaxva1qb/image/upload/v1751235158'

const DEFAULT_CLOUDINARY_OPTIONS: CloudinaryOptions = {
  quality: 'auto',
  format: 'auto',
  crop: 'fit'
}

// ================================
// Utilitários de Otimização do Cloudinary
// ================================

/**
 * Optimizes Cloudinary URLs with transformation parameters
 */
export const optimizeCloudinaryUrl = (
  url: string,
  options: CloudinaryOptions = {}
): string => {
  const mergedOptions = { ...DEFAULT_CLOUDINARY_OPTIONS, ...options }
  const { width, height, quality, format, crop } = mergedOptions

  const cloudinaryRegex =
    /https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(.+)/
  const match = url.match(cloudinaryRegex)

  if (!match) return url

  const [, cloudName, imagePath] = match
  const transformations: string[] = []

  if (width || height) {
    const dimensions: string[] = []
    if (width) dimensions.push(`w_${width}`)
    if (height) dimensions.push(`h_${height}`)
    if (crop) dimensions.push(`c_${crop}`)
    transformations.push(dimensions.join(','))
  }

  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)

  transformations.push('fl_progressive', 'fl_immutable_cache')

  const transformationString = transformations.join('/')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${imagePath}`
}

/**
 * Generates optimized URLs for different image sizes
 */
export const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => ({
  thumbnail: optimizeCloudinaryUrl(originalUrl, {
    width: 400,
    height: 400,
    quality: 70,
    format: 'webp'
  }),
  medium: optimizeCloudinaryUrl(originalUrl, {
    width: 800,
    height: 800,
    quality: 80,
    format: 'webp'
  }),
  large: optimizeCloudinaryUrl(originalUrl, {
    width: 1200,
    height: 1200,
    quality: 85,
    format: 'webp'
  }),
  original: originalUrl
})

/**
 * Generates the base Cloudinary URL for the portfolio images
 */
export const getCloudinaryBaseUrl = (): string => CLOUDINARY_BASE_URL

/**
 * Generates an array of original print URLs
 */
export const generateOriginalPrintUrls = (count: number = 30): string[] => {
  return Array.from(
    { length: count },
    (_, index) => `${CLOUDINARY_BASE_URL}/${index + 1}.png`
  )
}
