'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Globe, Link2, Copy, Check, Trash2 } from 'lucide-react'

interface UtmLink {
  id?: string
  name: string
  base_url: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term?: string
  utm_content?: string
  generated_url: string
  created_at?: string
}

interface SeoData {
  id?: string
  title_pt: string
  description_pt: string
  keywords_pt: string
  canonical_url_pt: string
  title_en: string
  description_en: string
  keywords_en: string
  canonical_url_en: string
  og_image_url: string
  og_type: string
  og_site_name: string
  twitter_card_type: string
  twitter_site: string
  twitter_creator: string
  ga_measurement_id: string
  robots_txt: string
}

const UTM_PRESETS = [
  { name: 'Instagram Bio', source: 'instagram', medium: 'social', campaign: 'bio_link' },
  { name: 'Instagram Stories', source: 'instagram', medium: 'social', campaign: 'stories' },
  { name: 'Instagram Post', source: 'instagram', medium: 'social', campaign: 'post' },
  { name: 'Facebook', source: 'facebook', medium: 'social', campaign: 'post' },
  { name: 'Twitter/X', source: 'twitter', medium: 'social', campaign: 'tweet' },
  { name: 'TikTok Bio', source: 'tiktok', medium: 'social', campaign: 'bio_link' },
  { name: 'YouTube Descrição', source: 'youtube', medium: 'video', campaign: 'description' },
  { name: 'Email Marketing', source: 'email', medium: 'email', campaign: 'newsletter' },
  { name: 'WhatsApp', source: 'whatsapp', medium: 'social', campaign: 'share' },
  { name: 'QR Code', source: 'qrcode', medium: 'offline', campaign: 'print' },
]

