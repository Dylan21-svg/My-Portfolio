import { projects, skills, experience, education } from './constants'
import initialPortfolioData from '@/data/portfolio-data.json'
import { useState, useEffect, useCallback } from 'react'
import { ResumeDocument } from './types'

export interface PageData {
  home: {
    hero: {
      name: string
      title: string
      tagline: string
      ctaText: string
      profileImage: string
      backgroundImage: string
    }
    cards: Array<{
      id: string
      type: 'profile' | 'tech-stack' | 'credentials' | 'projects' | 'services' | 'profiles' | 'stats' | 'cta'
      title?: string
      content?: string
      image?: string
      links?: { name: string; url: string }[]
    }>
    stats: { number: string; label: string }[]
  }
  about: {
    profile: {
      name: string
      bio: string
      image: string
    }
    experience: any[]
    education: any[]
  }
  works: {
    projects: any[]
  }
  contact: {
    info: {
      email: string
      phone: string
      location: string
    }
    social: { platform: string; url: string }[]
  }
  resume?: {
    url: string
    filename: string
  }
  resumes?: ResumeDocument[]
}

const defaultResumes: ResumeDocument[] = [
  {
    id: 'resume-primary',
    title: 'Primary Technical Resume',
    label: 'Senior Backend & Distributed Systems Engineer',
    filename: 'Che_Dylan_Backend_Resume.pdf',
    fileSize: '142 KB',
    fileType: 'application/pdf',
    url: '/resume.pdf',
    uploadedAt: '2026-08-15',
    description: 'Focused on Python, FastAPI, distributed task queues, database concurrency, and high-scale architecture.'
  },
  {
    id: 'resume-secondary',
    title: 'Full-Stack & Solutions Resume',
    label: 'Full-Stack & Systems Solutions Architect',
    filename: 'Che_Dylan_FullStack_Resume.pdf',
    fileSize: '158 KB',
    fileType: 'application/pdf',
    url: '/resume.pdf',
    uploadedAt: '2026-08-15',
    description: 'Focused on full-stack architecture, Next.js/React frontend integration, REST/WebSocket APIs, and cloud deployments.'
  }
]

export const defaultData: PageData = {
  ...initialPortfolioData,
  about: {
    ...initialPortfolioData.about,
    experience: initialPortfolioData.about.experience || experience,
    education: initialPortfolioData.about.education || education,
  },
  works: {
    projects: initialPortfolioData.works.projects || projects
  },
  resumes: (initialPortfolioData as any).resumes || defaultResumes
} as unknown as PageData

let cachedPortfolioData: PageData = defaultData
const subscribers = new Set<(data: PageData) => void>()

// Merge helper to cleanly combine remote or stored data with defaults
export function mergePortfolioData(incoming: any): PageData {
  if (!incoming || typeof incoming !== 'object') return defaultData

  return {
    ...defaultData,
    ...incoming,
    home: {
      ...defaultData.home,
      ...(incoming.home || {}),
      hero: {
        ...defaultData.home.hero,
        ...(incoming.home?.hero || {})
      },
      cards: incoming.home?.cards || defaultData.home.cards,
      stats: incoming.home?.stats || defaultData.home.stats,
    },
    about: {
      ...defaultData.about,
      ...(incoming.about || {}),
      profile: {
        ...defaultData.about.profile,
        ...(incoming.about?.profile || {})
      },
      experience: incoming.about?.experience || defaultData.about.experience,
      education: incoming.about?.education || defaultData.about.education,
    },
    works: {
      ...defaultData.works,
      ...(incoming.works || {}),
      projects: (() => {
        const defaultProjects = defaultData.works?.projects || []
        const incomingProjects = incoming.works?.projects
        if (!Array.isArray(incomingProjects) || incomingProjects.length === 0) {
          return defaultProjects
        }
        const defaultMap = new Map(defaultProjects.map((p: any) => [p.id, p]))
        const mergedList = incomingProjects.map((p: any) => {
          const def = defaultMap.get(p.id)
          if (!def) return p
          return {
            ...def,
            ...p,
            image: def.image || p.image,
            images: def.images || p.images
          }
        })
        defaultProjects.forEach((def: any) => {
          if (!mergedList.some((p: any) => p.id === def.id)) {
            mergedList.push(def)
          }
        })
        return mergedList
      })()
    },
    contact: {
      ...defaultData.contact,
      ...(incoming.contact || {}),
      info: {
        ...defaultData.contact.info,
        ...(incoming.contact?.info || {})
      },
      social: incoming.contact?.social || defaultData.contact.social
    },
    resumes: incoming.resumes || (incoming.resume ? [
      {
        id: 'resume-primary',
        title: 'Primary Technical Resume',
        label: 'Senior Backend & Distributed Systems Engineer',
        filename: incoming.resume.filename || 'Che_Dylan_Backend_Resume.pdf',
        fileSize: '142 KB',
        fileType: 'application/pdf',
        url: incoming.resume.url || '/resume.pdf',
        uploadedAt: '2026-08-15',
        description: 'Focused on Python, FastAPI, distributed task queues, database concurrency, and high-scale architecture.'
      }
    ] : defaultData.resumes),
    resume: incoming.resume || defaultData.resume
  }
}

