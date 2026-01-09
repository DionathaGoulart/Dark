'use client'

export const STORAGE_KEYS = {
    HOME_IMAGES: 'portfolio_home_images',
    PROJECTS: 'portfolio_projects',
    PROJECT_IMAGES_PREFIX: 'portfolio_project_images_',
    PROJECT_DATA_PREFIX: 'portfolio_project_data_',
    STORE_CARDS: 'portfolio_store_cards',
    ABOUT_PAGE: 'portfolio_about_page',
    CONTACT_PAGE: 'portfolio_contact_page',
    PREFETCH_DONE: 'portfolio_prefetch_done',
    PREFETCH_TIMESTAMP: 'portfolio_prefetch_timestamp'
} as const

const CACHE_TTL = 30 * 60 * 1000 // 30 minutos

export const isCacheValid = (): boolean => {
    if (typeof window === 'undefined') return false
    const timestamp = sessionStorage.getItem(STORAGE_KEYS.PREFETCH_TIMESTAMP)
    if (!timestamp) return false
    return Date.now() - parseInt(timestamp, 10) < CACHE_TTL
}

export const saveToStorage = (key: string, data: any) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(data))
    } catch (e) { }
}

export const loadFromStorage = <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    try {
        const data = sessionStorage.getItem(key)
        return data ? JSON.parse(data) : null
    } catch {
        return null
    }
}
