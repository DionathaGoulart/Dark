'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PreloadContextType {
    isLoading: boolean
    progress: number
    startLoading: () => void
    finishLoading: () => void
    setProgress: (progress: number) => void
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined)

export const PreloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    const startLoading = () => {
        setIsLoading(true)
        setProgress(0)
    }

    const finishLoading = () => {
        setProgress(100)
        // Pequeno delay para garantir que a barra de progresso chegue a 100% visualmente
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }

    return (
        <PreloadContext.Provider value={{ isLoading, progress, startLoading, finishLoading, setProgress }}>
            {children}
        </PreloadContext.Provider>
    )
}

export const usePreload = () => {
    const context = useContext(PreloadContext)
    if (!context) {
        throw new Error('usePreload must be used within a PreloadProvider')
    }
    return context
}
