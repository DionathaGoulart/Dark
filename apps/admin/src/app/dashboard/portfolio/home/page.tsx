'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Trash2, Home, Upload, X, Save, ArrowUp, ArrowDown, Edit } from 'lucide-react'

interface HomeImage {
  id?: string
  image_url: string
  alt_text_pt?: string
  alt_text_en?: string
  order_index: number
  is_active: boolean
}

export default function HomeManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<HomeImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<HomeImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    alt_text_pt: '',
    alt_text_en: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      loadImages()
    }

    getUser()
  }, [router, supabase])

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_home_images')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setImages(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
      setLoading(false)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validImageTypes.includes(file.type)) {
        alert('Tipo de arquivo inválido. Use imagens (JPG, PNG, GIF, WEBP)')
        return null
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `home-${Date.now()}.${fileExt}`
      const filePath = `portfolio/home/${fileName}`

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newImages: HomeImage[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const url = await uploadFile(file)
        if (url) {
          newImages.push({
            image_url: url,
            alt_text_pt: '',
            alt_text_en: '',
            order_index: images.length + i,
            is_active: true
          })
        }
      }

      if (newImages.length > 0) {
        const { error } = await supabase
          .from('portfolio_home_images')
          .insert(newImages)

        if (error) throw error
        loadImages()
        alert(`${newImages.length} imagem(ns) adicionada(s) com sucesso!`)
      }
    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      alert('Erro ao processar arquivos. Tente novamente.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('portfolio_home_images')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadImages()
      alert('Imagem removida com sucesso!')
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      alert('Erro ao remover imagem. Tente novamente.')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const [moved] = newImages.splice(index, 1)
    newImages.splice(newIndex, 0, moved)

    // Atualizar order_index de todas as imagens
    const updates = newImages.map((img, idx) => ({
      id: img.id,
      order_index: idx
    }))

    try {
      for (const update of updates) {
        if (update.id) {
          const { error } = await supabase
            .from('portfolio_home_images')
            .update({ order_index: update.order_index })
            .eq('id', update.id)

          if (error) throw error
        }
      }
      loadImages()
    } catch (error) {
      console.error('Erro ao reordenar imagens:', error)
      alert('Erro ao reordenar imagens. Tente novamente.')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_home_images')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      loadImages()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    }
  }

  const openEditModal = (image: HomeImage) => {
    setEditingImage(image)
    setFormData({
      alt_text_pt: image.alt_text_pt || '',
      alt_text_en: image.alt_text_en || ''
    })
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setEditingImage(null)
    setFormData({
      alt_text_pt: '',
      alt_text_en: ''
    })
  }

  const handleSaveAltText = async () => {
    if (!editingImage?.id) return

    try {
      const { error } = await supabase
        .from('portfolio_home_images')
        .update({
          alt_text_pt: formData.alt_text_pt || null,
          alt_text_en: formData.alt_text_en || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingImage.id)

      if (error) throw error
      closeEditModal()
      loadImages()
      alert('Texto alternativo salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar texto alternativo:', error)
      alert('Erro ao salvar texto alternativo. Tente novamente.')
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
              Gerenciar Home
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Gerencie as imagens da página inicial (upload, ordem, textos alternativos PT/EN)
            </p>
          </div>
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Adicionar Imagens
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-black dark:border-primary-white rounded-lg">
              <Home size={48} className="mx-auto mb-4 text-primary-black/50 dark:text-primary-white/50" />
              <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
                Nenhuma imagem encontrada. Clique em "Adicionar Imagens" para começar.
              </p>
            </div>
          ) : (
            images.map((image, index) => (
              <div
                key={image.id}
                className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => image.id && handleMove(image.id, 'up')}
                      disabled={index === 0}
                      className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all"
                      title="Mover para cima"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => image.id && handleMove(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-black dark:hover:text-primary-white transition-all"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-primary-black/50 dark:text-primary-white/50">
                        #{image.order_index}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${image.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {image.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <img
                      src={image.image_url}
                      alt={image.alt_text_pt || 'Home image'}
                      className="w-full max-w-md h-48 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                    />
                    <div className="mt-2 text-sm text-primary-black/70 dark:text-primary-white/70">
                      {image.alt_text_pt && (
                        <div>PT: {image.alt_text_pt}</div>
                      )}
                      {image.alt_text_en && (
                        <div>EN: {image.alt_text_en}</div>
                      )}
                      {!image.alt_text_pt && !image.alt_text_en && (
                        <div className="text-primary-black/50 dark:text-primary-white/50 italic">
                          Sem texto alternativo
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(image)}
                      className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center gap-2"
                      title="Editar texto alternativo"
                    >
                      <Edit size={16} />
                      Editar Alt
                    </button>
                    <button
                      onClick={() => image.id && handleToggleActive(image.id, image.is_active)}
                      className={`px-4 py-2 rounded text-sm ${image.is_active ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                    >
                      {image.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => image.id && handleDelete(image.id)}
                      className="px-4 py-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Edição de Alt Text */}
        {isModalOpen && editingImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  Editar Texto Alternativo
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-primary-black/10 dark:hover:bg-primary-white/10 rounded transition-colors"
                >
                  <X size={24} className="text-primary-black dark:text-primary-white" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <img
                  src={editingImage.image_url}
                  alt={editingImage.alt_text_pt || 'Preview'}
                  className="w-full h-64 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Texto Alternativo (Português)
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text_pt}
                    onChange={(e) => setFormData({ ...formData, alt_text_pt: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Descrição da imagem em português"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Texto Alternativo (English)
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text_en}
                    onChange={(e) => setFormData({ ...formData, alt_text_en: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Image description in English"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded text-primary-black dark:text-primary-white hover:bg-primary-black/10 dark:hover:bg-primary-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAltText}
                  className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
                >
                  <Save size={20} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

