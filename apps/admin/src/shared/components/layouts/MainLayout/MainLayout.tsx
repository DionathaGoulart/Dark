'use client'

import React from 'react'
import { LayoutHeader } from '@/shared/components/layouts/Header'

// ================================
// INTERFACES E TIPOS
// ================================

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

/**
 * Wrapper de layout principal com cabeçalho
 * Fornece a estrutura base para todas as páginas da aplicação admin
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = ''
}) => {
  // ================================
  // VALORES COMPUTADOS
  // ================================

  const containerClasses = [
    'min-h-screen flex flex-col bg-primary-white dark:bg-primary-black transition-all duration-300',
    className
  ]
    .filter(Boolean)
    .join(' ')

  // ================================
  // RENDERIZAÇÃO
  // ================================

  return (
    <div className={containerClasses}>
      <LayoutHeader />

      <main className="flex-1 bg-primary-white dark:bg-primary-black text-primary-black dark:text-primary-white transition-all duration-300 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}


