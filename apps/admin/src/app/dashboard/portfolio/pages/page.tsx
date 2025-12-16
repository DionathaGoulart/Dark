'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Edit, Trash2, FileText, X, Save } from 'lucide-react'

interface Page {
  id?: string
  slug: string
  title_pt: string
  title_en: string
  content_pt: string
  content_en: string
  is_active: boolean
  order_index: number
}

export default function PagesManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [formData, setFormData] = useState<Page>({
    slug: '',
    title_pt: '',
    title_en: '',
    content_pt: '',
    content_en: '',
    is_active: true,
    order_index: 0
  })
  const router = useRouter()

  const loadPages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_pages')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setPages(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar páginas:', error)
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
      loadPages()
    }

    getUser()
  }, [router, loadPages])

  const openModal = (page?: Page) => {
    if (page) {
      setEditingPage(page)
      setFormData({
        slug: page.slug || '',
        title_pt: page.title_pt || '',
        title_en: page.title_en || '',
        content_pt: page.content_pt || '',
        content_en: page.content_en || '',
        is_active: page.is_active !== undefined ? page.is_active : true,
        order_index: page.order_index || 0
      })
    } else {
      setEditingPage(null)
      setFormData({
        slug: '',
        title_pt: '',
        title_en: '',
        content_pt: '',
        content_en: '',
        is_active: true,
        order_index: pages.length
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPage(null)
    setFormData({
      slug: '',
      title_pt: '',
      title_en: '',
      content_pt: '',
      content_en: '',
      is_active: true,
      order_index: 0
    })
  }

  const handleSave = async () => {
    if (!formData.slug || !formData.title_pt || !formData.title_en) {
      alert('Slug e títulos (PT/EN) são obrigatórios')
      return
    }

    try {
      const dataToSave: Partial<Page> = {
        slug: formData.slug,
        title_pt: formData.title_pt,
        title_en: formData.title_en,
        content_pt: formData.content_pt || undefined,
        content_en: formData.content_en || undefined,
        is_active: formData.is_active,
        order_index: formData.order_index
      }

      if (editingPage?.id) {
        const { error } = await supabase
          .from('portfolio_pages')
          .update(dataToSave)
          .eq('id', editingPage.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('portfolio_pages')
          .insert(dataToSave)

        if (error) throw error
      }

      closeModal()
      loadPages()
      alert('Página salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar página:', error)
      alert('Erro ao salvar página. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta página?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('portfolio_pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPages()
      alert('Página removida com sucesso!')
    } catch (error) {
      console.error('Erro ao remover página:', error)
      alert('Erro ao remover página. Tente novamente.')
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
              Gerenciar Páginas
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Crie, edite e remova páginas do site (ex: About)
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar Página
          </button>
        </div>

        <div className="space-y-4">
          {pages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-black dark:border-primary-white rounded-lg">
              <FileText size={48} className="mx-auto mb-4 text-primary-black/50 dark:text-primary-white/50" />
              <p className="text-primary-black/70 dark:text-primary-white/70">
                Nenhuma página encontrada. Clique em "Adicionar Página" para começar.
              </p>
            </div>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-primary-black/50 dark:text-primary-white/50">
                        #{page.order_index}
                      </span>
                      <span className="text-lg font-bold text-primary-black dark:text-primary-white">
                        /{page.slug}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${page.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {page.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <span className="text-sm text-primary-black/70 dark:text-primary-white/70">PT: </span>
                        <span className="font-medium text-primary-black dark:text-primary-white">{page.title_pt}</span>
                      </div>
                      <div>
                        <span className="text-sm text-primary-black/70 dark:text-primary-white/70">EN: </span>
                        <span className="font-medium text-primary-black dark:text-primary-white">{page.title_en}</span>
                      </div>
                    </div>
                    {page.content_pt && (
                      <p className="text-sm text-primary-black/60 dark:text-primary-white/60 line-clamp-2">
                        {page.content_pt.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openModal(page)}
                      className="p-2 border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300"
                      title="Editar"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => page.id && handleDelete(page.id)}
                      className="p-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                      title="Remover"
                    >
                      <Trash2 size={20} />
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
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  {editingPage ? 'Editar Página' : 'Nova Página'}
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
                      placeholder="about"
                    />
                    <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                      Ex: about, contact, etc.
                    </p>
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
                      placeholder="Sobre"
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
                      placeholder="About"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Conteúdo (Português)
                    </label>
                    <textarea
                      value={formData.content_pt}
                      onChange={(e) => setFormData({ ...formData, content_pt: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Conteúdo da página em português..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Conteúdo (English)
                    </label>
                    <textarea
                      value={formData.content_en}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Page content in English..."
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

