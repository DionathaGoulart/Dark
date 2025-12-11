'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/shared'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
              Dashboard
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              Bem-vindo, {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-4">
              Gerenciar Portfolio
            </h2>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Gerencie imagens, textos e conteúdo do site portfolio
            </p>
            <button 
              onClick={() => router.push('/dashboard/portfolio')}
              className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Acessar
            </button>
          </div>

          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white mb-4">
              Gerenciar Dark Links
            </h2>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Configure SEO, configurações gerais e cards do site Dark Links
            </p>
            <button 
              onClick={() => router.push('/dashboard/dark-links')}
              className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Acessar
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

