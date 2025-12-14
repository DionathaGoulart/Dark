import { createClient } from '@/lib/supabase/server'
import type { SeoData, SettingsData, LinkCard } from './darkLinks'

/**
 * Busca dados de SEO do Dark Links (server-side)
 */
export async function getSeoData(locale: 'pt' | 'en' = 'pt'): Promise<SeoData | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('dark_links_seo')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar SEO:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar SEO:', error)
    return null
  }
}

/**
 * Busca configurações gerais do Dark Links (server-side)
 */
export async function getSettings(): Promise<SettingsData | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('dark_links_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar settings:', error)
    return null
  }
}

/**
 * Busca todos os cards de links (server-side)
 */
export async function getLinkCards(): Promise<LinkCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('links_content')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar cards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar cards:', error)
    return []
  }
}

