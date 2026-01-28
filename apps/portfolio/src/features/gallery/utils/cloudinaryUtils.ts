import { OptimizedUrls } from '../types'

// ================================
// Utilitários de Otimização
// ================================

/**
 * Gera URLs otimizadas para diferentes tamanhos
 * Como estamos usando Supabase Storage sem transformações, todas as URLs são iguais (original)
 * O navegador fará o downscale automaticamente quando necessário, mantendo alta qualidade
 * 
 * Esta estrutura permite futuras melhorias (ex: gerar múltiplas versões no upload)
 */
export const generateOptimizedUrls = (originalUrl: string): OptimizedUrls => {
  // Por enquanto, todas as URLs são iguais (original)
  // O navegador fará o downscale automaticamente, mantendo máxima qualidade
  // Futuramente pode-se implementar geração de múltiplas versões no upload
  const url = originalUrl

  return {
    thumbnail: url,  // Para lazy loading inicial
    medium: url,     // Para visualização padrão
    large: url,      // Para telas maiores
    original: url    // Para zoom/full size (máxima qualidade)
  }
}

/**
 * Gera srcset string para uso em elementos <img> com atributo srcset
 * 
 * NOTA: Como todas as URLs são iguais (original), o srcset não é necessário.
 * Retornamos undefined para evitar problemas de renderização no Chrome.
 * O navegador usará apenas o atributo src, que já tem a URL original com máxima qualidade.
 * 
 * @param urls - Objeto OptimizedUrls
 * @returns undefined (não usa srcset para evitar problemas no Chrome)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateSrcSet = (_urls: OptimizedUrls): string | undefined => {
  // Como todas as URLs são iguais (original), não precisamos de srcset
  // Isso evita problemas de renderização no Chrome
  // O navegador usará apenas o src, que já tem máxima qualidade
  return undefined
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateOriginalPrintUrls = (_count: number = 30): string[] => {
  return []
}
