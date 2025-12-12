import { OptimizedUrls } from '../types'

// ================================
// Utilitários de Otimização
// ================================

/**
 * Generates URLs for different image sizes (using original URL from Supabase Storage)
 */
export const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => ({
  thumbnail: originalUrl,
  medium: originalUrl,
  large: originalUrl,
  original: originalUrl
})

/**
 * Legacy function - returns empty string as Cloudinary is no longer used
 * @deprecated Cloudinary is no longer used, images come from Supabase Storage
 */
export const getCloudinaryBaseUrl = (): string => ''

/**
 * Legacy function - returns empty array as Cloudinary is no longer used
 * @deprecated Cloudinary is no longer used, images come from Supabase Storage
 */
export const generateOriginalPrintUrls = (count: number = 30): string[] => {
  return []
}
