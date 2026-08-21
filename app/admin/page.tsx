'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Save,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  LogOut,
  Layers,
  User,
  Briefcase,
  Mail,
  FileText,
  Terminal,
  Activity,
  Network,
  Database,
  Scale,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Info,
  GitBranch,
  Copy,
  Check,
  Award,
  Zap,
  Cpu,
  Image as ImageIcon
} from 'lucide-react'
import { Project, Experience, Education, ProjectMetric, ProjectEndpoint, ArchitectureNode, SchemaTable, ConcurrencyTradeoff, PostMortemLesson, ResumeDocument } from '@/lib/types'
import { projects, experience, education } from '@/lib/constants'
import { soundFX } from '@/lib/soundfx'
import { notifySubscribers, mergePortfolioData } from '@/lib/data'
import AIProjectScannerModal from '@/components/AIProjectScannerModal'
import ProjectImageUploader from '@/components/admin/ProjectImageUploader'
import ResumeManager from '@/components/admin/ResumeManager'

interface Card {
  id: string
  type: 'profile' | 'tech-stack' | 'credentials' | 'projects' | 'services' | 'profiles' | 'stats' | 'cta'
  title?: string
  content?: string
  image?: string
  links?: { name: string; url: string }[]
}

interface PageData {
  home: {
    hero: {
      name: string
      title: string
      tagline: string
      ctaText: string
      profileImage: string
      backgroundImage: string
    }
    cards: Card[]
    stats: { number: string; label: string }[]
  }
  about: {
    profile: {
      name: string
      bio: string
      image: string
    }
    experience: Experience[]
    education: Education[]
  }
  works: {
    projects: Project[]
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

const defaultData: PageData = {
  home: {
    hero: {
      name: 'CHE AMAH DILAND NGWA',
      title: 'SOFTWARE ENGINEER',
      tagline: 'I specialize in backend architecture where speed, security, and scalability converge.',
      ctaText: 'EXPLORE ARCHITECTURE',
      profileImage: '/images/D21.jpeg',
      backgroundImage: '/images/dylan.jpg'
    },
    cards: [
      { id: '1', type: 'profile', title: 'A SOFTWARE ENGINEER', content: 'Che Amah Diland Ngwa\nBuea, Cameroon' },
      { id: '2', type: 'tech-stack', title: 'Tech Stack' },
      { id: '3', type: 'credentials', title: 'Credentials', content: 'AWS Certified Developer\nReact Certified' },
      { id: '4', type: 'projects', title: 'Projects' },
      { id: '5', type: 'services', title: 'Services Offering' },
      { id: '6', type: 'profiles', title: 'Profiles' }
    ],
    stats: [
      { number: '04', label: 'YEARS EXPERIENCE' },
      { number: '+20', label: 'CLIENTS WORLDWIDE' },
      { number: '+30', label: 'TOTAL PROJECTS' }
    ]
  },
  about: {
    profile: {
      name: 'CHE AMAH DILAND NGWA',
      bio: 'Software Engineer and COO at SAMITECH Corporation, focused on building high-impact, scalable distributed systems.',
      image: '/images/dylan1.jpg'
    },
    experience,
    education
  },
  works: { projects },
  contact: {
    info: {
      email: 'ngwadiland68@gmail.com',
      phone: '+237 672 344 814',
      location: 'Buea, Cameroon'
    },
    social: [
      { platform: 'GitHub', url: 'https://github.com/Dylan21-svg' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platform: 'Twitter', url: 'https://twitter.com' }
    ]
  },
  resume: {
    url: '/resume.pdf',
    filename: 'Che_Dylan_Backend_Resume.pdf'
  },
  resumes: [
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
}

export default function Admin() {
  const router = useRouter()
  const [data, setData] = useState<PageData>(defaultData)
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'works' | 'experience' | 'contact' | 'resume'>('works')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedProjectIdx, setExpandedProjectIdx] = useState<number | null>(0)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // AI Project Scanner & Recruiter Pitch Generator States
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false)
  const [aiScannerRepoUrl, setAiScannerRepoUrl] = useState('')
  const [aiScannerProjectIdx, setAiScannerProjectIdx] = useState<number | null>(null)
  const [quickScanUrl, setQuickScanUrl] = useState('')
  const [isQuickScanning, setIsQuickScanning] = useState(false)
  const [copiedPitchIdx, setCopiedPitchIdx] = useState<number | null>(null)

  const openAiScanner = (repoUrl?: string, projectIdx?: number | null) => {
    setAiScannerRepoUrl(repoUrl || '')
    setAiScannerProjectIdx(projectIdx ?? null)
    setIsAiScannerOpen(true)
    soundFX.playClick(600)
  }

  const handleApplyAiProject = (scannedProject: Project) => {
    if (aiScannerProjectIdx !== null && aiScannerProjectIdx >= 0) {
      // Update existing project
      const updated = [...data.works.projects]
      updated[aiScannerProjectIdx] = {
        ...updated[aiScannerProjectIdx],
        ...scannedProject,
      }
      setData(prev => ({
        ...prev,
        works: { projects: updated }
      }))
      setExpandedProjectIdx(aiScannerProjectIdx)
      setSaveStatus(`✨ Updated "${scannedProject.title}" with AI scan!`)
    } else {
      // Add as new project
      setData(prev => ({
        ...prev,
        works: { projects: [scannedProject, ...prev.works.projects] }
      }))
      setExpandedProjectIdx(0)
      setSaveStatus(`✨ Added "${scannedProject.title}" from AI repo scan!`)
    }
    setTimeout(() => setSaveStatus(null), 3500)
  }

  const handleQuickScan = async () => {
    if (!quickScanUrl.trim()) {
      openAiScanner()
      return
    }
    setIsQuickScanning(true)
    soundFX.playClick(600)
    try {
      const res = await fetch('/api/admin/ai-project-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: quickScanUrl.trim(),
          focusArea: 'Distributed Systems & Backend Scale',
          targetRole: 'Senior Backend Engineer'
        })
      })
      const resData = await res.json()
      if (resData.success && resData.project) {
        setData(prev => ({
          ...prev,
          works: { projects: [resData.project, ...prev.works.projects] }
        }))
        setExpandedProjectIdx(0)
        setQuickScanUrl('')
        soundFX.playSuccess()
        setSaveStatus(`✨ Added "${resData.project.title}" from GitHub scan!`)
        setTimeout(() => setSaveStatus(null), 3500)
      } else {
        throw new Error(resData.error || 'Scan failed')
      }
    } catch (e: any) {
      console.error('Quick scan error:', e)
      openAiScanner(quickScanUrl)
    } finally {
      setIsQuickScanning(false)
    }
  }

  const [isAutoMappingImages, setIsAutoMappingImages] = useState(false)

  const handleAutoMapImages = async () => {
    setIsAutoMappingImages(true)
    soundFX.playClick(700)
    try {
      const res = await fetch('/api/admin/map-images', { method: 'POST' })
      const resData = await res.json()
      if (resData.success) {
        soundFX.playSuccess()
        // Refresh local state with updated projects
        const refreshRes = await fetch('/api/portfolio')
        if (refreshRes.ok) {
          const freshData = await refreshRes.json()
          setData(prev => ({
            ...prev,
            works: {
              ...prev.works,
              projects: freshData.works?.projects || prev.works.projects
            }
          }))
        }
        setSaveStatus(`🖼️ Auto-mapped ${resData.mappedCount} projects to local image assets!`)
        setTimeout(() => setSaveStatus(null), 4000)
      } else {
        throw new Error(resData.error || resData.message || 'Mapping failed')
      }
    } catch (err: any) {
      console.error('Auto-map images error:', err)
      setSaveStatus(`❌ Failed to auto-map images: ${err.message}`)
      setTimeout(() => setSaveStatus(null), 4000)
    } finally {
      setIsAutoMappingImages(false)
    }
  }

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()

    // Fetch existing server data or fallback to localStorage
    const loadData = async () => {
      try {
        const res = await fetch('/api/portfolio')
        if (res.ok) {
          const remoteData = await res.json()
          setData({ ...defaultData, ...remoteData })
          return
        }
      } catch (e) {
        console.warn('Could not fetch remote data, checking local storage:', e)
      }

      const saved = localStorage.getItem('portfolioData')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setData({ ...defaultData, ...parsed })
        } catch {
          setData(defaultData)
        }
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    try {
      soundFX.playClick(400)
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const saveData = async () => {
    setIsSaving(true)
    soundFX.playClick(600)
    setSaveStatus('Saving changes...')
    try {
      // 1. Immediately update client cache & notify subscribers
      const merged = mergePortfolioData(data)
      notifySubscribers(merged)
      try {
        localStorage.setItem('portfolioData', JSON.stringify(data))
      } catch {}
      window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))

      // 2. Persist to server API
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        soundFX.playSuccess()
        setSaveStatus('✔ Saved & Synchronized to Live Site!')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save to server')
      }
    } catch (error: any) {
      console.error('Save notice:', error)
      soundFX.playSuccess()
      setSaveStatus('✔ Saved to Local Session & Cache!')
      setTimeout(() => setSaveStatus(null), 3500)
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all portfolio data back to system defaults?')) {
      setData(defaultData)
      notifySubscribers(defaultData as any)
      try {
        localStorage.setItem('portfolioData', JSON.stringify(defaultData))
      } catch {}
      window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))
      fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultData),
      }).catch(() => {})
      soundFX.playSuccess()
      setSaveStatus('Reset to defaults')
      setTimeout(() => setSaveStatus(null), 2500)
    }
  }

  // Helper functions for updating project attributes
  const updateProjectField = <K extends keyof Project>(index: number, field: K, value: Project[K]) => {
    const updated = [...data.works.projects]
    updated[index] = { ...updated[index], [field]: value }
    setData(prev => ({
      ...prev,
      works: { projects: updated }
    }))
  }

  const addProject = () => {
    soundFX.playSuccess()
    const newProj: Project = {
      title: 'New High-Scale Project',
      category: 'Distributed Systems',
      role: 'Backend Architect',
      timeline: '2024',
      status: 'Production',
      tagline: 'High throughput asynchronous event architecture with 99.99% availability.',
      description: 'Production backend architected with low-latency streaming queues and microservices.',
      challenge: 'Handling distributed transaction consistency without distributed locking bottlenecks.',
      solution: 'Implemented idempotent event sourcing with Redis stream consumer groups.',
      image: '/images/D1.jpeg',
      images: ['/images/D1.jpeg', '/images/D2.jpeg'],
      technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
      features: ['Sub-15ms p99 response time', 'Atomic transaction locks', 'Automated horizontal autoscaling'],
      metrics: [
        { label: 'Throughput', value: '45,000 req/s', change: '+320% over baseline' },
        { label: 'p99 Latency', value: '12ms', change: '-70% delay' },
        { label: 'Availability SLA', value: '99.99%', change: 'Zero dropped events' }
      ],
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/events/ingest',
          description: 'High-throughput stream event ingestion with atomic validation.',
          requestPayload: '{\n  "event_type": "transaction.created",\n  "amount": 250.0,\n  "currency": "USD"\n}',
          responsePayload: '{\n  "status": "queued",\n  "event_id": "evt_9941a",\n  "partition": 3\n}',
          status: 202,
          latency: '8ms'
        }
      ],
      architectureNodes: [
        {
          id: 'gw-1',
          label: 'API Gateway & Rate Limiter',
          type: 'gateway',
          tech: 'Traefik / Envoy',
          description: 'TLS termination, token auth, and token-bucket rate limiting.',
          throughput: '50k RPS',
          latency: '2ms',
          connections: ['srv-1']
        },
        {
          id: 'srv-1',
          label: 'Core Ingestion Cluster',
          type: 'service',
          tech: 'Python FastAPI',
          description: 'Validates schema payloads and publishes messages to asynchronous queue.',
          throughput: '45k RPS',
          latency: '10ms',
          connections: ['queue-1']
        },
        {
          id: 'queue-1',
          label: 'Distributed Message Broker',
          type: 'queue',
          tech: 'Redis Streams / RabbitMQ',
          description: 'Partitioned consumer groups for persistent buffer retention.',
          throughput: '80k msgs/s',
          latency: '1.5ms',
          connections: []
        }
      ],
      schemaTables: [
        {
          tableName: 'events_log',
          description: 'Immutable append-only ledger for all inbound platform events.',
          columns: [
            { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
            { name: 'event_type', type: 'VARCHAR(64)', constraints: 'NOT NULL' },
            { name: 'payload', type: 'JSONB', constraints: 'NOT NULL' },
            { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()' }
          ],
          indexes: ['CREATE INDEX idx_events_type_created ON events_log (event_type, created_at DESC)']
        }
      ],
      concurrencyTradeoffs: [
        {
          approach: 'Redis Lua Atomic Locking',
          status: 'chosen',
          reason: 'Prevents race conditions in high-concurrency order settlement without table locks.',
          benefits: ['Sub-millisecond execution', 'Zero deadlocks across distributed workers'],
          tradeoffs: ['Memory-bound Redis RAM cost', 'Script execution blocks Redis single thread']
        }
      ],
      postMortem: [
        {
          incident: 'Consumer Queue Buffer Overflow',
          impact: '15-minute ingestion latency spike during promotional flash sale.',
          rootCause: 'Single consumer thread saturated by CPU-bound JSON deserialization.',
          resolution: 'Migrated to orjson C-accelerated parser and scaled to 8 concurrent worker pods.',
          takeaway: 'Decouple ingestion serialization from database write execution.'
        }
      ],
      liveUrl: 'https://codeforge.dev',
      githubUrl: 'https://github.com/Dylan21-svg'
    }

    setData(prev => ({
      ...prev,
      works: { projects: [newProj, ...prev.works.projects] }
    }))
    setExpandedProjectIdx(0)
  }

  const deleteProject = (index: number) => {
    if (confirm('Delete this project from your portfolio?')) {
      soundFX.playClick(400)
      setData(prev => ({
        ...prev,
        works: { projects: prev.works.projects.filter((_, i) => i !== index) }
      }))
      setExpandedProjectIdx(null)
    }
  }

  // Metric helpers
  const updateMetric = (projIdx: number, metricIdx: number, field: keyof ProjectMetric, val: string) => {
    const proj = data.works.projects[projIdx]
    const updatedMetrics = [...(proj.metrics || [])]
    updatedMetrics[metricIdx] = { ...updatedMetrics[metricIdx], [field]: val }
    updateProjectField(projIdx, 'metrics', updatedMetrics)
  }

  const addMetric = (projIdx: number) => {
    const proj = data.works.projects[projIdx]
    const updatedMetrics = [...(proj.metrics || []), { label: 'New Metric', value: '100 ms', change: '+50%' }]
    updateProjectField(projIdx, 'metrics', updatedMetrics)
  }

  const removeMetric = (projIdx: number, metricIdx: number) => {
    const proj = data.works.projects[projIdx]
    const updatedMetrics = (proj.metrics || []).filter((_, i) => i !== metricIdx)
    updateProjectField(projIdx, 'metrics', updatedMetrics)
  }

  // Endpoint helpers
  const updateEndpoint = (projIdx: number, epIdx: number, field: keyof ProjectEndpoint, val: any) => {
    const proj = data.works.projects[projIdx]
    const updatedEps = [...(proj.endpoints || [])]
    updatedEps[epIdx] = { ...updatedEps[epIdx], [field]: val }
    updateProjectField(projIdx, 'endpoints', updatedEps)
  }

  const addEndpoint = (projIdx: number) => {
    const proj = data.works.projects[projIdx]
    const newEp: ProjectEndpoint = {
      method: 'GET',
      path: '/api/v1/health',
      description: 'Healthcheck and cluster telemetry endpoint',
      responsePayload: '{\n  "status": "healthy",\n  "uptime": "99.99%"\n}',
      status: 200,
      latency: '3ms'
    }
    updateProjectField(projIdx, 'endpoints', [...(proj.endpoints || []), newEp])
  }

  const removeEndpoint = (projIdx: number, epIdx: number) => {
    const proj = data.works.projects[projIdx]
    updateProjectField(projIdx, 'endpoints', (proj.endpoints || []).filter((_, i) => i !== epIdx))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark text-white pt-24 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-gray font-mono text-sm">Verifying cryptographic session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background-dark text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-background-medium/95 border border-primary/30 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display text-white">System Admin Console</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Live Control Plane
                </span>
              </div>
              <p className="text-xs text-text-gray font-mono">
                Session: <span className="text-primary font-semibold">Authenticated Administrator</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {saveStatus && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                {saveStatus}
              </span>
            )}

            <button
              onClick={resetToDefaults}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-gray hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button
              onClick={saveData}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-mono font-bold transition-all shadow-teal-glow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Synchronizing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-background-dark border border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('works')
              soundFX.playClick(500)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'works'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Projects & Case Studies ({data.works.projects.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('experience')
              soundFX.playClick(550)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'experience'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Experience & Education</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('home')
              soundFX.playClick(600)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero & Overview</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about')
              soundFX.playClick(650)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>About Bio</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('contact')
              soundFX.playClick(700)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact & Socials</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('resume')
              soundFX.playClick(750)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === 'resume'
                ? 'bg-primary text-white shadow-teal-glow'
                : 'text-text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resume Documents (2)</span>
          </button>
        </div>

        {/* 1. WORKS / PROJECTS TAB */}
        {activeTab === 'works' && (
          <div className="space-y-6">
            {/* AI Repository Scanner & Recruiter Intelligence Feature Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-background-medium/95 via-primary/10 to-background-medium/95 border border-primary/40 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-teal-glow mt-0.5">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-display">
                        AI Repository Scanner & Recruiter Architect
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono font-semibold">
                        Gemini 3.7
                      </span>
                    </div>
                    <p className="text-xs text-text-gray font-mono mt-1">
                      Scans GitHub repos and generates recruiter-magnetic case studies, system design topologies, quantifiable XYZ metrics & API schemas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openAiScanner()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-mono text-xs font-bold transition-all shadow-teal-glow flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Deep AI Architect Modal</span>
                  </button>
                  <button
                    onClick={addProject}
                    className="px-3.5 py-2.5 rounded-xl bg-background-dark hover:bg-white/10 text-white font-mono text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manual</span>
                  </button>
                </div>
              </div>

              {/* Fast Repository Input Bar */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    value={quickScanUrl}
                    onChange={(e) => setQuickScanUrl(e.target.value)}
                    placeholder="Enter GitHub URL (e.g. https://github.com/Dylan21-svg/CodeForge or owner/repo)..."
                    disabled={isQuickScanning}
                    className="w-full bg-background-dark/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:border-primary outline-none placeholder:text-text-gray/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleQuickScan}
                  disabled={isQuickScanning}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2 shrink-0"
                >
                  {isQuickScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Repo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan & Add Project</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-text-gray">
                <span>Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => setQuickScanUrl('Dylan21-svg/CodeForge')}
                  className="px-2 py-0.5 rounded bg-background-dark hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-text-gray hover:text-primary transition-colors"
                >
                  Dylan21-svg/CodeForge
                </button>
                <button
                  type="button"
                  onClick={() => setQuickScanUrl('Dylan21-svg/My-Portfolio')}
                  className="px-2 py-0.5 rounded bg-background-dark hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-text-gray hover:text-primary transition-colors"
                >
                  Dylan21-svg/My-Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setQuickScanUrl('fastapi/fastapi')}
                  className="px-2 py-0.5 rounded bg-background-dark hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-text-gray hover:text-primary transition-colors"
                >
                  fastapi/fastapi
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display">Manage Production Projects ({data.works.projects.length})</h2>
                <p className="text-xs text-text-gray font-mono">
                  Full control over case studies, system design topologies, API endpoints, and post-mortems.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAutoMapImages}
                  disabled={isAutoMappingImages}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                  title="Automatically map local image files in public/ to matching projects"
                >
                  <ImageIcon className={`w-4 h-4 ${isAutoMappingImages ? 'animate-spin' : ''}`} />
                  <span>{isAutoMappingImages ? 'Mapping Images...' : 'Auto-Map Local Images'}</span>
                </button>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-background-dark text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* Project List Accordion */}
            <div className="space-y-4">
              {data.works.projects.map((proj, pIdx) => {
                const isExpanded = expandedProjectIdx === pIdx
                return (
                  <div
                    key={pIdx}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-background-medium/95 border-primary/40 shadow-xl'
                        : 'bg-background-medium/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Project Header Bar */}
                    <div
                      onClick={() => {
                        setExpandedProjectIdx(isExpanded ? null : pIdx)
                        soundFX.playClick(500)
                      }}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-xs">
                          {pIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-display">{proj.title}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-primary">
                              {proj.category}
                            </span>
                            {proj.status && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                                {proj.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-gray font-mono truncate max-w-lg mt-0.5">
                            {proj.tagline || proj.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openAiScanner(proj.githubUrl || proj.title, pIdx)
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-mono transition-colors flex items-center gap-1.5"
                          title="Rescan or Enhance with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">AI Enhance</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(pIdx)
                          }}
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-text-gray hover:text-rose-400 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-text-gray" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-gray" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Project Edit Form */}
                    {isExpanded && (
                      <div className="p-6 border-t border-white/10 bg-black/20 space-y-6">
                        {/* AI Recruiter Pitch Quick Panel */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 via-black/40 to-primary/10 border border-primary/30 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" />
                              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                                Recruiter Elevator Pitch & Resume Highlights
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const textToCopy = `PROJECT: ${proj.title} (${proj.category})\nROLE: ${proj.role || 'Backend Engineer'} | ${proj.timeline || '2024'}\nTAGLINE: ${proj.tagline || ''}\n\nCORE ACCOMPLISHMENTS:\n${(proj.features || []).map(f => '• ' + f).join('\n')}\n\nKEY METRICS:\n${(proj.metrics || []).map(m => `• ${m.label}: ${m.value} (${m.change || ''})`).join('\n')}\n\nCHALLENGE & SOLUTION:\nChallenge: ${proj.challenge || ''}\nSolution: ${proj.solution || ''}`
                                  navigator.clipboard.writeText(textToCopy)
                                  soundFX.playSuccess()
                                  setCopiedPitchIdx(pIdx)
                                  setTimeout(() => setCopiedPitchIdx(null), 2500)
                                }}
                                className="px-2.5 py-1 rounded bg-background-dark hover:bg-white/10 text-text-gray hover:text-white text-xs font-mono border border-white/10 transition-colors flex items-center gap-1"
                              >
                                {copiedPitchIdx === pIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedPitchIdx === pIdx ? 'Copied Dossier!' : 'Copy Recruiter Dossier'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openAiScanner(proj.githubUrl || proj.title, pIdx)}
                                className="px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary text-xs font-mono border border-primary/40 transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Rescan Repo with AI</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-mono text-text-gray leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
                            &ldquo;{proj.tagline || proj.description}&rdquo;
                          </p>
                        </div>
                        {/* 1. Core Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProjectField(pIdx, 'title', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Category</label>
                            <input
                              type="text"
                              value={proj.category}
                              onChange={(e) => updateProjectField(pIdx, 'category', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Role / Timeline</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={proj.role || 'Backend Engineer'}
                                onChange={(e) => updateProjectField(pIdx, 'role', e.target.value)}
                                className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                                placeholder="Role"
                              />
                              <input
                                type="text"
                                value={proj.timeline || '2024'}
                                onChange={(e) => updateProjectField(pIdx, 'timeline', e.target.value)}
                                className="w-24 bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                                placeholder="Year"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tagline & Description */}
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Tagline Summary</label>
                            <input
                              type="text"
                              value={proj.tagline || ''}
                              onChange={(e) => updateProjectField(pIdx, 'tagline', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                              placeholder="Brief 1-sentence engineering elevator pitch"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Comprehensive Overview</label>
                            <textarea
                              value={proj.description}
                              onChange={(e) => updateProjectField(pIdx, 'description', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Challenge & Solution */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-rose-400 font-semibold">The Engineering Challenge</label>
                            <textarea
                              value={proj.challenge || ''}
                              onChange={(e) => updateProjectField(pIdx, 'challenge', e.target.value)}
                              className="w-full bg-background-dark border border-rose-500/30 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-rose-400 outline-none"
                              rows={3}
                              placeholder="Describe data consistency bottlenecks, scale ceilings, or latency issues"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-emerald-400 font-semibold">Architectural Solution</label>
                            <textarea
                              value={proj.solution || ''}
                              onChange={(e) => updateProjectField(pIdx, 'solution', e.target.value)}
                              className="w-full bg-background-dark border border-emerald-500/30 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-400 outline-none"
                              rows={3}
                              placeholder="Describe microservices, asynchronous queues, caching, or database strategies"
                            />
                          </div>
                        </div>

                        {/* Metrics Editor */}
                        <div className="p-4 rounded-xl bg-background-dark border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-primary font-bold flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5" />
                              <span>Quantifiable Performance Metrics ({proj.metrics?.length || 0})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => addMetric(pIdx)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-primary/20 text-text-gray hover:text-primary text-[11px] font-mono border border-white/10 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Metric</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(proj.metrics || []).map((m, mIdx) => (
                              <div key={mIdx} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2 relative group">
                                <button
                                  type="button"
                                  onClick={() => removeMetric(pIdx, mIdx)}
                                  className="absolute top-2 right-2 text-text-gray/50 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="text"
                                  value={m.value}
                                  onChange={(e) => updateMetric(pIdx, mIdx, 'value', e.target.value)}
                                  className="w-full bg-background-dark border border-white/10 rounded px-2 py-1 text-xs font-mono text-primary font-bold"
                                  placeholder="e.g. 50k req/s"
                                />
                                <input
                                  type="text"
                                  value={m.label}
                                  onChange={(e) => updateMetric(pIdx, mIdx, 'label', e.target.value)}
                                  className="w-full bg-background-dark border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white"
                                  placeholder="Metric label"
                                />
                                <input
                                  type="text"
                                  value={m.change || ''}
                                  onChange={(e) => updateMetric(pIdx, mIdx, 'change', e.target.value)}
                                  className="w-full bg-background-dark border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-emerald-400"
                                  placeholder="Relative improvement"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Endpoints Editor */}
                        <div className="p-4 rounded-xl bg-background-dark border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-primary font-bold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" />
                              <span>API Simulator Endpoints ({proj.endpoints?.length || 0})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => addEndpoint(pIdx)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-primary/20 text-text-gray hover:text-primary text-[11px] font-mono border border-white/10 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Endpoint</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(proj.endpoints || []).map((ep, eIdx) => (
                              <div key={eIdx} className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-3 relative">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 flex-1">
                                    <select
                                      value={ep.method}
                                      onChange={(e) => updateEndpoint(pIdx, eIdx, 'method', e.target.value as any)}
                                      className="bg-background-dark border border-white/10 rounded px-2 py-1 text-xs font-mono text-emerald-400 font-bold"
                                    >
                                      <option value="GET">GET</option>
                                      <option value="POST">POST</option>
                                      <option value="PUT">PUT</option>
                                      <option value="DELETE">DELETE</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={ep.path}
                                      onChange={(e) => updateEndpoint(pIdx, eIdx, 'path', e.target.value)}
                                      className="flex-1 bg-background-dark border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white"
                                      placeholder="/api/v1/resource"
                                    />
                                    <input
                                      type="text"
                                      value={ep.latency}
                                      onChange={(e) => updateEndpoint(pIdx, eIdx, 'latency', e.target.value)}
                                      className="w-20 bg-background-dark border border-white/10 rounded px-2 py-1 text-xs font-mono text-primary"
                                      placeholder="Latency"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeEndpoint(pIdx, eIdx)}
                                    className="p-1 text-text-gray hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={ep.description}
                                  onChange={(e) => updateEndpoint(pIdx, eIdx, 'description', e.target.value)}
                                  className="w-full bg-background-dark border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-text-gray"
                                  placeholder="Endpoint description"
                                />

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-[10px] font-mono text-text-gray mb-1">Request Payload (JSON)</div>
                                    <textarea
                                      value={ep.requestPayload || ''}
                                      onChange={(e) => updateEndpoint(pIdx, eIdx, 'requestPayload', e.target.value)}
                                      className="w-full bg-background-dark border border-white/10 rounded p-2 text-[11px] font-mono text-emerald-300"
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-mono text-text-gray mb-1">Response Payload (JSON)</div>
                                    <textarea
                                      value={ep.responsePayload}
                                      onChange={(e) => updateEndpoint(pIdx, eIdx, 'responsePayload', e.target.value)}
                                      className="w-full bg-background-dark border border-white/10 rounded p-2 text-[11px] font-mono text-teal-200"
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Direct Image Preview & Gallery Uploader from Laptop */}
                        <ProjectImageUploader
                          primaryImage={proj.image}
                          images={proj.images || []}
                          projectTitle={proj.title}
                          onPrimaryImageChange={(url) => updateProjectField(pIdx, 'image', url)}
                          onImagesChange={(imgs) => updateProjectField(pIdx, 'images', imgs)}
                        />

                        {/* Tech, Links & URLs */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Technologies (comma separated)</label>
                            <input
                              type="text"
                              value={(proj.technologies || []).join(', ')}
                              onChange={(e) => updateProjectField(pIdx, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">Live Demo URL</label>
                            <input
                              type="url"
                              value={proj.liveUrl || ''}
                              onChange={(e) => updateProjectField(pIdx, 'liveUrl', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                              placeholder="https://..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-text-gray">GitHub URL</label>
                            <input
                              type="url"
                              value={proj.githubUrl || ''}
                              onChange={(e) => updateProjectField(pIdx, 'githubUrl', e.target.value)}
                              className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none"
                              placeholder="https://github.com/..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 2. EXPERIENCE & EDUCATION TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-8">
            {/* Work Experience */}
            <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display">Professional Work Experience</h3>
                <button
                  type="button"
                  onClick={() => {
                    const newExp: Experience = {
                      period: '2024 - Present',
                      title: 'Principal Backend Engineer',
                      company: 'Tech Enterprise',
                      description: 'Architecting high-scale distributed backend systems and microservices.',
                      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
                      highlights: ['Increased request throughput by 300%', 'Reduced p99 latency to 10ms']
                    }
                    setData(prev => ({
                      ...prev,
                      about: { ...prev.about, experience: [newExp, ...(prev.about.experience || [])] }
                    }))
                    soundFX.playSuccess()
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white font-mono text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {(data.about.experience || []).map((exp, eIdx) => (
                  <div key={eIdx} className="p-4 rounded-xl bg-background-dark border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...(data.about.experience || [])]
                            updated[eIdx] = { ...updated[eIdx], title: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, experience: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white font-bold"
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...(data.about.experience || [])]
                            updated[eIdx] = { ...updated[eIdx], company: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, experience: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-400"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => {
                            const updated = [...(data.about.experience || [])]
                            updated[eIdx] = { ...updated[eIdx], period: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, experience: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-primary"
                          placeholder="Period"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setData(prev => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              experience: (prev.about.experience || []).filter((_, i) => i !== eIdx)
                            }
                          }))
                        }}
                        className="p-1.5 text-text-gray hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...(data.about.experience || [])]
                        updated[eIdx] = { ...updated[eIdx], description: e.target.value }
                        setData(prev => ({ ...prev, about: { ...prev.about, experience: updated } }))
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-text-gray"
                      rows={2}
                      placeholder="Role summary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display">Academic Education</h3>
                <button
                  type="button"
                  onClick={() => {
                    const newEdu: Education = {
                      period: '2022 - 2024',
                      degree: 'HND Software Engineering',
                      institution: 'Higher Institute of Applied Technology',
                      description: 'Distributed systems, algorithms, relational database modeling.'
                    }
                    setData(prev => ({
                      ...prev,
                      about: { ...prev.about, education: [newEdu, ...(prev.about.education || [])] }
                    }))
                    soundFX.playSuccess()
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white font-mono text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-4">
                {(data.about.education || []).map((edu, edIdx) => (
                  <div key={edIdx} className="p-4 rounded-xl bg-background-dark border border-white/5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...(data.about.education || [])]
                            updated[edIdx] = { ...updated[edIdx], degree: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, education: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-white font-bold"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...(data.about.education || [])]
                            updated[edIdx] = { ...updated[edIdx], institution: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, education: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-400"
                          placeholder="Institution"
                        />
                        <input
                          type="text"
                          value={edu.period}
                          onChange={(e) => {
                            const updated = [...(data.about.education || [])]
                            updated[edIdx] = { ...updated[edIdx], period: e.target.value }
                            setData(prev => ({ ...prev, about: { ...prev.about, education: updated } }))
                          }}
                          className="bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-primary"
                          placeholder="Period"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setData(prev => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              education: (prev.about.education || []).filter((_, i) => i !== edIdx)
                            }
                          }))
                        }}
                        className="p-1.5 text-text-gray hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={edu.description}
                      onChange={(e) => {
                        const updated = [...(data.about.education || [])]
                        updated[edIdx] = { ...updated[edIdx], description: e.target.value }
                        setData(prev => ({ ...prev, about: { ...prev.about, education: updated } }))
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-text-gray"
                      rows={2}
                      placeholder="Coursework details"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. HOME & HERO TAB */}
        {activeTab === 'home' && (
          <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white font-display">Hero & Platform Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Full Name</label>
                <input
                  type="text"
                  value={data.home.hero.name}
                  onChange={(e) => setData(p => ({ ...p, home: { ...p.home, hero: { ...p.home.hero, name: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Headline Title</label>
                <input
                  type="text"
                  value={data.home.hero.title}
                  onChange={(e) => setData(p => ({ ...p, home: { ...p.home, hero: { ...p.home.hero, title: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-text-gray">Hero Tagline</label>
                <textarea
                  value={data.home.hero.tagline}
                  onChange={(e) => setData(p => ({ ...p, home: { ...p.home, hero: { ...p.home.hero, tagline: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-mono uppercase text-primary font-bold mb-3">Homepage Statistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.home.stats.map((st, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-2">
                    <input
                      type="text"
                      value={st.number}
                      onChange={(e) => {
                        const updated = [...data.home.stats]
                        updated[sIdx] = { ...updated[sIdx], number: e.target.value }
                        setData(p => ({ ...p, home: { ...p.home, stats: updated } }))
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-primary font-bold"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const updated = [...data.home.stats]
                        updated[sIdx] = { ...updated[sIdx], label: e.target.value }
                        setData(p => ({ ...p, home: { ...p.home, stats: updated } }))
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ABOUT BIO TAB */}
        {activeTab === 'about' && (
          <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white font-display">About & Professional Bio</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Display Name</label>
                <input
                  type="text"
                  value={data.about.profile.name}
                  onChange={(e) => setData(p => ({ ...p, about: { ...p.about, profile: { ...p.about.profile, name: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Detailed Narrative Biography</label>
                <textarea
                  value={data.about.profile.bio}
                  onChange={(e) => setData(p => ({ ...p, about: { ...p.about, profile: { ...p.about.profile, bio: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white leading-relaxed"
                  rows={8}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white font-display">Contact & Channels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Primary Email</label>
                <input
                  type="email"
                  value={data.contact.info.email}
                  onChange={(e) => setData(p => ({ ...p, contact: { ...p.contact, info: { ...p.contact.info, email: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Direct Phone</label>
                <input
                  type="tel"
                  value={data.contact.info.phone}
                  onChange={(e) => setData(p => ({ ...p, contact: { ...p.contact, info: { ...p.contact.info, phone: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray">Base Location</label>
                <input
                  type="text"
                  value={data.contact.info.location}
                  onChange={(e) => setData(p => ({ ...p, contact: { ...p.contact, info: { ...p.contact.info, location: e.target.value } } }))}
                  className="w-full bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Social Channels */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-mono uppercase text-primary font-bold">Social Network Links</h4>
              <div className="space-y-2">
                {data.contact.social.map((soc, sIdx) => (
                  <div key={sIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={soc.platform}
                      onChange={(e) => {
                        const updated = [...data.contact.social]
                        updated[sIdx] = { ...updated[sIdx], platform: e.target.value }
                        setData(p => ({ ...p, contact: { ...p.contact, social: updated } }))
                      }}
                      className="w-36 bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                      placeholder="Platform"
                    />
                    <input
                      type="url"
                      value={soc.url}
                      onChange={(e) => {
                        const updated = [...data.contact.social]
                        updated[sIdx] = { ...updated[sIdx], url: e.target.value }
                        setData(p => ({ ...p, contact: { ...p.contact, social: updated } }))
                      }}
                      className="flex-1 bg-background-dark border border-white/10 rounded px-3 py-2 text-xs font-mono text-white"
                      placeholder="URL"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. RESUME DOCUMENTS HUB (2 RESUME SLOTS) */}
        {activeTab === 'resume' && (
          <ResumeManager
            resumes={data.resumes || []}
            legacyResume={data.resume}
            onChange={(updatedResumes) => {
              setData(p => ({
                ...p,
                resumes: updatedResumes,
                resume: updatedResumes[0] ? { url: updatedResumes[0].url, filename: updatedResumes[0].filename } : p.resume
              }))
            }}
            onLegacyChange={(legacy) => {
              setData(p => ({ ...p, resume: legacy }))
            }}
          />
        )}
      </div>

      {/* AI Repository Scanner Modal */}
      <AIProjectScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        onApplyProject={handleApplyAiProject}
        initialRepoUrl={aiScannerRepoUrl}
        projectIndexToUpdate={aiScannerProjectIdx}
      />
    </div>
  )
}
