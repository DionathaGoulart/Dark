// ================================
// Types
// ================================

export interface PortfolioSeoData {
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

export interface PortfolioSettingsData {
  id?: string
  site_icon_url?: string
  logo_url?: string
  instagram_url?: string
  youtube_url?: string
  footer_text?: string
}

export interface NavigationItem {
  id: string
  label_pt: string
  label_en: string
  href: string
  order_index: number
  is_active: boolean
}

export interface PortfolioPage {
  id: string
  slug: string
  title_pt: string
  title_en: string
  content_pt?: string
  content_en?: string
  is_active: boolean
  order_index: number
}

export interface HomeImage {
  id: string
  image_url: string
  alt_text_pt?: string
  alt_text_en?: string
  order_index: number
  is_active: boolean
}

export interface Project {
  id: string
  slug: string
  title_pt: string
  title_en: string
  description_pt?: string
  description_en?: string
  cover_image_url: string
  layout_type: 'grid' | 'masonry' | 'solo'
  is_active: boolean
  order_index: number
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text_pt?: string
  alt_text_en?: string
  order_index: number
  is_active: boolean
  layout_type?: 'solo' | 'grid-2' | 'grid-3' | 'grid-5'
  aspect_ratio?: 'square' | 'wide' | 'portrait' | 'card' | 'cinema' | 'tall' | 'auto'
  object_fit?: 'cover' | 'contain'
  grid_group_id?: string
}

