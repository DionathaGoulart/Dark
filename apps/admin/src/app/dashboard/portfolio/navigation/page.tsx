'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Edit, Trash2, Navigation as NavIcon, X, Save } from 'lucide-react'

interface NavItem {
  id?: string
  label_pt: string
  label_en: string
  href: string
  order_index: number
  is_active: boolean
}

export default function NavigationManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavItem | null>(null)
  const [formData, setFormData] = useState<NavItem>({
    label_pt: '',
    label_en: '',
    href: '',
    order_index: 0,
    is_active: true
  })
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
      loadNavItems()
    }

    getUser()
  }, [router, supabase])

  const loadNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_navigation')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setNavItems(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar itens de navegação:', error)
      setLoading(false)
    }
  }

  const openModal = (item?: NavItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        label_pt: item.label_pt || '',
        label_en: item.label_en || '',
        href: item.href || '',
        order_index: item.order_index || 0,
        is_active: item.is_active !== undefined ? item.is_active : true
      })
    } else {
      setEditingItem(null)
      setFormData({
        label_pt: '',
        label_en: '',
        href: '',
        order_index: navItems.length,
        is_active: true
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      label_pt: '',
      label_en: '',
      href: '',
      order_index: 0,
      is_active: true
    })
  }

  const handleSave = async () => {
    if (!formData.label_pt || !formData.label_en || !formData.href) {
      alert('Label (PT/EN) e URL são obrigatórios')
      return
    }

    try {
      const dataToSave: Partial<NavItem> = {
        label_pt: formData.label_pt,
        label_en: formData.label_en,
        href: formData.href,
        order_index: formData.order_index,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      if (editingItem?.id) {
        const { error } = await supabase
          .from('portfolio_navigation')
          .update(dataToSave)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('portfolio_navigation')
          .insert(dataToSave)

        if (error) throw error
      }

      closeModal()
      loadNavItems()
      alert('Item de navegação salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      alert('Erro ao salvar item. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item de navegação?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('portfolio_navigation')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadNavItems()
      alert('Item removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover item:', error)
      alert('Erro ao remover item. Tente novamente.')
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
              Gerenciar Navegação
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Gerencie os links do menu de navegação (PT/EN)
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Adicionar Item
          </button>
        </div>

        <div className="space-y-4">
          {navItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-black dark:border-primary-white rounded-lg">
              <NavIcon size={48} className="mx-auto mb-4 text-primary-black/50 dark:text-primary-white/50" />
              <p className="text-primary-black/70 dark:text-primary-white/70">
                Nenhum item de navegação encontrado. Clique em "Adicionar Item" para começar.
              </p>
            </div>
          ) : (
            navItems.map((item) => (
              <div
                key={item.id}
                className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-medium text-primary-black/50 dark:text-primary-white/50">
                      #{item.order_index}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-primary-black/70 dark:text-primary-white/70">PT: </span>
                      <span className="font-medium text-primary-black dark:text-primary-white">{item.label_pt}</span>
                    </div>
                    <div>
                      <span className="text-sm text-primary-black/70 dark:text-primary-white/70">EN: </span>
                      <span className="font-medium text-primary-black dark:text-primary-white">{item.label_en}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-primary-black/70 dark:text-primary-white/70">URL: </span>
                    <span className="text-primary-black dark:text-primary-white">{item.href}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300"
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    className="p-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                    title="Remover"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
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
                      Label (Português) *
                    </label>
                    <input
                      type="text"
                      value={formData.label_pt}
                      onChange={(e) => setFormData({ ...formData, label_pt: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Início"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Label (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.label_en}
                      onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                      placeholder="Home"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    URL (href) *
                  </label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="/about"
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

