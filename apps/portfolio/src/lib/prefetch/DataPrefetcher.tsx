'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export const STORAGE_KEYS = {
  HOME_IMAGES: 'portfolio_home_images',
  PROJECTS: 'portfolio_projects',
  PROJECT_IMAGES_PREFIX: 'portfolio_project_images_',
  PROJECT_DATA_PREFIX: 'portfolio_project_data_',
  STORE_CARDS: 'portfolio_store_cards',
  ABOUT_PAGE: 'portfolio_about_page',
  CONTACT_PAGE: 'portfolio_contact_page',
  PREFETCH_DONE: 'portfolio_prefetch_done',
  PREFETCH_TIMESTAMP: 'portfolio_prefetch_timestamp'
} as const

const CACHE_TTL = 5 * 60 * 1000

const isCacheValid = (): boolean => {
  if (typeof window === 'undefined') return false
  const timestamp = sessionStorage.getItem(STORAGE_KEYS.PREFETCH_TIMESTAMP)
  if (!timestamp) return false
  return Date.now() - parseInt(timestamp, 10) < CACHE_TTL
}

const saveToStorage = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch (e) {}
}

export const loadFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  try {
    const data = sessionStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

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

  useEffect(() => {
    if (started.current || isCacheValid()) return
    started.current = true

    const prefetch = async () => {
      try {
        // Fetch dados principais em paralelo
        const [homeImages, projects, storeCards] = await Promise.all([
          fetchHomeImages(),
          fetchProjects(),
          fetchStoreCards()
        ])

        saveToStorage(STORAGE_KEYS.HOME_IMAGES, homeImages)
        saveToStorage(STORAGE_KEYS.PROJECTS, projects)
        saveToStorage(STORAGE_KEYS.STORE_CARDS, storeCards)

        // Fetch imagens dos projetos em background
        for (const project of projects) {
          const key = `${STORAGE_KEYS.PROJECT_IMAGES_PREFIX}${project.id}`
          if (!loadFromStorage(key)) {
            const images = await fetchProjectImages(project.id)
            saveToStorage(key, images)
            saveToStorage(`${STORAGE_KEYS.PROJECT_DATA_PREFIX}${project.slug}`, project)
          }
        }

        sessionStorage.setItem(STORAGE_KEYS.PREFETCH_TIMESTAMP, Date.now().toString())
      } catch (e) {
        console.error('Prefetch error:', e)
      }
    }

    prefetch()
  }, [])

  return null
}
