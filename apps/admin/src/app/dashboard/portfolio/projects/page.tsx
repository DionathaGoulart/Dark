'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Edit, Trash2, FolderKanban, X, Save, Upload, Image as ImageIcon } from 'lucide-react'

interface Project {
  id?: string
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

export default function ProjectsManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [formData, setFormData] = useState<Project>({
    slug: '',
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: '',
    cover_image_url: '',
    layout_type: 'grid',
    is_active: true,
    order_index: 0
  })
  const coverFileInputRef = useRef<HTMLInputElement>(null)
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
      loadProjects()
    }

    getUser()
  }, [router, supabase])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setProjects(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
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

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `project-cover-${Date.now()}.${fileExt}`
      const filePath = `portfolio/projects/${fileName}`

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

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        setFormData({ ...formData, cover_image_url: url })
        alert('Capa enviada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        slug: project.slug || '',
        title_pt: project.title_pt || '',
        title_en: project.title_en || '',
        description_pt: project.description_pt || '',
        description_en: project.description_en || '',
        cover_image_url: project.cover_image_url || '',
        layout_type: project.layout_type || 'grid',
        is_active: project.is_active !== undefined ? project.is_active : true,
        order_index: project.order_index || 0
      })
    } else {
      setEditingProject(null)
      setFormData({
        slug: '',
        title_pt: '',
        title_en: '',
        description_pt: '',
        description_en: '',
        cover_image_url: '',
        layout_type: 'grid',
        is_active: true,
        order_index: projects.length
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    setFormData({
      slug: '',
      title_pt: '',
      title_en: '',
      description_pt: '',
      description_en: '',
      cover_image_url: '',
      layout_type: 'grid',
      is_active: true,
      order_index: 0
    })
  }

  const handleSave = async () => {
    if (!formData.slug || !formData.title_pt || !formData.title_en || !formData.cover_image_url) {
      alert('Slug, títulos (PT/EN) e capa são obrigatórios')
      return
    }

    try {
      const dataToSave: Partial<Project> = {
        slug: formData.slug,
        title_pt: formData.title_pt,
        title_en: formData.title_en,
        description_pt: formData.description_pt || null,
        description_en: formData.description_en || null,
        cover_image_url: formData.cover_image_url,
        layout_type: formData.layout_type,
        is_active: formData.is_active,
        order_index: formData.order_index,
        updated_at: new Date().toISOString()
      }

      if (editingProject?.id) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update(dataToSave)
          .eq('id', editingProject.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('portfolio_projects')
          .insert(dataToSave)

        if (error) throw error
      }

      closeModal()
      loadProjects()
      alert('Projeto salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      alert('Erro ao salvar projeto. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este projeto? Todas as imagens do projeto também serão removidas.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadProjects()
      alert('Projeto removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover projeto:', error)
      alert('Erro ao remover projeto. Tente novamente.')
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
              Gerenciar Projetos
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Crie, edite e remova projetos (capa, título, layout)
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar Projeto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-primary-black dark:border-primary-white rounded-lg">
              <FolderKanban size={48} className="mx-auto mb-4 text-primary-black/50 dark:text-primary-white/50" />
              <p className="text-primary-black/70 dark:text-primary-white/70">
                Nenhum projeto encontrado. Clique em "Adicionar Projeto" para começar.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="border-2 border-primary-black dark:border-primary-white rounded-lg overflow-hidden"
              >
                <div className="relative aspect-square">
                  <img
                    src={project.cover_image_url}
                    alt={project.title_pt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      #{project.order_index}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${project.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                      {project.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {project.layout_type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-primary-black dark:text-primary-white mb-1">
                    {project.title_pt}
                  </h3>
                  <p className="text-sm text-primary-black/70 dark:text-primary-white/70 mb-2">
                    /{project.slug}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/dashboard/portfolio/projects/${project.id}/images`)}
                      className="flex-1 px-3 py-2 border-2 border-primary-black dark:border-primary-white rounded text-sm hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all"
                    >
                      <ImageIcon size={16} className="inline mr-1" />
                      Imagens
                    </button>
                    <button
                      onClick={() => openModal(project)}
                      className="px-3 py-2 border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => project.id && handleDelete(project.id)}
                      className="px-3 py-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-primary-black/10 dark:hover:bg-primary-white/10 rounded transition-colors"
                >
                  <X size={24} className="text-primary-black dark:text-primary-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="horror-art"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                        Ordem
                      </label>
                      <input
                        type="number"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium text-primary-black dark:text-primary-white">
                          Ativo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Título (Português) *
                    </label>
                    <input
                      type="text"
                      value={formData.title_pt}
                      onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Arte de Horror"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Título (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Horror Art"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Descrição (Português)
                    </label>
                    <textarea
                      value={formData.description_pt}
                      onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Descrição do projeto..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Descrição (English)
                    </label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Project description..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Layout *
                  </label>
                  <select
                    value={formData.layout_type}
                    onChange={(e) => setFormData({ ...formData, layout_type: e.target.value as 'grid' | 'masonry' | 'solo' })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  >
                    <option value="grid">Grid</option>
                    <option value="masonry">Masonry</option>
                    <option value="solo">Solo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Imagem de Capa *
                  </label>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="w-full px-4 py-2 border-2 border-dashed border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploadingCover ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          {formData.cover_image_url ? 'Trocar Capa' : 'Enviar Capa'}
                        </>
                      )}
                    </button>
                    {formData.cover_image_url && (
                      <div className="relative">
                        <img
                          src={formData.cover_image_url}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                        />
                      </div>
                    )}
                    <input
                      type="url"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white text-sm"
                      placeholder="Ou cole uma URL da imagem"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded text-primary-black dark:text-primary-white hover:bg-primary-black/10 dark:hover:bg-primary-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
                  >
                    <Save size={20} />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

