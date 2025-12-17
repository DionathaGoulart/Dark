'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadFromStorage, STORAGE_KEYS } from './DataPrefetcher'

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

  useEffect(() => {
    // Prefetch de todas as rotas principais imediatamente
    ROUTES_TO_PREFETCH.forEach(route => {
      router.prefetch(route)
    })

    // Após 1 segundo, faz prefetch das páginas de projetos individuais
    const timer = setTimeout(() => {
      const projects = loadFromStorage<any[]>(STORAGE_KEYS.PROJECTS)
      if (projects) {
        projects.forEach(project => {
          if (project.slug) {
            router.prefetch(`/projects/${project.slug}`)
          }
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return null
}

