import { projects, skills, experience, education } from './constants'
import { useState, useEffect } from 'react'

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
    experience: typeof experience
    education: typeof education
  }
  works: {
    projects: typeof projects
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
}

const defaultData: PageData = {
  home: {
    hero: {
      name: 'DYLAN SPARKS',
      title: 'BACKEND SOFTWARE ENGINEER',
      tagline: 'Specializing in scalable Python architectures, API design, and distributed systems.',
      ctaText: 'DOWNLOAD RESUME',
      profileImage: 'https://via.placeholder.com/300x300/1a7a7a/ffffff?text=Profile',
      backgroundImage: 'https://via.placeholder.com/1920x1080/0d4d4d/1a7a7a?text=Hero+Background'
    },
    cards: [
      { id: '1', type: 'profile', title: 'SUMMARY', content: 'Your Name\nYour Location' },
      { id: '2', type: 'tech-stack', title: 'Tech Stack' },
      { id: '3', type: 'credentials', title: 'Credentials', content: 'Technical Specialist: Advanced Python Backend Development & API Design\nAWS Certified Developer' },
      { id: '4', type: 'projects', title: 'Projects' },
      { id: '5', type: 'services', title: 'Services Offering' },
      { id: '6', type: 'profiles', title: 'Profiles' }
    ],
    stats: []
  },
  about: {
    profile: {
      name: 'DYLAN SPARKS',
      bio: 'I am a Software Engineer and Chief Operating Officer at SAMITECH Corporation, focused on building high-impact, scalable solutions. Currently pursuing my Higher National Diploma in Software Engineering, I bridge the gap between technical execution and operational strategy. My technical expertise is rooted in the Python ecosystem, where I specialize in developing SaaS platforms and AI/ML-driven applications. I am particularly passionate about architectural challenges, such as designing offline-first systems that ensure software remains functional and accessible in low-connectivity environments.',
      image: 'https://via.placeholder.com/200x200/1a7a7a/ffffff?text=Profile'
    },
    experience: [],
    education: []
  },
  works: { projects: [] },
  contact: {
    info: {
      email: 'your.email@example.com',
      phone: '+1 (555) 000-0000',
      location: 'Your City, Country'
    },
    social: []
  }
}

export function getPortfolioData(): PageData {
  if (typeof window === 'undefined') {
    return defaultData
  }

  const saved = localStorage.getItem('portfolioData')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return { 
        ...defaultData, 
        ...parsed,
        home: { ...defaultData.home, ...(parsed.home || {}) },
        about: { ...defaultData.about, ...(parsed.about || {}) },
        contact: { ...defaultData.contact, ...(parsed.contact || {}) }
      }
    } catch {
      return defaultData
    }
  }

  return defaultData
}

export function usePortfolioData(): PageData {
  const [data, setData] = useState<PageData>(defaultData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from API first (server-side storage)
        const response = await fetch('/api/portfolio')
        if (response.ok) {
          const serverData = await response.json()
          setData({ ...defaultData, ...serverData })
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('portfolioData')
          if (saved) {
            const parsed = JSON.parse(saved)
            // Deep merge home and other sections to ensure new defaults are kept
            const merged = {
              ...defaultData,
              ...parsed,
              home: { ...defaultData.home, ...(parsed.home || {}) },
              about: { ...defaultData.about, ...(parsed.about || {}) },
              contact: { ...defaultData.contact, ...(parsed.contact || {}) }
            }
            setData(merged)
          } else {
            setData(defaultData)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem('portfolioData')
        if (saved) {
          try {
            setData({ ...defaultData, ...JSON.parse(saved) })
          } catch {
            setData(defaultData)
          }
        } else {
          setData(defaultData)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Listen for storage changes (when admin panel saves data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolioData') {
        loadData()
      }
    }

    // Also listen for custom events from admin panel
    const handleDataUpdate = () => loadData()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('portfolioDataUpdate', handleDataUpdate)

    return () => {
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