export const notifySubscribers = (data: PageData) => {
  cachedPortfolioData = data
  subscribers.forEach((callback) => {
    try {
      callback(data)
    } catch {}
  })
}

// Synchronize from server API or localStorage
export const syncDataFromServer = async (): Promise<PageData> => {
  if (typeof window === 'undefined') return cachedPortfolioData

  // 1. First check localStorage for immediate updates
  try {
    const local = localStorage.getItem('portfolioData')
    if (local) {
      const parsedLocal = JSON.parse(local)
      const mergedLocal = mergePortfolioData(parsedLocal)
      cachedPortfolioData = mergedLocal
      notifySubscribers(mergedLocal)
    }
  } catch {}

  // 2. Fetch fresh data from server API
  try {
    const res = await fetch('/api/portfolio', {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
    if (res.ok) {
      const serverJson = await res.json()
      if (serverJson && typeof serverJson === 'object' && Object.keys(serverJson).length > 0) {
        const merged = mergePortfolioData(serverJson)
        cachedPortfolioData = merged
        notifySubscribers(merged)
        try {
          localStorage.setItem('portfolioData', JSON.stringify(merged))
        } catch {}
        return merged
      }
    }
  } catch (err) {
    console.warn('Notice: Background portfolio server sync unreachable:', err)
  }

  return cachedPortfolioData
}

export function getPortfolioData(): PageData {
  if (typeof window === 'undefined') {
    return defaultData
  }
  // Try reading from localStorage if cached is still default
  try {
    const local = localStorage.getItem('portfolioData')
    if (local) {
      return mergePortfolioData(JSON.parse(local))
    }
  } catch {}
  return cachedPortfolioData
}

export function usePortfolioData(): PageData {
  const [data, setData] = useState<PageData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('portfolioData')
        if (local) {
          return mergePortfolioData(JSON.parse(local))
        }
      } catch {}
    }
    return cachedPortfolioData
  })

  useEffect(() => {
    // Subscribe to state updates
    const handleChange = (newData: PageData) => {
      setData(newData)
    }
    subscribers.add(handleChange)

    // Trigger sync on mount
    syncDataFromServer()

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolioData' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const merged = mergePortfolioData(parsed)
          notifySubscribers(merged)
        } catch {}
      }
    }

    const handleDataUpdate = () => {
      syncDataFromServer()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDataFromServer()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('portfolioDataUpdate', handleDataUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscribers.delete(handleChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('portfolioDataUpdate', handleDataUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return data
}

export async function savePortfolioData(dataToSave: Partial<PageData>) {
  if (typeof window === 'undefined') return

  const current = getPortfolioData()
  const updated = mergePortfolioData({ ...current, ...dataToSave })

  // Update in-memory & subscribers immediately
  notifySubscribers(updated)

  // Update localStorage immediately
  try {
    localStorage.setItem('portfolioData', JSON.stringify(updated))
  } catch {}

  // Dispatch custom event for any listeners
  window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))

  // Save to server
  try {
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  } catch (e) {
    console.warn('Failed to save portfolio data to remote API:', e)
  }
}
