import { OptimizedUrls } from '../types'

// ================================
// Utilitários de Otimização
// ================================

/**
 * Gera URLs otimizadas para diferentes tamanhos
 * Nota: Supabase Storage não suporta transformações via query params
 * Esta função mantém a estrutura para futuras melhorias (ex: usar serviço de transformação)
 * Por enquanto, todas as URLs são iguais, mas o sistema de carregamento progressivo
 * otimiza o carregamento usando lazy loading e priorização inteligente
 */
export const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => {
  // Por enquanto, todas as URLs são iguais
  // Futuramente pode-se integrar com serviço de transformação de imagens
  // ou usar Supabase Image Transformations (se disponível)
  return {
    thumbnail: originalUrl, // Para lazy loading inicial
    medium: originalUrl,    // Para visualização padrão
    large: originalUrl,     // Para telas maiores
    original: originalUrl   // Para zoom/full size
  }
}

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
