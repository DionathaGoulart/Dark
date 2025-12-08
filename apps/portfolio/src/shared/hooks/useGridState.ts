import { useState, useCallback } from 'react'

import { ImageItem } from '@/types'

// ================================
// Interface do Hook
// ================================

/** Tipo de retorno para o hook useGridState */
interface UseGridStateReturn {
  // Estado
  images: ImageItem[]
  selectedImage: ImageItem | null
  loading: boolean
  error: string | null

  // Setters
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>
  setSelectedImage: React.Dispatch<React.SetStateAction<ImageItem | null>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>

  // Ações
  addImage: (image: ImageItem) => void
  removeImage: (id: string) => void
  updateImage: (id: string, updates: Partial<ImageItem>) => void
  clearImages: () => void

  // Manipuladores
  handleImageClick: (image: ImageItem) => void
  handleImageError: (image: ImageItem) => void
}

// ================================
// Hook Customizado
// ================================

/**
 * Hook customizado para gerenciar o estado da grade e operações de imagens
 * @param initialImages - Array inicial de imagens para popular a grade
 * @returns Objeto contendo estado, setters, ações e manipuladores de eventos
 */
export const useGridState = (
  initialImages: ImageItem[] = []
): UseGridStateReturn => {
  // ================================
  // Gerenciamento de Estado
  // ================================
  const [images, setImages] = useState<ImageItem[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ================================
  // Operações CRUD
  // ================================

  /** Adiciona uma nova imagem à grade */
  const addImage = useCallback((image: ImageItem) => {
    setImages((prev) => [...prev, image])
  }, [])

  /** Remove uma imagem da grade pelo ID */
  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  /** Atualiza uma imagem existente com dados parciais */
  const updateImage = useCallback((id: string, updates: Partial<ImageItem>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    )
  }, [])

  /** Limpa todas as imagens e reseta a seleção */
  const clearImages = useCallback(() => {
    setImages([])
    setSelectedImage(null)
  }, [])

  // ================================
  // Manipuladores de Eventos
  // ================================

  /** Manipula o clique na imagem para selecioná-la */
  const handleImageClick = useCallback((image: ImageItem) => {
    setSelectedImage(image)
  }, [])

  /** Manipula erros de carregamento de imagem removendo a imagem que falhou */
  const handleImageError = useCallback(
    (image: ImageItem) => {
      console.warn(`Falha ao carregar imagem: ${image.url}`)
      removeImage(image.id)
    },
    [removeImage]
  )

  // ================================
  // Retorna API do Hook
  // ================================
  return {
    // Estado
    images,
    selectedImage,
    loading,
    error,

    // Setters
    setImages,
    setSelectedImage,
    setLoading,
    setError,

    // Ações
    addImage,
    removeImage,
    updateImage,
    clearImages,

    // Manipuladores
    handleImageClick,
    handleImageError
  }
}
