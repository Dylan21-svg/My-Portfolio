import { projects, skills, experience, education } from './constants'
import initialPortfolioData from '@/data/portfolio-data.json'
import { useState, useEffect } from 'react'
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

const defaultData: PageData = {
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
let isInitialFetchDone = false
const subscribers = new Set<(data: PageData) => void>()

const notifySubscribers = (data: PageData) => {
  cachedPortfolioData = data
  subscribers.forEach((callback) => callback(data))
}

const syncDataFromServer = async () => {
  if (typeof window === 'undefined') return
  try {
    const response = await fetch('/api/portfolio', { cache: 'no-store' })
    if (response.ok) {
      const serverData = await response.json()
      const merged = {
        ...defaultData,
        ...serverData,
        home: { ...defaultData.home, ...(serverData.home || {}) },
        about: { ...defaultData.about, ...(serverData.about || {}) },
        contact: { ...defaultData.contact, ...(serverData.contact || {}) },
        works: { ...defaultData.works, ...(serverData.works || {}) },
        resumes: serverData.resumes || defaultData.resumes,
        resume: serverData.resume || defaultData.resume
      }
      notifySubscribers(merged)
      try {
        localStorage.setItem('portfolioData', JSON.stringify(merged))
      } catch {}
      return
    }
  } catch {}

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem('portfolioData')
    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = {
        ...defaultData,
        ...parsed,
        home: { ...defaultData.home, ...(parsed.home || {}) },
        about: { ...defaultData.about, ...(parsed.about || {}) },
        contact: { ...defaultData.contact, ...(parsed.contact || {}) },
        works: { ...defaultData.works, ...(parsed.works || {}) },
        resumes: parsed.resumes || defaultData.resumes,
        resume: parsed.resume || defaultData.resume
      }
      notifySubscribers(merged)
    }
  } catch {}
}

export function getPortfolioData(): PageData {
  if (typeof window === 'undefined') {
    return defaultData
  }
  return cachedPortfolioData
}

export function usePortfolioData(): PageData {
  const [data, setData] = useState<PageData>(cachedPortfolioData)

  useEffect(() => {
    // Subscribe to state updates
    const handleChange = (newData: PageData) => {
      setData(newData)
    }
    subscribers.add(handleChange)

    // Trigger initial background sync once only
    if (!isInitialFetchDone) {
      isInitialFetchDone = true
      syncDataFromServer()
    }

    // Listen for storage changes from other tabs/admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolioData' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          notifySubscribers({ ...defaultData, ...parsed })
        } catch {}
      }
    }

    const handleDataUpdate = () => syncDataFromServer()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('portfolioDataUpdate', handleDataUpdate)

    return () => {
      subscribers.delete(handleChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('portfolioDataUpdate', handleDataUpdate)
    }
  }, [])

  return data
}

export function savePortfolioData(data: Partial<PageData>) {
  if (typeof window === 'undefined') return

  const current = getPortfolioData()
  const updated = { ...current, ...data }
  localStorage.setItem('portfolioData', JSON.stringify(updated))
}