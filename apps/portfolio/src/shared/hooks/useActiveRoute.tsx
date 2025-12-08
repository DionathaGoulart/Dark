'use client'

import { usePathname } from 'next/navigation'

// ================================
// INTERFACES E TIPOS
// ================================

interface UseActiveRouteReturn {
  currentPath: string
  isActive: (href: string) => boolean
}

// ================================
// CONSTANTES
// ================================

const HOME_ROUTE = '/' as const

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Verifica se uma rota é a rota home
 */
const isHomeRoute = (href: string): boolean => {
  return href === HOME_ROUTE
}

/**
 * Verifica se o caminho atual corresponde exatamente à rota home
 */
const isHomeRouteActive = (currentPath: string): boolean => {
  return currentPath === HOME_ROUTE
}

/**
 * Verifica se o caminho atual corresponde à rota não-home exatamente ou como pai
 */
const isNonHomeRouteActive = (currentPath: string, href: string): boolean => {
  return currentPath === href || currentPath.startsWith(href + '/')
}

/**
 * Determina se uma rota está atualmente ativa baseada no caminho atual
 */
const checkRouteActive = (currentPath: string, href: string): boolean => {
  if (isHomeRoute(href)) {
    return isHomeRouteActive(currentPath)
  }

  return isNonHomeRouteActive(currentPath, href)
}

// ================================
// HOOK PRINCIPAL
// ================================

/**
 * Hook para detectar rota ativa com React Router
 * Fornece correspondência exata para rota home e correspondência pai/filho para outras rotas
 */
export const useActiveRoute = (): UseActiveRouteReturn => {
  const pathname = usePathname()

  // ================================
  // VALORES COMPUTADOS
  // ================================

  const currentPath = pathname

  // ================================
  // MANIPULADORES
  // ================================

  const isActive = (href: string): boolean => {
    return checkRouteActive(currentPath, href)
  }

  // ================================
  // RETORNO
  // ================================

  return {
    currentPath,
    isActive
  }
}
