'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client';
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, User, Upload, X } from 'lucide-react'

interface SettingsData {
  id?: string
  site_icon_url: string
  profile_image_url: string
  title: string
  subtitle_pt: string
  subtitle_en: string
  youtube_url: string
  email: string
  instagram_url: string
}

export default function SettingsManagementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [settingsData, setSettingsData] = useState<SettingsData>({
    site_icon_url: '',
    profile_image_url: '',
    title: '',
    subtitle_pt: '',
    subtitle_en: '',
    youtube_url: '',
    email: '',
    instagram_url: ''
  })
  const iconFileInputRef = useRef<HTMLInputElement>(null)
  const profileFileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dark_links_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar settings:', error)
        // Não lançar erro, apenas logar - pode ser que a tabela não exista ainda
        console.log('Tentando continuar mesmo com erro...')
      }

      if (data) {
        // Valores padrão
        const defaultValues = {
          title: '@DARK',
          subtitle_pt: 'dark ilustrador',
          subtitle_en: 'dark illustrator',
          youtube_url: 'https://www.youtube.com/channel/UCw1OmBxX3P-xY_GGkmslJ9g',
          email: 'darkning.arts@gmail.com',
          instagram_url: 'https://www.instagram.com/thedarkk.art/'
        }

        // Garantir que todos os campos sejam strings (não null/undefined)
        // Se o campo estiver vazio, usar valor padrão
        const loadedData = {
          id: data.id,
          site_icon_url: data.site_icon_url || '',
          profile_image_url: data.profile_image_url || '',
          title: data.title || defaultValues.title,
          subtitle_pt: data.subtitle_pt || defaultValues.subtitle_pt,
          subtitle_en: data.subtitle_en || defaultValues.subtitle_en,
          youtube_url: data.youtube_url || defaultValues.youtube_url,
          email: data.email || defaultValues.email,
          instagram_url: data.instagram_url || defaultValues.instagram_url
        }
        console.log('Dados carregados do Supabase:', loadedData)
        console.log('Título carregado:', loadedData.title)
        setSettingsData(loadedData)
      } else {
        console.log('Nenhum dado encontrado na tabela. Execute a migration para criar os dados iniciais.')
        // Inicializar com valores padrão se não houver dados
        setSettingsData({
          site_icon_url: '',
          profile_image_url: '',
          title: '@DARK',
          subtitle_pt: 'dark ilustrador',
          subtitle_en: 'dark illustrator',
          youtube_url: 'https://www.youtube.com/channel/UCw1OmBxX3P-xY_GGkmslJ9g',
          email: 'darkning.arts@gmail.com',
          instagram_url: 'https://www.instagram.com/thedarkk.art/'
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

      loadSettings()
    }

    getUser()
  }, [router, loadSettings])

  const uploadFile = async (file: File, type: 'icon' | 'profile'): Promise<string | null> => {
    try {
      // Validar tipo de arquivo
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
      if (!validImageTypes.includes(file.type)) {
        alert('Tipo de arquivo inválido. Use imagens (JPG, PNG, GIF, WEBP, SVG, ICO)')
        return null
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB')
        return null
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `dark-links/${fileName}`

      // Fazer upload para o Supabase Storage
      const { error } = await supabase.storage
        .from('dark-links-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro ao fazer upload:', error)
        throw error
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('dark-links-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error)
      alert('Erro ao fazer upload do arquivo. Tente novamente.')
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'profile') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'icon') {
      setUploadingIcon(true)
    } else {
      setUploadingProfile(true)
    }

    try {
      const url = await uploadFile(file, type)
      if (url) {
        if (type === 'icon') {
          setSettingsData({ ...settingsData, site_icon_url: url })
        } else {
          setSettingsData({ ...settingsData, profile_image_url: url })
        }
        alert('Arquivo enviado com sucesso! Clique em "Salvar" para confirmar.')
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
    } finally {
      if (type === 'icon') {
        setUploadingIcon(false)
      } else {
        setUploadingProfile(false)
      }
      // Limpar input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (type: 'icon' | 'profile') => {
    if (type === 'icon') {
      setSettingsData({ ...settingsData, site_icon_url: '' })
    } else {
      setSettingsData({ ...settingsData, profile_image_url: '' })
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
        // Update
        const { data, error } = await supabase
          .from('dark_links_settings')
          .update(dataToSave)
          .eq('id', settingsData.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert
        const { data, error } = await supabase
          .from('dark_links_settings')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Garantir que todos os campos sejam strings após salvar
      if (result) {
        setSettingsData({
          id: result.id,
          site_icon_url: result.site_icon_url || '',
          profile_image_url: result.profile_image_url || '',
          title: result.title || '',
          subtitle_pt: result.subtitle_pt || '',
          subtitle_en: result.subtitle_en || '',
          youtube_url: result.youtube_url || '',
          email: result.email || '',
          instagram_url: result.instagram_url || ''
        })
      }
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
          onClick={() => router.push('/dashboard/dark-links')}
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
              Gerencie ícone, foto do perfil, título, subtítulo e links sociais
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
                      <img // eslint-disable-line @next/next/no-img-element
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
                  {/* Input de URL alternativa (opcional) */}
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

              {/* Foto de Perfil */}
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Foto do Perfil
                </label>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'profile')}
                  className="hidden"
                />
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => profileFileInputRef.current?.click()}
                    disabled={uploadingProfile}
                    className="w-full px-4 py-2 border-2 border-dashed border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        {settingsData.profile_image_url ? 'Trocar Foto' : 'Enviar Foto'}
                      </>
                    )}
                  </button>
                  {settingsData.profile_image_url && (
                    <div className="relative inline-block">
                      <img // eslint-disable-line @next/next/no-img-element
                        src={settingsData.profile_image_url}
                        alt="Preview Profile"
                        className="w-24 h-24 object-cover rounded-full border-4 border-primary-black dark:border-primary-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('profile')}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover imagem"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {/* Input de URL alternativa (opcional) */}
                  <div className="text-xs text-primary-black/70 dark:text-primary-white/70">
                    Ou cole uma URL:
                  </div>
                  <input
                    type="url"
                    value={settingsData.profile_image_url || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, profile_image_url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white text-sm"
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Textos */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <User size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Textos
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={settingsData.title || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="@DARK"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Subtítulo (Português)
                </label>
                <input
                  type="text"
                  value={settingsData.subtitle_pt || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, subtitle_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="dark ilustrador"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Subtítulo (English)
                </label>
                <input
                  type="text"
                  value={settingsData.subtitle_en || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, subtitle_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="dark illustrator"
                />
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
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={settingsData.youtube_url || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, youtube_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="https://www.youtube.com/channel/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settingsData.email || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="darkning.arts@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settingsData.instagram_url || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, instagram_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="https://www.instagram.com/darkning.art/"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

