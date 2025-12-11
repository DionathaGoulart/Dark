'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-white dark:bg-primary-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white p-8 rounded-lg">
          <h1 className="text-3xl font-bold text-primary-black dark:text-primary-white mb-6 text-center">
            Painel Admin
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white bg-primary-white dark:bg-primary-black text-primary-black dark:text-primary-white rounded focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white bg-primary-white dark:bg-primary-black text-primary-black dark:text-primary-white rounded focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border-2 border-red-500 rounded text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black font-semibold rounded border-2 border-primary-black dark:border-primary-white hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


