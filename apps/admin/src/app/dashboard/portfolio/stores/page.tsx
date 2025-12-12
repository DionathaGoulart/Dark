'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Save, Store, Plus, Edit, Trash2, ArrowUp, ArrowDown, X, Link as LinkIcon } from 'lucide-react'

interface PageData {
  id?: string
  slug: string
  title_pt: string
  title_en: string
}

interface StoreCard {
  id?: string
  title_pt?: string
  title_en?: string
  url: string
  description?: string
  icon_url?: string
  order_index: number
  is_active: boolean
}

export default function StoresPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState<PageData>({
    slug: 'stores',
    title_pt: '',
    title_en: ''
  })
  const [cards, setCards] = useState<StoreCard[]>([])
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<StoreCard | null>(null)
  const [cardFormData, setCardFormData] = useState<StoreCard>({
    title_pt: '',
    title_en: '',
    url: '',
    description: '',
    icon_url: '',
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
      loadPage()
      loadCards()
    }

    getUser()
  }, [router, supabase])

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_store_cards')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Erro ao carregar cards:', error)
    }
  }

  const loadPage = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_pages')
        .select('*')
        .eq('slug', 'stores')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setPageData({
          slug: data.slug || 'stores',
          title_pt: data.title_pt || '',
          title_en: data.title_en || ''
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar página:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!pageData.title_pt || !pageData.title_en) {
      alert('Título em PT e EN são obrigatórios.')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        slug: 'stores',
        title_pt: pageData.title_pt,
        title_en: pageData.title_en,
        is_active: true,
        order_index: 2,
        updated_at: new Date().toISOString()
      }

      if (pageData.id) {
        const { error } = await supabase
          .from('portfolio_pages')
          .update(dataToSave)
          .eq('id', pageData.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('portfolio_pages')
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error
        setPageData({ ...pageData, id: data.id })
      }

      alert('Página Stores salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar página:', error)
      alert('Erro ao salvar página. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const openCardModal = (card?: StoreCard) => {
    if (card) {
      setEditingCard(card)
      setCardFormData({
        title_pt: card.title_pt || '',
        title_en: card.title_en || '',
        url: card.url || '',
        description: card.description || '',
        icon_url: card.icon_url || '',
        order_index: card.order_index || 0,
        is_active: card.is_active !== undefined ? card.is_active : true
      })
    } else {
      setEditingCard(null)
      setCardFormData({
        title_pt: '',
        title_en: '',
        url: '',
        description: '',
        icon_url: '',
        order_index: cards.length,
        is_active: true
      })
    }
    setIsCardModalOpen(true)
  }

  const closeCardModal = () => {
    setIsCardModalOpen(false)
    setEditingCard(null)
    setCardFormData({
      title_pt: '',
      title_en: '',
      url: '',
      description: '',
      icon_url: '',
      order_index: 0,
      is_active: true
    })
  }

  const handleCardSave = async () => {
    if ((!cardFormData.title_pt && !cardFormData.title_en) || !cardFormData.url) {
      alert('Título (PT ou EN) e URL são obrigatórios')
      return
    }

    try {
      const dataToSave: any = {
        title_pt: cardFormData.title_pt || null,
        title_en: cardFormData.title_en || null,
        url: cardFormData.url,
        description: cardFormData.description || null,
        icon_url: cardFormData.icon_url || null,
        order_index: cardFormData.order_index || 0,
        is_active: cardFormData.is_active,
        updated_at: new Date().toISOString()
      }

      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key]
        }
      })

      if (editingCard?.id) {
        const { error } = await supabase
          .from('portfolio_store_cards')
          .update(dataToSave)
          .eq('id', editingCard.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('portfolio_store_cards')
          .insert(dataToSave)

        if (error) throw error
      }

      closeCardModal()
      loadCards()
      alert('Card salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar card:', error)
      alert('Erro ao salvar card. Tente novamente.')
    }
  }

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/portfolio-assets\/(.+)/)
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1]
      }
      return null
    } catch (error) {
      console.error('Erro ao extrair caminho do arquivo:', error)
      return null
    }
  }

  const handleCardDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este card?')) {
      return
    }

    try {
      const cardToDelete = cards.find(card => card.id === id)
      if (!cardToDelete) {
        alert('Card não encontrado')
        return
      }

      if (cardToDelete.icon_url && cardToDelete.icon_url.includes('supabase.co/storage')) {
        const filePath = extractFilePathFromUrl(cardToDelete.icon_url)
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('portfolio-assets')
            .remove([filePath])

          if (storageError) {
            console.warn('Erro ao deletar arquivo do storage:', storageError)
          }
        }
      }

      const { error } = await supabase
        .from('portfolio_store_cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadCards()
      alert('Card excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir card:', error)
      alert('Erro ao excluir card. Tente novamente.')
    }
  }

  const handleCardMove = async (id: string, direction: 'up' | 'down') => {
    const index = cards.findIndex(card => card.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= cards.length) return

    const newCards = [...cards]
    const [moved] = newCards.splice(index, 1)
    newCards.splice(newIndex, 0, moved)

    try {
      const updates = newCards.map((card, idx) => ({
        id: card.id,
        order_index: idx
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('portfolio_store_cards')
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) throw error
      }

      loadCards()
    } catch (error) {
      console.error('Erro ao mover card:', error)
      alert('Erro ao mover card. Tente novamente.')
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
              Gerenciar Stores
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Edite o título da página Stores e gerencie os cards de lojas
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
          {/* Título */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Store size={24} className="text-primary-black dark:text-primary-white" />
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Título da Página
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Título (Português)
                </label>
                <input
                  type="text"
                  value={pageData.title_pt}
                  onChange={(e) => setPageData({ ...pageData, title_pt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Lojas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                  Título (English)
                </label>
                <input
                  type="text"
                  value={pageData.title_en}
                  onChange={(e) => setPageData({ ...pageData, title_en: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                  placeholder="Stores"
                />
              </div>
            </div>
          </div>

          {/* Cards da Store */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Store size={24} className="text-primary-black dark:text-primary-white" />
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  Cards da Store
                </h2>
              </div>
              <button
                onClick={() => openCardModal()}
                className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={20} />
                Adicionar Card
              </button>
            </div>

            <div className="space-y-4">
              {cards.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-primary-black/20 dark:border-primary-white/20 rounded-lg">
                  <p className="text-primary-black/50 dark:text-primary-white/50">
                    Nenhum card encontrado. Adicione seu primeiro card!
                  </p>
                </div>
              ) : (
                cards.map((card) => (
                  <div
                    key={card.id}
                    className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => card.id && handleCardMove(card.id, 'up')}
                          disabled={cards.findIndex(c => c.id === card.id) === 0}
                          className="p-1 border border-primary-black dark:border-primary-white rounded disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => card.id && handleCardMove(card.id, 'down')}
                          disabled={cards.findIndex(c => c.id === card.id) === cards.length - 1}
                          className="p-1 border border-primary-black dark:border-primary-white rounded disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-black dark:text-primary-white mb-1">
                          {card.title_pt || card.title_en || 'Sem título'}
                        </h3>
                        {(card.title_pt || card.title_en) && (
                          <p className="text-sm text-primary-black/50 dark:text-primary-white/50">
                            PT: {card.title_pt || '-'} | EN: {card.title_en || '-'}
                          </p>
                        )}
                        {card.url && (
                          <a
                            href={card.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-black/70 dark:text-primary-white/70 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon size={14} />
                            {card.url}
                          </a>
                        )}
                        {card.description && (
                          <p className="text-primary-black/70 dark:text-primary-white/70 mt-2">
                            {card.description}
                          </p>
                        )}
                        <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                          Ordem: {card.order_index}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openCardModal(card)}
                        className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => card.id && handleCardDelete(card.id)}
                        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de Card */}
        {isCardModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  {editingCard ? 'Editar Card' : 'Novo Card'}
                </h2>
                <button
                  onClick={closeCardModal}
                  className="text-primary-black dark:text-primary-white hover:opacity-70"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Título em Português *
                  </label>
                  <input
                    type="text"
                    value={cardFormData.title_pt || ''}
                    onChange={(e) => setCardFormData({ ...cardFormData, title_pt: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Ex: Redbubble"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Título em Inglês *
                  </label>
                  <input
                    type="text"
                    value={cardFormData.title_en || ''}
                    onChange={(e) => setCardFormData({ ...cardFormData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Ex: Redbubble"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={cardFormData.url}
                    onChange={(e) => setCardFormData({ ...cardFormData, url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={cardFormData.description || ''}
                    onChange={(e) => setCardFormData({ ...cardFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Descrição opcional do card"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Ordem (número menor aparece primeiro)
                  </label>
                  <input
                    type="number"
                    value={cardFormData.order_index}
                    onChange={(e) => setCardFormData({ ...cardFormData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCardSave}
                  className="flex-1 px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Salvar
                </button>
                <button
                  onClick={closeCardModal}
                  className="px-4 py-2 border-2 border-primary-black dark:border-primary-white text-primary-black dark:text-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