export default function PortfolioSeoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [utmLinks, setUtmLinks] = useState<UtmLink[]>([])
  const [newUtm, setNewUtm] = useState<UtmLink>({
    name: '',
    base_url: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    generated_url: ''
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [seoData, setSeoData] = useState<SeoData>({
    title_pt: '',
    description_pt: '',
    keywords_pt: '',
    canonical_url_pt: '',
    title_en: '',
    description_en: '',
    keywords_en: '',
    canonical_url_en: '',
    og_image_url: '',
    og_type: 'website',
    og_site_name: '',
    twitter_card_type: 'summary_large_image',
    twitter_site: '',
    twitter_creator: '',
    ga_measurement_id: '',
    robots_txt: 'index, follow'
  })
  const router = useRouter()

  const loadSeoData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_seo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSeoData({
          ...data,
          title_pt: data.title_pt || '',
          description_pt: data.description_pt || '',
          keywords_pt: data.keywords_pt || '',
          canonical_url_pt: data.canonical_url_pt || '',
          title_en: data.title_en || '',
          description_en: data.description_en || '',
          keywords_en: data.keywords_en || '',
          canonical_url_en: data.canonical_url_en || '',
          og_image_url: data.og_image_url || '',
          og_type: data.og_type || 'website',
          og_site_name: data.og_site_name || '',
          twitter_card_type: data.twitter_card_type || 'summary_large_image',
          twitter_site: data.twitter_site || '',
          twitter_creator: data.twitter_creator || '',
          ga_measurement_id: data.ga_measurement_id || '',
          robots_txt: data.robots_txt || 'index, follow'
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados de SEO:', error)
      setLoading(false)
    }
  }, [])

  const loadUtmLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_utm_links')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar UTM links:', error)
        return
      }

      if (data) {
        setUtmLinks(data)
      }
    } catch (error) {
      console.error('Erro ao carregar UTM links:', error)
    }
  }, [])

  const generateUtmUrl = useCallback((utm: UtmLink) => {
    if (!utm.base_url || !utm.utm_source || !utm.utm_medium || !utm.utm_campaign) {
      return ''
    }

    const url = new URL(utm.base_url)
    url.searchParams.set('utm_source', utm.utm_source)
    url.searchParams.set('utm_medium', utm.utm_medium)
    url.searchParams.set('utm_campaign', utm.utm_campaign)
    if (utm.utm_term) url.searchParams.set('utm_term', utm.utm_term)
    if (utm.utm_content) url.searchParams.set('utm_content', utm.utm_content)
    
    return url.toString()
  }, [])

  const handleUtmChange = (field: keyof UtmLink, value: string) => {
    const updated = { ...newUtm, [field]: value }
    updated.generated_url = generateUtmUrl(updated)
    setNewUtm(updated)
  }

  const applyPreset = (preset: typeof UTM_PRESETS[0]) => {
    const updated = {
      ...newUtm,
      name: preset.name,
      utm_source: preset.source,
      utm_medium: preset.medium,
      utm_campaign: preset.campaign
    }
    updated.generated_url = generateUtmUrl(updated)
    setNewUtm(updated)
  }

  const saveUtmLink = async () => {
    if (!newUtm.name || !newUtm.generated_url) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_utm_links')
        .insert({
          name: newUtm.name,
          base_url: newUtm.base_url,
          utm_source: newUtm.utm_source,
          utm_medium: newUtm.utm_medium,
          utm_campaign: newUtm.utm_campaign,
          utm_term: newUtm.utm_term || null,
          utm_content: newUtm.utm_content || null,
          generated_url: newUtm.generated_url
        })
        .select()
        .single()

      if (error) throw error

      setUtmLinks([data, ...utmLinks])
      setNewUtm({
        name: '',
        base_url: newUtm.base_url, // Mantém a URL base
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_term: '',
        utm_content: '',
        generated_url: ''
      })
      alert('Link UTM salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar UTM link:', error)
      alert('Erro ao salvar. Verifique se a tabela portfolio_utm_links existe.')
    }
  }

  const deleteUtmLink = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return

    try {
      const { error } = await supabase
        .from('portfolio_utm_links')
        .delete()
        .eq('id', id)

      if (error) throw error

      setUtmLinks(utmLinks.filter(link => link.id !== id))
    } catch (error) {
      console.error('Erro ao excluir UTM link:', error)
      alert('Erro ao excluir link.')
    }
  }

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      loadSeoData()
      loadUtmLinks()
    }

    getUser()
  }, [router, loadSeoData, loadUtmLinks])

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave = {
        ...seoData,
        updated_at: new Date().toISOString()
      }

      let result
      if (seoData.id) {
        const { data, error } = await supabase
          .from('portfolio_seo')
          .update(dataToSave)
          .eq('id', seoData.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('portfolio_seo')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      setSeoData(result)
      alert('SEO salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar SEO:', error)
      alert('Erro ao salvar SEO. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-primary-black dark:text-primary-white">Carregando...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/portfolio')}
          className="mb-6 flex items-center gap-2 text-primary-black dark:text-primary-white hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
              Gerenciar SEO
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Configure todas as informações de SEO do Portfolio em Português e Inglês
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <div className="space-y-8">
          {/* SEO Português */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                SEO - Português
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={seoData.title_pt}
                  onChange={(e) => setSeoData({ ...seoData, title_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="Dark - Portfolio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  URL Canônica
                </label>
                <input
                  type="url"
                  value={seoData.canonical_url_pt}
                  onChange={(e) => setSeoData({ ...seoData, canonical_url_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="https://dark.art.br"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Descrição
                </label>
                <textarea
                  value={seoData.description_pt}
                  onChange={(e) => setSeoData({ ...seoData, description_pt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="Portfolio de arte digital e design"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={seoData.keywords_pt}
                  onChange={(e) => setSeoData({ ...seoData, keywords_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="dark, portfolio, arte digital, design"
                />
              </div>
            </div>
          </div>

          {/* SEO Inglês - mesma estrutura */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                SEO - English
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={seoData.title_en}
                  onChange={(e) => setSeoData({ ...seoData, title_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="Dark - Portfolio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seoData.canonical_url_en}
                  onChange={(e) => setSeoData({ ...seoData, canonical_url_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="https://dark.art.br"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Description
                </label>
                <textarea
                  value={seoData.description_en}
                  onChange={(e) => setSeoData({ ...seoData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="Digital art and design portfolio"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={seoData.keywords_en}
                  onChange={(e) => setSeoData({ ...seoData, keywords_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="dark, portfolio, digital art, design"
                />
              </div>
            </div>
          </div>

          {/* Open Graph */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-6">
              Open Graph
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Imagem OG (URL)
                </label>
                <input
                  type="url"
                  value={seoData.og_image_url}
                  onChange={(e) => setSeoData({ ...seoData, og_image_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Tipo OG
                </label>
                <select
                  value={seoData.og_type}
                  onChange={(e) => setSeoData({ ...seoData, og_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={seoData.og_site_name}
                  onChange={(e) => setSeoData({ ...seoData, og_site_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="Dark - Portfolio"
                />
              </div>
            </div>
          </div>

          {/* Twitter Cards */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-6">
              Twitter Cards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Tipo de Card
                </label>
                <select
                  value={seoData.twitter_card_type}
                  onChange={(e) => setSeoData({ ...seoData, twitter_card_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Twitter Site (@username)
                </label>
                <input
                  type="text"
                  value={seoData.twitter_site}
                  onChange={(e) => setSeoData({ ...seoData, twitter_site: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="@darkning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Twitter Creator (@username)
                </label>
                <input
                  type="text"
                  value={seoData.twitter_creator}
                  onChange={(e) => setSeoData({ ...seoData, twitter_creator: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="@darkning"
                />
              </div>
            </div>
          </div>

          {/* Analytics e Robots */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-6">
              Analytics e Robots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Google Analytics Measurement ID
                </label>
                <input
                  type="text"
                  value={seoData.ga_measurement_id}
                  onChange={(e) => setSeoData({ ...seoData, ga_measurement_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Robots.txt
                </label>
                <input
                  type="text"
                  value={seoData.robots_txt}
                  onChange={(e) => setSeoData({ ...seoData, robots_txt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  placeholder="index, follow"
                />
                <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                  Ex: index, follow ou noindex, nofollow
                </p>
              </div>
            </div>
          </div>

          {/* UTM Link Builder */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Link2 size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Gerador de Links UTM
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-6">
              Crie links rastreáveis para saber de onde vêm seus visitantes no Google Analytics
            </p>

            {/* Presets */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                Presets Rápidos
              </label>
              <div className="flex flex-wrap gap-2">
                {UTM_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1 text-sm border border-primary-black dark:border-primary-white rounded hover:bg-primary-black hover:text-primary-white dark:hover:bg-primary-white dark:hover:text-primary-black transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Nome do Link *
                </label>
                <input
                  type="text"
                  value={newUtm.name}
                  onChange={(e) => handleUtmChange('name', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Ex: Instagram Bio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  URL Base *
                </label>
                <input
                  type="url"
                  value={newUtm.base_url}
                  onChange={(e) => handleUtmChange('base_url', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="https://seusite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Origem (utm_source) *
                </label>
                <input
                  type="text"
                  value={newUtm.utm_source}
                  onChange={(e) => handleUtmChange('utm_source', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="instagram, facebook, google"
                />
                <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                  De onde vem o tráfego
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Meio (utm_medium) *
                </label>
                <input
                  type="text"
                  value={newUtm.utm_medium}
                  onChange={(e) => handleUtmChange('utm_medium', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="social, email, cpc, banner"
                />
                <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                  Tipo de marketing
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Campanha (utm_campaign) *
                </label>
                <input
                  type="text"
                  value={newUtm.utm_campaign}
                  onChange={(e) => handleUtmChange('utm_campaign', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="bio_link, summer_sale, launch"
                />
                <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                  Nome da campanha
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Termo (utm_term)
                </label>
                <input
                  type="text"
                  value={newUtm.utm_term}
                  onChange={(e) => handleUtmChange('utm_term', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="palavra-chave (opcional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Conteúdo (utm_content)
                </label>
                <input
                  type="text"
                  value={newUtm.utm_content}
                  onChange={(e) => handleUtmChange('utm_content', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="variação do anúncio (opcional)"
                />
              </div>
            </div>

            {/* Generated URL Preview */}
            {newUtm.generated_url && (
              <div className="mb-4 p-4 bg-primary-black/5 dark:bg-primary-white/5 rounded">
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Link Gerado
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm break-all text-primary-black dark:text-primary-white bg-primary-black/10 dark:bg-primary-white/10 p-2 rounded">
                    {newUtm.generated_url}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newUtm.generated_url, 'new')}
                    className="p-2 border border-primary-black dark:border-primary-white rounded hover:bg-primary-black hover:text-primary-white dark:hover:bg-primary-white dark:hover:text-primary-black transition-colors"
                  >
                    {copiedId === 'new' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={saveUtmLink}
              disabled={!newUtm.generated_url}
              className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black rounded hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Link
            </button>

            {/* Saved Links */}
            {utmLinks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-primary-black dark:text-primary-white mb-4">
                  Links Salvos
                </h3>
                <div className="space-y-3">
                  {utmLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border border-primary-black/20 dark:border-primary-white/20 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary-black dark:text-primary-white">
                          {link.name}
                        </p>
                        <code className="text-xs text-primary-black/60 dark:text-primary-white/60 break-all">
                          {link.generated_url}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => copyToClipboard(link.generated_url, link.id!)}
                          className="p-2 border border-primary-black dark:border-primary-white rounded hover:bg-primary-black hover:text-primary-white dark:hover:bg-primary-white dark:hover:text-primary-black transition-colors"
                          title="Copiar"
                        >
                          {copiedId === link.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button
                          onClick={() => deleteUtmLink(link.id!)}
                          className="p-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

