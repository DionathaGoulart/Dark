'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Edit, Trash2, Link as LinkIcon, X, Save } from 'lucide-react'

interface Card {
  id?: string
  title?: string
  title_pt?: string
  title_en?: string
  url: string
  description?: string
  icon_url?: string
  order_index: number
}

export default function CardsManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [formData, setFormData] = useState<Card>({
    title_pt: '',
    title_en: '',
    url: '',
    description: '',
    icon_url: '',
    order_index: 0
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
      loadCards()
    }

    getUser()
  }, [router, supabase])

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('links_content')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setCards(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar cards:', error)
      setLoading(false)
    }
  }

  const openModal = (card?: Card) => {
    if (card) {
      setEditingCard(card)
      // Se não tiver title_pt ou title_en, usar o title como fallback para ambos
      const titlePt = card.title_pt || card.title || ''
      const titleEn = card.title_en || card.title || ''
      
      setFormData({
        title_pt: titlePt,
        title_en: titleEn,
        url: card.url || '',
        description: card.description || '',
        icon_url: card.icon_url || '',
        order_index: card.order_index || 0
      })
    } else {
      setEditingCard(null)
      setFormData({
        title_pt: '',
        title_en: '',
        url: '',
        description: '',
        icon_url: '',
        order_index: cards.length
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
      setEditingCard(null)
      setFormData({
        title_pt: '',
        title_en: '',
        url: '',
        description: '',
        icon_url: '',
        order_index: 0
      })
  }

  const handleSave = async () => {
    if ((!formData.title_pt && !formData.title_en) || !formData.url) {
      alert('Título (PT ou EN) e URL são obrigatórios')
      return
    }

    try {
      // Preparar dados para salvar, removendo campos vazios e icon_url
      const dataToSave: any = {
        title_pt: formData.title_pt || null,
        title_en: formData.title_en || null,
        url: formData.url,
        description: formData.description || null,
        order_index: formData.order_index || 0,
        updated_at: new Date().toISOString()
      }

      // Remover campos undefined
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key]
        }
      })

      if (editingCard?.id) {
        // Update
        const { error } = await supabase
          .from('links_content')
          .update(dataToSave)
          .eq('id', editingCard.id)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('links_content')
          .insert(dataToSave)

        if (error) throw error
      }

      closeModal()
      loadCards()
      alert('Card salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar card:', error)
      alert('Erro ao salvar card. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este card?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('links_content')
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
              Gerenciar Cards
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Crie, edite e remova os cards de links exibidos no site
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
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
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-black dark:text-primary-white mb-1">
                      {card.title_pt || card.title_en || card.title || 'Sem título'}
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
                    onClick={() => openModal(card)}
                    className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => card.id && handleDelete(card.id)}
                    className="px-4 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <Trash2 size={16} />
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
                  {editingCard ? 'Editar Card' : 'Novo Card'}
                </h2>
                <button
                  onClick={closeModal}
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
                    value={formData.title_pt || ''}
                    onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Ex: Meu Portfólio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Título em Inglês *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="Ex: My Portfolio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent text-primary-black dark:text-primary-white"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Salvar
                </button>
                <button
                  onClick={closeModal}
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

