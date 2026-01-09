'use client'

import { useState, useEffect } from 'react'
import { loadFromStorage, STORAGE_KEYS } from './storage'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook para obter dados de um projeto por slug
 */
export const useProjectData = (slug: string) => {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Tenta carregar do cache primeiro
      const cacheKey = `${STORAGE_KEYS.PROJECT_DATA_PREFIX}${slug}`
      const cached = loadFromStorage<any>(cacheKey)

      if (cached) {
        setProject(cached)
        setLoading(false)
        return
      }

      // Se não tem cache, busca do servidor
      const supabase = createClient()
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (data) {
        setProject(data)
        // Salva no cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data))
        } catch (e) { }
      }
      setLoading(false)
    }

    fetchData()
  }, [slug])

  return { project, loading }
}

/**
 * Hook para obter imagens de um projeto
 */
export const useProjectImages = (projectId: string | null) => {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      // Tenta carregar do cache primeiro
      const cacheKey = `${STORAGE_KEYS.PROJECT_IMAGES_PREFIX}${projectId}`
      const cached = loadFromStorage<any[]>(cacheKey)

      if (cached) {
        setImages(cached)
        setLoading(false)
        return
      }

      // Se não tem cache, busca do servidor
      const supabase = createClient()
      const { data } = await supabase
        .from('portfolio_project_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (data) {
        setImages(data)
        // Salva no cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data))
        } catch (e) { }
      }
      setLoading(false)
    }

    fetchData()
  }, [projectId])

  return { images, loading }
}

