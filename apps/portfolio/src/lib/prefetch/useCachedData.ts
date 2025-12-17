'use client'

import { useState, useEffect } from 'react'
import { loadFromStorage, STORAGE_KEYS } from './DataPrefetcher'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook genérico para usar dados do cache ou buscar do servidor
 */
function useCachedData<T>(
  storageKey: string,
  fetchFn: () => Promise<T>,
  serverData?: T
): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(serverData || null)
  const [loading, setLoading] = useState(!serverData)

  useEffect(() => {
    // Se já tem dados do servidor, não precisa buscar
    if (serverData) {
      setData(serverData)
      setLoading(false)
      return
    }

    // Tenta carregar do cache primeiro
    const cached = loadFromStorage<T>(storageKey)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    // Se não tem cache, busca do servidor
    const fetchData = async () => {
      try {
        const result = await fetchFn()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [storageKey, serverData])

  return { data, loading }
}

/**
 * Hook para imagens da home
 */
export function useHomeImages(serverData?: any[]) {
  return useCachedData(
    STORAGE_KEYS.HOME_IMAGES,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('portfolio_home_images')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      return data || []
    },
    serverData
  )
}

/**
 * Hook para projetos
 */
export function useProjects(serverData?: any[]) {
  return useCachedData(
    STORAGE_KEYS.PROJECTS,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      return data || []
    },
    serverData
  )
}

/**
 * Hook para store cards
 */
export function useStoreCards(serverData?: any[]) {
  return useCachedData(
    STORAGE_KEYS.STORE_CARDS,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('portfolio_store_cards')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })
      return data || []
    },
    serverData
  )
}

