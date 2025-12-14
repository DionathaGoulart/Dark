'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ================================
// TIPOS
// ================================

interface PrefetchOptions {
  /** Rotas para pré-carregar */
  routes: string[]
  /** Delay em ms antes de começar o prefetch (padrão: 2000ms após home carregar) */
  delay?: number
  /** Delay entre cada prefetch em ms (padrão: 300ms) */
  batchDelay?: number
  /** Se deve fazer prefetch apenas quando a página estiver totalmente carregada */
  waitForFullLoad?: boolean
  /** Se está pronto para fazer prefetch (controle externo) */
  isReady?: boolean
}

// ================================
// CONSTANTES
// ================================

const DEFAULT_DELAY = 2000 // 2 segundos após home carregar
const DEFAULT_BATCH_DELAY = 300 // 300ms entre cada prefetch

// ================================
// HOOK
// ================================

/**
 * Hook para pré-carregar páginas em background após a home carregar
 * Faz prefetch inteligente das rotas principais para melhorar a navegação
 */
export const usePagePrefetch = ({
  routes,
  delay = DEFAULT_DELAY,
  batchDelay = DEFAULT_BATCH_DELAY,
  waitForFullLoad = true,
  isReady = true
}: PrefetchOptions) => {
  const router = useRouter()
  const hasPrefetched = useRef(false)
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Se não está pronto ou já fez prefetch, não fazer novamente
    if (!isReady || hasPrefetched.current) return

    // Função para fazer prefetch de uma rota
    const prefetchRoute = async (route: string) => {
      try {
        // Prefetch do Next.js (pré-carrega JavaScript e dados do Server Component)
        router.prefetch(route)
      } catch (error) {
        // Silenciosamente ignora erros de prefetch
        console.debug(`Prefetch failed for ${route}:`, error)
      }
    }

    // Função para fazer prefetch de todas as rotas em lotes
    const startPrefetch = async () => {
      if (hasPrefetched.current) return
      hasPrefetched.current = true

      // Prefetch sequencial com delay entre cada um para não sobrecarregar
      for (let i = 0; i < routes.length; i++) {
        await prefetchRoute(routes[i])
        
        // Delay entre cada prefetch (exceto no último)
        if (i < routes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, batchDelay))
        }
      }
    }

    // Verifica se o documento está totalmente carregado
    const checkPageLoaded = () => {
      if (document.readyState === 'complete') {
        // Aguardar um pouco mais para garantir que imagens também carregaram
        prefetchTimeoutRef.current = setTimeout(() => {
          startPrefetch()
        }, delay)
        return true
      }
      return false
    }

    // Handler para evento de carregamento
    let handleLoad: (() => void) | null = null

    // Se está usando controle externo (isReady), aguardar ele
    if (!waitForFullLoad) {
      if (isReady) {
        prefetchTimeoutRef.current = setTimeout(() => {
          startPrefetch()
        }, delay)
      }
    } else if (waitForFullLoad && isReady) {
      // Se precisa esperar carregamento completo e está pronto
      // Se já está carregado, iniciar prefetch
      if (checkPageLoaded()) {
        // Cleanup apenas do timeout
        return () => {
          if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current)
          }
        }
      }

      // Aguardar evento de carregamento
      handleLoad = () => {
        if (checkPageLoaded()) {
          window.removeEventListener('load', handleLoad!)
        }
      }

      window.addEventListener('load', handleLoad)
    }

    // Cleanup
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
      if (handleLoad) {
        window.removeEventListener('load', handleLoad)
      }
    }
  }, [routes, delay, batchDelay, waitForFullLoad, isReady, router])
}

