'use client'

import React, { useState, useEffect } from 'react'
import { ScrollInfo, ScrollToTopHook, ScrollToTopProps } from '@types'

// ================================
// CONSTANTES
// ================================

const DEFAULT_SHOW_AFTER = 400
const CIRCLE_RADIUS = 26
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

const baseButtonClasses = [
  'fixed bottom-6 right-6 z-50',
  'rounded-full',
  'bg-primary-black dark:bg-primary-white',
  'text-primary-white dark:text-primary-black',
  'shadow-lg hover:shadow-xl',
  'transform transition-all duration-300',
  'hover:scale-110 active:scale-95',
  'flex items-center justify-center',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'focus:ring-primary-black dark:focus:ring-primary-white'
].join(' ')

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Calcula o progresso do scroll como uma porcentagem
 */
const calculateScrollProgress = (): number => {
  const scrollTop = window.pageYOffset
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

/**
 * Rola para o topo da página com comportamento suave opcional
 */
const scrollToTopHandler = (smooth: boolean = true): void => {
  if (smooth) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } else {
    window.scrollTo(0, 0)
  }
}

/**
 * Obtém classes do botão com className adicional opcional
 */
const getButtonClasses = (
  size: 'small' | 'large',
  className: string
): string => {
  const sizeClasses =
    size === 'small' ? 'w-12 h-12' : 'w-14 h-14 relative overflow-hidden'
  return `${baseButtonClasses} ${sizeClasses} ${className}`
}

// ================================
// SUB-COMPONENTES
// ================================

/**
 * Componente de ícone de seta para cima
 */
const ArrowUpIcon: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6'
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
)

/**
 * Componente de círculo de progresso para indicador de scroll
 */
const ProgressCircle: React.FC<{ progress: number }> = ({ progress }) => (
  <svg
    className="absolute inset-0 w-full h-full transform -rotate-90"
    viewBox="0 0 56 56"
  >
    <circle
      cx="28"
      cy="28"
      r={CIRCLE_RADIUS}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.2"
    />
    <circle
      cx="28"
      cy="28"
      r={CIRCLE_RADIUS}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray={CIRCLE_CIRCUMFERENCE}
      strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - progress / 100)}
      className="transition-all duration-150"
    />
  </svg>
)

// ================================
// COMPONENTES PRINCIPAIS
// ================================

/**
 * Botão simples de voltar ao topo que aparece após o scroll
 */
export const ScrollToTopButton: React.FC<ScrollToTopProps> = ({
  showAfter = DEFAULT_SHOW_AFTER,
  smooth = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > showAfter)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [showAfter])

  const handleClick = () => {
    scrollToTopHandler(smooth)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses('small', className)}
      aria-label="Voltar ao topo"
    >
      <ArrowUpIcon />
    </button>
  )
}

/**
 * Botão avançado de voltar ao topo com indicador de progresso
 */
export const ScrollToTopWithProgress: React.FC<ScrollToTopProps> = ({
  showAfter = DEFAULT_SHOW_AFTER,
  smooth = true,
  className = ''
}) => {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    isVisible: false,
    scrollProgress: 0
  })

  useEffect(() => {
    const updateScrollInfo = () => {
      const scrollTop = window.pageYOffset
      const scrollProgress = calculateScrollProgress()

      setScrollInfo({
        isVisible: scrollTop > showAfter,
        scrollProgress
      })
    }

    window.addEventListener('scroll', updateScrollInfo)
    return () => window.removeEventListener('scroll', updateScrollInfo)
  }, [showAfter])

  const handleClick = () => {
    scrollToTopHandler(smooth)
  }

  if (!scrollInfo.isVisible) return null

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses('large', className)}
      aria-label="Voltar ao topo"
    >
      <ProgressCircle progress={scrollInfo.scrollProgress} />
      <ArrowUpIcon className="w-6 h-6 relative z-10" />
    </button>
  )
}

// ================================
// HOOKS
// ================================

/**
 * Hook para funcionalidade de voltar ao topo
 * Retorna estado de visibilidade e função de scroll para implementações customizadas
 */
export const useScrollToTop = (
  showAfter: number = DEFAULT_SHOW_AFTER
): ScrollToTopHook => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > showAfter)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [showAfter])

  const scrollToTop = (smooth: boolean = true) => {
    scrollToTopHandler(smooth)
  }

  return { isVisible, scrollToTop }
}
