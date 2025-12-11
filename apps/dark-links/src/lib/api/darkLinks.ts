import { createClient } from '@/lib/supabase/client'

// ================================
// Types
// ================================

export interface SeoData {
  id?: string
  title_pt?: string
  description_pt?: string
  keywords_pt?: string
  canonical_url_pt?: string
  title_en?: string
  description_en?: string
  keywords_en?: string
  canonical_url_en?: string
  og_image_url?: string
  og_type?: string
  og_site_name?: string
  twitter_card_type?: string
  twitter_site?: string
  twitter_creator?: string
  ga_measurement_id?: string
  robots_txt?: string
}

export interface SettingsData {
  id?: string
  site_icon_url?: string
  profile_image_url?: string
  title?: string
  subtitle_pt?: string
  subtitle_en?: string
  youtube_url?: string
  email?: string
  instagram_url?: string
}

export interface LinkCard {
  id: string
  title?: string
  title_pt?: string
  title_en?: string
  url: string
  description?: string
  icon_url?: string
  order_index: number
}

// ================================
// API Functions
// ================================

/**
 * Busca dados de SEO do Dark Links
 */
export async function getSeoData(locale: 'pt' | 'en' = 'pt'): Promise<SeoData | null> {
  try {
    const supabase = createClient()
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
 * Busca configurações gerais do Dark Links
 */
export async function getSettings(): Promise<SettingsData | null> {
  try {
    const supabase = createClient()
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
 * Busca todos os cards de links
 */
export async function getLinkCards(): Promise<LinkCard[]> {
  try {
    const supabase = createClient()
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

