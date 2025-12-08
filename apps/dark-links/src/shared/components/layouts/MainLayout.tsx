'use client'

// ================================
// External Imports
// ================================
import React from 'react'

// ================================
// Internal Imports
// ================================
import { LayoutHeader } from './Header'
import { MainLayoutProps } from '@types'

// ================================
// Constants
// ================================

const DEFAULT_HEADER_CONFIG = { showNavigation: true }
const DEFAULT_FOOTER_CONFIG = { show: true }
const DEFAULT_CLASS_NAME = ''

// ================================
// Main Component
// ================================

/**
 * Componente de layout principal que envolve toda a aplicação
 * @component
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  header = DEFAULT_HEADER_CONFIG,
  footer = DEFAULT_FOOTER_CONFIG, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = DEFAULT_CLASS_NAME
}) => {
  // ================================
  // Render
  // ================================

  return (
    <div
      className={`min-h-screen flex flex-col bg-primary-white dark:bg-primary-black transition-all duration-300 ${className}`}
    >
      <LayoutHeader
        showNavigation={header.showNavigation}
      />

      <main className="flex-1 bg-primary-white dark:bg-primary-black text-primary-black dark:text-primary-white transition-all duration-300">
        {children}
      </main>
    </div>
  )
}

