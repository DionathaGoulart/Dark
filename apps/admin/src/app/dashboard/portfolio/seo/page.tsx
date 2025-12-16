'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Globe } from 'lucide-react'

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

export default function PortfolioSeoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      loadSeoData()
    }

    getUser()
  }, [router, loadSeoData])

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
        </div>
      </div>
    </MainLayout>
  )
}

