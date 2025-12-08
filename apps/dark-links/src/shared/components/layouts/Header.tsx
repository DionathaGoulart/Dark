'use client'

// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Internal Imports
// ================================
import { ThemeToggle, LanguageSwitch } from '../ui'
import { HeaderConfig } from '@types'

// ================================
// Main Component
// ================================

/**
 * Componente de cabeçalho do layout com alternador de tema e idioma
 * @component
 */
export const LayoutHeader: React.FC<HeaderConfig> = () => {
  // ================================
  // Render
  // ================================

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-transparent z-30">
      <div className="px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-end h-12 sm:h-16 lg:h-20">
          <div className="flex items-center space-x-3">
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

