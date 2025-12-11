'use client'

import { useRouter } from 'next/navigation'
import { MainLayout } from '@/shared'
import { ArrowLeft, Search, Settings, Link2 } from 'lucide-react'

export default function DarkLinksDashboardPage() {
  const router = useRouter()

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
            Gerenciar Dark Links
          </h1>
          <p className="text-primary-black/70 dark:text-primary-white/70">
            Configure e gerencie todas as configurações do site Dark Links
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SEO */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Search className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                SEO
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Configure título, descrição, palavras-chave, Open Graph, Twitter Cards, Analytics e Robots em PT/EN
            </p>
            <button 
              onClick={() => router.push('/dashboard/dark-links/seo')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar SEO
            </button>
          </div>

          {/* Configurações Gerais */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Settings className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Configurações
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Gerencie ícone, foto do perfil, título, subtítulo e links sociais (YouTube, Email, Instagram)
            </p>
            <button 
              onClick={() => router.push('/dashboard/dark-links/settings')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Configurações
            </button>
          </div>

          {/* Cards/Links */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Link2 className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Cards
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Crie, edite e remova os cards de links exibidos no site
            </p>
            <button 
              onClick={() => router.push('/dashboard/dark-links/cards')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Cards
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

