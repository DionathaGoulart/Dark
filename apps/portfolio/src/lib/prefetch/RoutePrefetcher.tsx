'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadFromStorage, STORAGE_KEYS } from './storage'
import { usePreload } from '@/providers/GlobalPreloadProvider'

// Rotas principais para prefetch
const ROUTES_TO_PREFETCH = [
  '/',
  '/projects',
  '/stores',
  '/about',
  '/contact'
]

/**
 * Componente que faz prefetch de todas as rotas principais
 * Isso faz o Next.js carregar o JS e dados de todas as páginas em background
 */
export const RoutePrefetcher: React.FC = () => {
  const router = useRouter()
  const { isLoading } = usePreload()

  useEffect(() => {
    // Só inicia o prefetch agressivo de rotas quando o carregamento principal terminar
    // para não competir por largura de banda
    if (isLoading) return

    // Prefetch de todas as rotas principais
    ROUTES_TO_PREFETCH.forEach(route => {
      router.prefetch(route)
    })

    // Prefetch das páginas de projetos individuais
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = loadFromStorage<any[]>(STORAGE_KEYS.PROJECTS)
    if (projects) {
      projects.forEach(project => {
        if (project.slug) {
          router.prefetch(`/projects/${project.slug}`)
        }
      })
    }
  }, [router, isLoading])

  return null
}

