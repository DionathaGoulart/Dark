'use client'

import React from 'react'

import { useTheme } from '@/core/providers'

// ================================
// INTERFACES E TIPOS
// ================================

interface ThemeToggleProps {
  className?: string
}

interface IconProps {
  isActive: boolean
  className?: string
}

// ================================
// CONSTANTES
// ================================

const buttonBaseClasses = [
  'relative',
  'p-3',
  'rounded-full',
  'transition-all',
  'duration-300',
  'bg-primary-white',
  'dark:bg-primary-black',
  'border-2',
  'border-primary-black',
  'dark:border-primary-white',
  'hover:scale-105',
  'active:scale-95',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-primary-black',
  'dark:focus:ring-primary-white',
  'focus:ring-offset-2',
  'focus:ring-offset-primary-white',
  'dark:focus:ring-offset-primary-black'
].join(' ')

const iconBaseClasses = [
  'absolute',
  'inset-0',
  'w-5',
  'h-5',
  'transition-all',
  'duration-300'
].join(' ')

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Obtém classes apropriadas do ícone baseado no estado ativo
 */
const getIconClasses = (isActive: boolean, textColor: string): string => {
  const stateClasses = isActive
    ? 'opacity-100 rotate-0 scale-100'
    : 'opacity-0 rotate-90 scale-0'

  return `${iconBaseClasses} ${textColor} ${stateClasses}`
}

/**
 * Obtém classes do ícone da lua com rotação invertida
 */
const getMoonIconClasses = (isActive: boolean): string => {
  const stateClasses = isActive
    ? 'opacity-100 rotate-0 scale-100'
    : 'opacity-0 -rotate-90 scale-0'

  return `${iconBaseClasses} text-primary-white ${stateClasses}`
}

/**
 * Obtém rótulo aria apropriado baseado no tema atual
 */
const getAriaLabel = (currentTheme: string): string => {
  const targetTheme = currentTheme === 'light' ? 'escuro' : 'claro'
  return `Mudar para tema ${targetTheme}`
}

// ================================
// SUB-COMPONENTES
// ================================

/**
 * Componente de ícone do sol para tema claro
 */
const SunIcon: React.FC<IconProps> = ({ isActive, className = '' }) => (
  <svg
    className={`${getIconClasses(isActive, 'text-primary-black')} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

/**
 * Componente de ícone da lua para tema escuro
 */
const MoonIcon: React.FC<IconProps> = ({ isActive, className = '' }) => (
  <svg
    className={`${getMoonIconClasses(isActive)} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Botão de alternância de tema com ícones animados de sol/lua
 * Fornece transições suaves entre temas claro e escuro
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  // ================================
  // MANIPULADORES
  // ================================

  const handleClick = () => {
    toggleTheme()
  }

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const isLightTheme = theme === 'light'
  const isDarkTheme = theme === 'dark'
  const ariaLabel = getAriaLabel(theme)

  const containerClasses = ['flex flex-col items-center gap-2', className]
    .filter(Boolean)
    .join(' ')

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <div className={containerClasses}>
      <button
        onClick={handleClick}
        className={buttonBaseClasses}
        aria-label={ariaLabel}
      >
        <div className="relative w-5 h-5">
          <SunIcon isActive={isLightTheme} />
          <MoonIcon isActive={isDarkTheme} />
        </div>
      </button>
    </div>
  )
}
