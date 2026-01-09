'use client'

import React, { useEffect, useState } from 'react'
import { usePreload } from '@/providers/GlobalPreloadProvider'

import Image from 'next/image'

interface GlobalLoaderProps {
    loadingImage?: string
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({ loadingImage }) => {
    const { isLoading, progress } = usePreload()
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            // Delay para remover o componente do DOM após a animação de fade
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 300) // Tempo da transição CSS
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    if (!isVisible) return null

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 will-change-opacity ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="w-full max-w-[200px] flex flex-col items-center gap-6">
                {/* Logo/Image or Text Loading Effect */}
                {loadingImage ? (
                    <div className="relative w-32 h-32 animate-pulse">
                        <Image
                            src={loadingImage}
                            alt="Loading"
                            fill
                            className="object-contain"
                            priority
                            sizes="128px"
                        />
                    </div>
                ) : (
                    <h1 className="text-white text-xl font-light tracking-[0.2em] animate-pulse">
                        LOADING
                    </h1>
                )}

                {/* Progress Bar Container */}
                <div className="w-full h-[1px] bg-white/20 overflow-hidden">
                    {/* Progress Bar */}
                    <div
                        className="h-full bg-white transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Percentage */}
                <div className="text-white/40 text-xs tracking-widest font-mono">
                    {Math.round(progress)}%
                </div>
            </div>
        </div>
    )
}
