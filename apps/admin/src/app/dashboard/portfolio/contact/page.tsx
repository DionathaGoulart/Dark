'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client';
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Mail } from 'lucide-react'

interface PageData {
  id?: string
  slug: string
  title_pt: string
  title_en: string
  content_pt: string
  content_en: string
}

interface SettingsData {
  id?: string
  contact_email: string
}

export default function ContactPage() {
  // const [user, setUser] = useState<any>(null) // Removed unused user state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState<PageData>({
    slug: 'contact',
    title_pt: '',
    title_en: '',
    content_pt: '',
    content_en: ''
  })
  const [settingsData, setSettingsData] = useState<SettingsData>({
    contact_email: ''
  })
  const router = useRouter()

  const loadPage = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_pages')
        .select('*')
        .eq('slug', 'contact')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPageData({
          slug: data.slug || 'contact',
          title_pt: data.title_pt || '',
          title_en: data.title_en || '',
          content_pt: data.content_pt || '',
          content_en: data.content_en || ''
        })
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar settings:', error)
      }

      if (data) {
        setSettingsData({
          id: data.id,
          contact_email: data.contact_email || 'darkning.arts@gmail.com'
        })
      } else {
        setSettingsData({
          contact_email: 'darkning.arts@gmail.com'
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
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

      // setUser(user)
      loadPage()
      loadSettings()
    }

    getUser()
  }, [router, loadPage, loadSettings])

  const handleSave = async () => {
    if (!pageData.title_pt || !pageData.title_en) {
      alert('Título em PT e EN são obrigatórios.')
      return
    }

    setSaving(true)
    try {
      // Salvar página
      const pageDataToSave = {
        slug: 'contact',
        title_pt: pageData.title_pt,
        title_en: pageData.title_en,
        content_pt: pageData.content_pt || '',
        content_en: pageData.content_en || '',
        is_active: true,
        order_index: 1,
        updated_at: new Date().toISOString()
      }

      if (pageData.id) {
        const { error } = await supabase
          .from('portfolio_pages')
          .update(pageDataToSave)
          .eq('id', pageData.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('portfolio_pages')
          .insert(pageDataToSave)
          .select()
          .single()

        if (error) throw error
        setPageData({ ...pageData, id: data.id })
      }

      // Salvar email de contato
      const settingsDataToSave = {
        contact_email: settingsData.contact_email || 'darkning.arts@gmail.com',
        updated_at: new Date().toISOString()
      }

      if (settingsData.id) {
        const { error } = await supabase
          .from('portfolio_settings')
          .update(settingsDataToSave)
          .eq('id', settingsData.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('portfolio_settings')
          .insert(settingsDataToSave)
          .select()
          .single()

        if (error) throw error
        setSettingsData({ ...settingsData, id: data.id })
      }

      alert('Página Contact e email salvos com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar. Tente novamente.')
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
              Gerenciar Contact
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Edite o conteúdo da página Contact em Português e Inglês
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
          {/* Português */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Conteúdo - Português
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={pageData.title_pt}
                  onChange={(e) => setPageData({ ...pageData, title_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Contato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={pageData.content_pt}
                  onChange={(e) => setPageData({ ...pageData, content_pt: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Escreva o conteúdo da página Contact em português..."
                />
              </div>
            </div>
          </div>

          {/* Inglês */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Content - English
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={pageData.title_en}
                  onChange={(e) => setPageData({ ...pageData, title_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Content
                </label>
                <textarea
                  value={pageData.content_en}
                  onChange={(e) => setPageData({ ...pageData, content_en: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Write the Contact page content in English..."
                />
              </div>
            </div>
          </div>

          {/* Email de Contato */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Email de Contato
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={settingsData.contact_email || ''}
                onChange={(e) => setSettingsData({ ...settingsData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                placeholder="darkning.arts@gmail.com"
              />
              <p className="mt-2 text-sm text-primary-black/60 dark:text-primary-white/60">
                Este email será exibido na página de contato e receberá as mensagens do formulário
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

