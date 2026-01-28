'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ModalZoomProps } from '@/types'

// ================================
// CONSTANTES
// ================================

const KEYFRAME_STYLES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Componente ModalZoom para exibir imagens em tela cheia com estados de carregamento
 * Possui animação de carregamento, tratamento de erros e funcionalidade de fechar ao clicar
 */
export const ModalZoom: React.FC<ModalZoomProps> = ({ image, onClose }) => {
  // ================================
  // ESTADO E REFS
  // ================================

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const loadStartTime = useRef<number>(Date.now())

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const imageUrl = image?.urls?.large || image?.url

  // ================================
  // EFEITOS
  // ================================

  useEffect(() => {
    // Reseta estados quando a URL da imagem muda (para reabertura do modal com imagem diferente)
    loadStartTime.current = Date.now()
    setIsLoading(true)
    setHasError(false)
  }, [imageUrl])

  // ================================
  // MANIPULADORES DE EVENTOS
  // ================================

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que o clique na imagem feche o modal
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // ================================
  // RETORNOS ANTECIPADOS
  // ================================

  if (!imageUrl) {
    return null // Não renderiza se não há URL da imagem
  }

  // ================================
  // FUNÇÕES AUXILIARES DE RENDERIZAÇÃO
  // ================================

  const renderLoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex space-x-1">
        {[0, 200, 400].map((delay, index) => (
          <div
            key={index}
            className="w-2 h-2 bg-primary-white/50 rounded-full"
            style={{ animation: `bounce 1.4s infinite ${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="text-center text-primary-white/50">
      <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </div>
      <p className="text-sm font-medium">Imagem não encontrada</p>
    </div>
  )

  const renderCloseButton = () => (
    <button
      className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
      onClick={onClose}
      aria-label="Fechar"
    >
      ✕
    </button>
  )

  // ================================
  // RENDERIZAÇÃO PRINCIPAL
  // ================================

  return (
    //
    <div
      className="fixed inset-0 bg-primary-black/90 flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
      aria-label="Visualização de imagem"
      aria-modal="true"
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAME_STYLES }} />

      {isLoading && renderLoadingSpinner()}

      {!isLoading && hasError && renderErrorState()}

      <button
        type="button"
        onClick={handleImageClick}
        className="focus:outline-none focus:ring-2 focus:ring-primary-white/50 flex items-center justify-center p-4 content-center"
        aria-label={image.alt || 'Imagem ampliada'}
      >
        <img // eslint-disable-line @next/next/no-img-element
          src={imageUrl}
          alt={image.alt || ''}
          className={`max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </button>

      {renderCloseButton()}
    </div>
  )
}
