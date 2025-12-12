'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Upload, X } from 'lucide-react'

interface SettingsData {
  id?: string
  site_icon_url: string
  logo_url: string
  instagram_url: string
  youtube_url: string
  footer_text?: string // Mantido para compatibilidade
  footer_text_pt: string
  footer_text_en: string
}

export default function PortfolioSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [settingsData, setSettingsData] = useState<SettingsData>({
    site_icon_url: '',
    logo_url: '',
    instagram_url: '',
    youtube_url: '',
    footer_text_pt: '',
    footer_text_en: ''
  })
  const iconFileInputRef = useRef<HTMLInputElement>(null)
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      loadSettings()
    }

    getUser()
  }, [router, supabase])

  const loadSettings = async () => {
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
        const defaultValues = {
          instagram_url: 'https://www.instagram.com/darkning.art',
          youtube_url: 'https://www.youtube.com/@darkning_art',
          footer_text_pt: '© 2025 Todos os direitos reservados.',
          footer_text_en: '© 2025 All rights reserved.'
        }

        // Migração: se tiver footer_text antigo, usar para ambos
        const footerTextPt = data.footer_text_pt || data.footer_text || defaultValues.footer_text_pt
        const footerTextEn = data.footer_text_en || data.footer_text || defaultValues.footer_text_en

        setSettingsData({
          id: data.id,
          site_icon_url: data.site_icon_url || '',
          logo_url: data.logo_url || '',
          instagram_url: data.instagram_url || defaultValues.instagram_url,
          youtube_url: data.youtube_url || defaultValues.youtube_url,
          footer_text_pt: footerTextPt,
          footer_text_en: footerTextEn
        })
      } else {
        setSettingsData({
          site_icon_url: '',
          logo_url: '',
          instagram_url: 'https://www.instagram.com/darkning.art',
          youtube_url: 'https://www.youtube.com/@darkning_art',
          footer_text_pt: '© 2025 Todos os direitos reservados.',
          footer_text_en: '© 2025 All rights reserved.'
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setLoading(false)
    }
  }

  const uploadFile = async (file: File, type: 'icon' | 'logo'): Promise<string | null> => {
    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
      if (!validImageTypes.includes(file.type)) {
        alert('Tipo de arquivo inválido. Use imagens (JPG, PNG, GIF, WEBP, SVG, ICO)')
        return null
      }

      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `portfolio/${fileName}`

      const { data, error } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro ao fazer upload:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error)
      alert('Erro ao fazer upload do arquivo. Tente novamente.')
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'icon') {
      setUploadingIcon(true)
    } else {
      setUploadingLogo(true)
    }

    try {
      const url = await uploadFile(file, type)
      if (url) {
        if (type === 'icon') {
          setSettingsData({ ...settingsData, site_icon_url: url })
        } else {
          setSettingsData({ ...settingsData, logo_url: url })
        }
        alert('Arquivo enviado com sucesso! Clique em "Salvar" para confirmar.')
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
    } finally {
      if (type === 'icon') {
        setUploadingIcon(false)
      } else {
        setUploadingLogo(false)
      }
      e.target.value = ''
    }
  }

  const handleRemoveImage = (type: 'icon' | 'logo') => {
    if (type === 'icon') {
      setSettingsData({ ...settingsData, site_icon_url: '' })
    } else {
      setSettingsData({ ...settingsData, logo_url: '' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave = {
        ...settingsData,
        updated_at: new Date().toISOString()
      }

      let result
      if (settingsData.id) {
        const { data, error } = await supabase
          .from('portfolio_settings')
          .update(dataToSave)
          .eq('id', settingsData.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('portfolio_settings')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Migração: se tiver footer_text antigo, usar para ambos
      const footerTextPt = result.footer_text_pt || result.footer_text || ''
      const footerTextEn = result.footer_text_en || result.footer_text || ''

      setSettingsData({
        id: result.id,
        site_icon_url: result.site_icon_url || '',
        logo_url: result.logo_url || '',
        instagram_url: result.instagram_url || '',
        youtube_url: result.youtube_url || '',
        footer_text_pt: footerTextPt,
        footer_text_en: footerTextEn
      })
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
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
              Configurações Gerais
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Gerencie ícone, logo e links sociais do Portfolio
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
          {/* Imagens */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Imagens
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Ícone do Site (Favicon)
                </label>
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/*,.ico"
                  onChange={(e) => handleFileSelect(e, 'icon')}
                  className="hidden"
                />
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => iconFileInputRef.current?.click()}
                    disabled={uploadingIcon}
                    className="w-full px-4 py-2 border-2 border-dashed border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingIcon ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        {settingsData.site_icon_url ? 'Trocar Ícone' : 'Enviar Ícone'}
                      </>
                    )}
                  </button>
                  {settingsData.site_icon_url && (
                    <div className="relative inline-block">
                      <img
                        src={settingsData.site_icon_url}
                        alt="Preview Favicon"
                        className="w-16 h-16 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('icon')}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover imagem"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-primary-black/70 dark:text-primary-white/70">
                    Ou cole uma URL:
                  </div>
                  <input
                    type="url"
                    value={settingsData.site_icon_url || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, site_icon_url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white text-sm"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Logo
                </label>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'logo')}
                  className="hidden"
                />
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="w-full px-4 py-2 border-2 border-dashed border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        {settingsData.logo_url ? 'Trocar Logo' : 'Enviar Logo'}
                      </>
                    )}
                  </button>
                  {settingsData.logo_url && (
                    <div className="relative inline-block">
                      <img
                        src={settingsData.logo_url}
                        alt="Preview Logo"
                        className="w-32 h-32 object-contain border-2 border-primary-black dark:border-primary-white rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('logo')}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover imagem"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-primary-black/70 dark:text-primary-white/70">
                    Ou cole uma URL:
                  </div>
                  <input
                    type="url"
                    value={settingsData.logo_url || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, logo_url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Links Sociais */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Links Sociais
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settingsData.instagram_url || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, instagram_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="https://www.instagram.com/darkning.art"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={settingsData.youtube_url || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, youtube_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="https://www.youtube.com/@darkning_art"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-6">
              Rodapé
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Texto do Rodapé (Português)
                </label>
                <input
                  type="text"
                  value={settingsData.footer_text_pt || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, footer_text_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="© 2025 Todos os direitos reservados."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Texto do Rodapé (English)
                </label>
                <input
                  type="text"
                  value={settingsData.footer_text_en || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, footer_text_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="© 2025 All rights reserved."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

