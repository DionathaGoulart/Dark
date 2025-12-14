import { createClient } from '@/lib/supabase/server'
import type {
  PortfolioSeoData,
  PortfolioSettingsData,
  NavigationItem,
  PortfolioPage,
  HomeImage,
  Project,
  ProjectImage,
  StoreCard
} from './portfolio'

/**
 * Busca dados de SEO do Portfolio (server-side)
 */
export async function getPortfolioSeoData(locale: 'pt' | 'en' = 'pt'): Promise<PortfolioSeoData | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_seo')
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
 * Busca configurações gerais do Portfolio (server-side)
 */
export async function getPortfolioSettings(): Promise<PortfolioSettingsData | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_settings')
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
 * Busca itens de navegação (server-side)
 */
export async function getNavigationItems(): Promise<NavigationItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_navigation')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar navegação:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar navegação:', error)
    return []
  }
}

/**
 * Busca uma página por slug (server-side)
 */
export async function getPageBySlug(slug: string): Promise<PortfolioPage | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Erro ao buscar página:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar página:', error)
    return null
  }
}

/**
 * Busca imagens da home (server-side)
 */
export async function getHomeImages(): Promise<HomeImage[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_home_images')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar imagens da home:', error)
      return []
    }

    const images = data || []
    
    // Remover duplicatas baseado no ID
    const uniqueImages = images.filter((img, index, self) => 
      index === self.findIndex((i) => i.id === img.id)
    )

    return uniqueImages
  } catch (error) {
    console.error('Erro ao buscar imagens da home:', error)
    return []
  }
}

/**
 * Busca todos os projetos (server-side)
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar projetos:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return []
  }
}

/**
 * Busca um projeto por slug (server-side)
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Erro ao buscar projeto:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return null
  }
}

/**
 * Busca imagens de um projeto (server-side)
 */
export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_project_images')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar imagens do projeto:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar imagens do projeto:', error)
    return []
  }
}

/**
 * Busca cards da Store (server-side)
 */
export async function getStoreCards(): Promise<StoreCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('portfolio_store_cards')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Erro ao buscar cards da Store:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar cards da Store:', error)
    return []
  }
}

