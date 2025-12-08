'use client'

// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Internal Imports
// ================================
import { useTheme } from '@/core/providers/ThemeProvider'

// ================================
// Helper Components
// ================================

/**
 * Ícone do sol para tema claro
 * @component
 */
const SunIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
  <svg
    className={`
      absolute
      inset-0
      w-5
      h-5
      text-primary-black
      transition-all
      duration-300
      ${
        isVisible
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 rotate-90 scale-0'
      }
    `}
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
 * Ícone da lua para tema escuro
 * @component
 */
const MoonIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
  <svg
    className={`
      absolute
      inset-0
      w-5
      h-5
      text-primary-white
      transition-all
      duration-300
      ${
        isVisible
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 -rotate-90 scale-0'
      }
    `}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

// ================================
// Main Component
// ================================

/**
 * Componente de botão para alternar entre tema claro e escuro
 * @component
 */
export const ThemeToggle: React.FC = () => {
  // ================================
  // Hooks
  // ================================

  const { theme, toggleTheme } = useTheme()

  // ================================
  // Helper Functions
  // ================================

  /**
   * Manipula o clique no botão de alternar tema
   */
  const handleClick = (): void => {
    toggleTheme()
  }

  // ================================
  // Constants
  // ================================

  const isLightTheme = theme === 'light'
  const isDarkTheme = theme === 'dark'

  // ================================
  // Render
  // ================================

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        className="
          relative
          p-3
          rounded-full
          transition-all
          duration-300
          bg-primary-white
          dark:bg-primary-black
          border-2
          border-primary-black
          dark:border-primary-white
          hover:scale-105
          active:scale-95
          focus:outline-none
          focus:ring-2
          focus:ring-primary-black
          dark:focus:ring-primary-white
          focus:ring-offset-2
          focus:ring-offset-primary-white
          dark:focus:ring-offset-primary-black
        "
        aria-label={`Mudar para tema ${isLightTheme ? 'escuro' : 'claro'}`}
      >
        <div className="relative w-5 h-5">
          <SunIcon isVisible={isLightTheme} />
          <MoonIcon isVisible={isDarkTheme} />
        </div>
      </button>
    </div>
  )
}

