'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePreload } from '@/providers/GlobalPreloadProvider'
import { preloadImage } from './imageCache'
import {
  STORAGE_KEYS,
  isCacheValid,
  saveToStorage,
  loadFromStorage
} from './storage'

const fetchHomeImages = async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from('portfolio_home_images')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
  return data || []
}

const fetchProjects = async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
  return data || []
}

const fetchStoreCards = async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from('portfolio_store_cards')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
  return data || []
}

const fetchProjectImages = async (projectId: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('portfolio_project_images')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })
  return data || []
}

export const DataPrefetcher: React.FC = () => {
  const started = useRef(false)
  const { startLoading, finishLoading, setProgress } = usePreload()

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (isCacheValid()) {
      finishLoading()
      return
    }

    startLoading()

    const prefetch = async () => {
      try {
        // 1. Fetch dados principais (20%)
        const [homeImages, projects, storeCards] = await Promise.all([
          fetchHomeImages(),
          fetchProjects(),
          fetchStoreCards()
        ])

        saveToStorage(STORAGE_KEYS.HOME_IMAGES, homeImages)
        saveToStorage(STORAGE_KEYS.PROJECTS, projects)
        saveToStorage(STORAGE_KEYS.STORE_CARDS, storeCards)

        setProgress(20)

        // 2. Preload imagens principais (Home + Store) (40%)
        const criticalImages = [
          ...homeImages.map(img => img.image_url),
          ...storeCards.map(card => card.image_url)
        ]

        let loadedCount = 0
        const totalCritical = criticalImages.length

        await Promise.all(criticalImages.map(async (url) => {
          await preloadImage(url)
          loadedCount++
          // Atualiza progresso de 20% a 40%
          setProgress(20 + (loadedCount / totalCritical) * 20)
        }))

        // 3. Finaliza loading principal (100%)
        setProgress(100)

        sessionStorage.setItem(STORAGE_KEYS.PREFETCH_TIMESTAMP, Date.now().toString())
        finishLoading()

        // 4. Background Prefetch: Fetch data e imagens dos projetos
        // Isso roda em background sem bloquear a UI
        const backgroundPrefetch = async () => {
          for (const project of projects) {
            try {
              const key = `${STORAGE_KEYS.PROJECT_IMAGES_PREFIX}${project.id}`
              let images = loadFromStorage<any[]>(key)

              if (!images) {
                images = await fetchProjectImages(project.id)
                saveToStorage(key, images)
                saveToStorage(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${project.slug}`, project)
              }

              // Preload capa do projeto (opcional, mas bom pra cache)
              if (project.cover_image_url) {
                await preloadImage(project.cover_image_url)
              }
            } catch (err) {
              console.warn(`Background prefetch error for project ${project.id}:`, err)
            }
          }
        }

        // Delay pequeno para não competir com renderização inicial
        setTimeout(() => {
          backgroundPrefetch()
        }, 1000)

      } catch (e) {
        console.error('Prefetch error:', e)
        finishLoading() // Garante que o loading saia mesmo com erro
      }
    }

    prefetch()
  }, [])

  return null
}
