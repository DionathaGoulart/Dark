'use client'

import { useRouter } from 'next/navigation'
import { MainLayout } from '@/shared'
import { ArrowLeft, Search, Settings, Navigation as NavIcon, Home, FolderKanban, FileText, Mail, Store } from 'lucide-react'

export default function PortfolioDashboardPage() {
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
            Gerenciar Portfolio
          </h1>
          <p className="text-primary-black/70 dark:text-primary-white/70">
            Configure e gerencie todas as configurações do site Portfolio
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
              onClick={() => router.push('/dashboard/portfolio/seo')}
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
              Gerencie ícone, logo e links sociais (Instagram, YouTube)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/settings')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Configurações
            </button>
          </div>

          {/* Navegação */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <NavIcon className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Navegação
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Gerencie os links do menu de navegação (PT/EN)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/navigation')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Navegação
            </button>
          </div>

          {/* Home - Imagens */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Home className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Home
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Gerencie as imagens da página inicial (upload, ordem)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/home')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Home
            </button>
          </div>

          {/* Projetos */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <FolderKanban className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Projetos
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Crie, edite e remova projetos (capa, título, layout)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/projects')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Projetos
            </button>
          </div>

          {/* About */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <FileText className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                About
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Edite o conteúdo da página Sobre (PT/EN)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/about')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar About
            </button>
          </div>

          {/* Contact */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Mail className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Contact
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Edite o conteúdo da página Contato (PT/EN)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/contact')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Contact
            </button>
          </div>

          {/* Stores */}
          <div className="border-2 border-primary-black dark:border-primary-white p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                <Store className="w-6 h-6 text-primary-white dark:text-primary-black" />
              </div>
              <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                Stores
              </h2>
            </div>
            <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
              Edite o conteúdo da página Stores (PT/EN)
            </p>
            <button
              onClick={() => router.push('/dashboard/portfolio/stores')}
              className="w-full px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300"
            >
              Gerenciar Stores
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
