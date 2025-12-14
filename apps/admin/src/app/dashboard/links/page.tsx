'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'
import { ArrowLeft, Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react'

export default function LinksManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  const loadLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('links_content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar links:', error)
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)
      loadLinks()
    }

    getUser()
  }, [router, supabase, loadLinks])

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
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 text-primary-black dark:text-primary-white hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
              Gerenciar Links
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Gerencie links, textos e conteúdo do site links
            </p>
          </div>
          <button className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2">
            <Plus size={20} />
            Adicionar Link
          </button>
        </div>

        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-black/20 dark:border-primary-white/20 rounded-lg">
              <p className="text-primary-black/50 dark:text-primary-white/50">
                Nenhum link encontrado. Adicione seu primeiro link!
              </p>
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {link.icon_url && (
                    <img
                      src={link.icon_url}
                      alt={link.title || 'Ícone'}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-black dark:text-primary-white mb-1">
                      {link.title || 'Sem título'}
                    </h3>
                    {link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-black/70 dark:text-primary-white/70 hover:underline flex items-center gap-1"
                      >
                        <LinkIcon size={14} />
                        {link.url}
                      </a>
                    )}
                    {link.description && (
                      <p className="text-primary-black/70 dark:text-primary-white/70 mt-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2">
                    <Edit size={16} />
                    Editar
                  </button>
                  <button className="px-4 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}


