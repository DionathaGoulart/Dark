'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Evento global para iniciar loading
export const startNavigationLoading = () => {
  window.dispatchEvent(new CustomEvent('navigation-start'))
}

export const NavigationLoader: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleStart = useCallback(() => {
    setLoading(true)
    setProgress(10)
  }, [])

  useEffect(() => {
    setLoading(false)
    setProgress(0)
  }, [pathname, searchParams])

  useEffect(() => {
    let progressInterval: NodeJS.Timeout

    const startProgress = () => {
      handleStart()
      progressInterval = setInterval(() => {
        setProgress(prev => prev >= 90 ? prev : prev + Math.random() * 10)
      }, 200)
    }

    // Listener para evento customizado (router.push)
    const handleCustomStart = () => startProgress()
    window.addEventListener('navigation-start', handleCustomStart)

    // Intercepta cliques em links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link?.href && !link.href.startsWith('#') && !link.target) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          startProgress()
        }
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('navigation-start', handleCustomStart)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [pathname, handleStart])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div 
        className="h-full bg-primary-black dark:bg-primary-white transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
