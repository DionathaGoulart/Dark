'use client'

import React from 'react'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

// ================================
// INTERFACES E TIPOS
// ================================

interface HeaderProps {
  title?: string
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Cabeçalho da aplicação admin
 */
export const LayoutHeader: React.FC<HeaderProps> = ({
  title = 'Painel Admin'
}) => {
  return (
    <header className="relative w-full bg-primary-white dark:bg-primary-black transition-all duration-300 z-30 border-b-2 border-primary-black dark:border-primary-white">
      <div className="px-4 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary-black dark:text-primary-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}


