'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  Github,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Terminal,
  Layers,
  Activity,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Zap,
  Network,
  BookOpen,
  Tag,
  Filter,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { Project, ProjectEndpoint } from '@/lib/types'
import SystemDesignDiagrammer from '@/components/SystemDesignDiagrammer'
import CaseStudyDeepDive from '@/components/CaseStudyDeepDive'
import { soundFX } from '@/lib/soundfx'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
  onSelectTech?: (tech: string) => void
  selectedTech?: string | null
}

type TabType = 'overview' | 'architecture' | 'casestudy' | 'preview' | 'api' | 'gallery'
type ViewportType = 'desktop' | 'tablet' | 'mobile'

export default function ProjectModal({ project, onClose, onSelectTech, selectedTech }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [viewport, setViewport] = useState<ViewportType>('desktop')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeEndpointIndex, setActiveEndpointIndex] = useState(0)
  const [isExecutingApi, setIsExecutingApi] = useState(false)
  const [apiExecutionResult, setApiExecutionResult] = useState<ProjectEndpoint | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [iframeReloadKey, setIframeReloadKey] = useState(0)

  if (!project) return null

  const projectImages = project.images && project.images.length > 0 
    ? project.images 
    : [project.image || '/images/D1.jpeg']

  const activeEndpoint = project.endpoints && project.endpoints.length > 0 
    ? project.endpoints[activeEndpointIndex] 
    : null

  const handleCopyLink = () => {
    if (project.liveUrl) {
      soundFX.playSuccess()
      navigator.clipboard.writeText(project.liveUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const handleCopyCurl = () => {
    if (!activeEndpoint) return
    soundFX.playSuccess()
    const curl = `curl -X ${activeEndpoint.method} "https://api.${project.title.toLowerCase().replace(/\s+/g, '')}.io${activeEndpoint.path}" \\\n  -H "Content-Type: application/json"${activeEndpoint.requestPayload ? ` \\\n  -d '${activeEndpoint.requestPayload.replace(/\n/g, '')}'` : ''}`
    navigator.clipboard.writeText(curl)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const handleExecuteApi = () => {
    if (!activeEndpoint) return
    setIsExecutingApi(true)
    soundFX.playClick(650)
    setTimeout(() => {
      setApiExecutionResult(activeEndpoint)
      setIsExecutingApi(false)
      soundFX.playSuccess()
    }, 450)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    soundFX.playClick(550)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative bg-background-medium border border-primary/30 rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-background-dark/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">
                    {project.title}
                  </h2>
                  {project.status && (
                    <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-gray hidden sm:block">
                  {project.role || 'Backend Engineer'} • {project.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white text-xs font-semibold transition-colors shadow-teal-glow"
                >
                  <span>Live Site</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Source Code</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-text-gray hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 px-6 py-2.5 bg-background-dark/50 border-b border-white/5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                  : 'text-text-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview & Impact</span>
            </button>

            {project.architectureNodes && project.architectureNodes.length > 0 && (
              <button
                onClick={() => handleTabChange('architecture')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'architecture'
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                    : 'text-text-gray hover:text-white hover:bg-white/5'
                }`}
              >
                <Network className="w-4 h-4 text-emerald-400" />
                <span>Interactive Architecture Graph</span>
              </button>
            )}

            {(project.schemaTables || project.concurrencyTradeoffs || project.postMortem) && (
              <button
                onClick={() => handleTabChange('casestudy')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'casestudy'
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                    : 'text-text-gray hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Deep Dive (ERDs & Trade-offs)</span>
              </button>
            )}

            <button
              onClick={() => handleTabChange('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                  : 'text-text-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Live Interactive Simulator</span>
            </button>

            {project.endpoints && project.endpoints.length > 0 && (
              <button
                onClick={() => handleTabChange('api')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'api'
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                    : 'text-text-gray hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>API Sandbox Runner</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            <button
              onClick={() => handleTabChange('gallery')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(26,122,122,0.4)]'
                  : 'text-text-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Visual Gallery</span>
            </button>
          </div>

          {/* Scrollable Tab Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Hero Summary Card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-background-dark via-background-dark/90 to-primary/10 border border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wider font-mono text-primary">
                      {project.role || 'Principal Backend Engineer'} • {project.timeline || '2024'}
                    </span>
                    <span className="text-xs text-text-gray font-mono">
                      Category: <span className="text-white">{project.category}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {project.tagline || project.description}
                  </h3>
                  <p className="text-text-gray text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Key Engineering Impact Metrics */}
                {project.metrics && project.metrics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-text-gray mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Quantifiable Engineering Metrics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {project.metrics.map((metric, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-background-dark border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-colors"
                        >
                          <div className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-tight">
                            {metric.value}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white mt-1">
                              {metric.label}
                            </div>
                            {metric.change && (
                              <div className="text-[11px] text-text-gray font-mono mt-0.5">
                                {metric.change}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge & Solution Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-red-950/15 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider font-mono mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      The Engineering Challenge
                    </div>
                    <p className="text-sm text-text-gray leading-relaxed">
                      {project.challenge ||
                        'High-concurrency data consistency challenges, distributed race conditions, and network packet dropouts causing state corruption under load.'}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-emerald-950/15 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      Architectural Solution
                    </div>
                    <p className="text-sm text-text-gray leading-relaxed">
                      {project.solution ||
                        'Designed an event-driven distributed system with asynchronous job queues, atomic locks, idempotent handlers, and optimized database indexing.'}
                    </p>
                  </div>
                </div>

                {/* Key Backend Features List */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-text-gray mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Core Architecture Highlights
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {project.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-background-dark/70 border border-white/5 text-xs text-text-gray"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-text-gray flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span>Technology Ecosystem</span>
                    </h4>
                    {onSelectTech && (
                      <span className="text-[11px] font-mono text-text-gray/70 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-primary" />
                        <span>Click tag to filter catalog</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => {
                      const isSelected = selectedTech?.toLowerCase() === tech.toLowerCase()
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (onSelectTech) {
                              soundFX.playClick(600)
                              onSelectTech(tech)
                              onClose()
                            }
                          }}
                          title={`Click to filter all projects built with ${tech}`}
                          className={`group px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-teal-glow ring-2 ring-primary/40'
                              : 'bg-primary/10 hover:bg-primary/25 border-primary/30 hover:border-primary text-primary hover:text-white cursor-pointer active:scale-95'
                          }`}
                        >
                          <span>{tech}</span>
                          <Filter className={`w-3 h-3 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. INTERACTIVE ARCHITECTURE GRAPH */}
            {activeTab === 'architecture' && project.architectureNodes && (
              <SystemDesignDiagrammer
                nodes={project.architectureNodes}
                title={`${project.title} Distributed Node Topology`}
              />
            )}

            {/* 3. CASE STUDY DEEP DIVE (ERDs, CONCURRENCY, POST-MORTEMS) */}
            {activeTab === 'casestudy' && (
              <CaseStudyDeepDive
                schemaTables={project.schemaTables}
                concurrencyTradeoffs={project.concurrencyTradeoffs}
                postMortem={project.postMortem}
                technologies={project.technologies}
              />
            )}

            {/* 4. LIVE PREVIEW & INTERACTIVE SIMULATOR */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {/* Browser Frame Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-background-dark border border-white/10">
                  {/* Viewport Selectors */}
                  <div className="flex items-center gap-1 bg-background-medium p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setViewport('desktop')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewport === 'desktop'
                          ? 'bg-primary text-white'
                          : 'text-text-gray hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      onClick={() => setViewport('tablet')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewport === 'tablet'
                          ? 'bg-primary text-white'
                          : 'text-text-gray hover:text-white'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tablet</span>
                    </button>
                    <button
                      onClick={() => setViewport('mobile')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewport === 'mobile'
                          ? 'bg-primary text-white'
                          : 'text-text-gray hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
                  </div>

                  {/* Browser URL bar */}
                  <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-text-gray">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate text-white">{project.liveUrl || 'https://sandbox.local'}</span>
                    <button
                      onClick={handleCopyLink}
                      className="ml-auto p-1 rounded hover:bg-white/10 text-text-gray hover:text-white"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIframeError(false)
                      setIframeReloadKey((k) => k + 1)
                      soundFX.playClick(700)
                    }}
                    className="p-2 rounded-lg bg-background-medium hover:bg-white/10 text-text-gray hover:text-white border border-white/10 transition-colors"
                    title="Reload Sandbox Preview"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated Device Frame */}
                <div className="flex justify-center bg-black/50 p-4 rounded-xl border border-white/10 overflow-hidden min-h-[420px]">
                  <div
                    className={`transition-all duration-300 bg-background-dark rounded-xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col ${
                      viewport === 'mobile'
                        ? 'w-[360px] h-[580px]'
                        : viewport === 'tablet'
                        ? 'w-[680px] h-[520px]'
                        : 'w-full h-[520px]'
                    }`}
                  >
                    {/* Device Top Bar */}
                    <div className="h-6 bg-black/80 px-3 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                        <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="text-[10px] font-mono text-text-gray/70">
                        {viewport.toUpperCase()} EMULATOR (SANDBOX)
                      </div>
                    </div>

                    {/* Frame Content */}
                    <div className="flex-1 relative bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                      <Image
                        src={project.image || '/images/D1.jpeg'}
                        alt={project.title}
                        fill
                        className="object-cover opacity-30"
                        referrerPolicy="no-referrer"
                      />
                      <div className="relative z-10 max-w-md p-6 rounded-2xl bg-black/80 border border-primary/30 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-3 text-primary">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white font-display mb-1">
                          {project.title} Live Application
                        </h4>
                        <p className="text-xs text-text-gray mb-4">
                          Running on production infrastructure with active telemetry and real-time load balancing.
                        </p>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold font-mono transition-all shadow-teal-glow"
                          >
                            <span>Open Dedicated App Window</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. API SANDBOX RUNNER */}
            {activeTab === 'api' && project.endpoints && project.endpoints.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-background-dark border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase text-primary font-semibold mb-1">
                      Interactive API Explorer
                    </div>
                    <div className="text-sm font-bold text-white">
                      Live Backend Endpoint Benchmark & Execution
                    </div>
                  </div>

                  {/* Endpoint Switcher */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.endpoints.map((ep, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveEndpointIndex(idx)
                          setApiExecutionResult(null)
                          soundFX.playClick(500 + idx * 50)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          activeEndpointIndex === idx
                            ? 'bg-primary text-white shadow-teal-glow'
                            : 'bg-background-medium text-text-gray hover:text-white border border-white/5'
                        }`}
                      >
                        <span className="font-bold text-emerald-300 mr-1.5">{ep.method}</span>
                        <span>{ep.path.split('/').pop()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {activeEndpoint && (
                  <div className="space-y-4">
                    {/* Endpoint Target Bar */}
                    <div className="p-3.5 rounded-xl bg-background-dark border border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={`px-2.5 py-1 rounded font-bold ${
                          activeEndpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {activeEndpoint.method}
                        </span>
                        <span className="text-white font-semibold">{activeEndpoint.path}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyCurl}
                          className="px-3 py-1.5 rounded-lg bg-background-medium hover:bg-white/10 text-xs font-mono text-text-gray hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
                          title="Copy cURL command"
                        >
                          {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCurl ? 'Copied' : 'cURL'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Endpoint Action Banner */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-text-gray">Endpoint Description</div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                          {activeEndpoint.description}
                        </div>
                      </div>
                      <button
                        onClick={handleExecuteApi}
                        disabled={isExecutingApi}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-secondary disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-teal-glow"
                      >
                        <Play className={`w-3.5 h-3.5 ${isExecutingApi ? 'animate-spin' : ''}`} />
                        <span>{isExecutingApi ? 'Executing...' : 'Send Request'}</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Request Payload */}
                      <div>
                        <div className="text-xs font-mono text-text-gray mb-2 flex items-center justify-between">
                          <span>Request Payload (JSON)</span>
                          <span className="text-[10px] text-text-gray/60 font-mono">application/json</span>
                        </div>
                        <pre className="p-3.5 rounded-lg bg-black/90 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto min-h-[160px] leading-relaxed">
                          {activeEndpoint.requestPayload || '// No request body required for this GET endpoint'}
                        </pre>
                      </div>

                      {/* Response Payload */}
                      <div>
                        <div className="text-xs font-mono text-text-gray mb-2 flex items-center justify-between">
                          <span>Response Payload</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono text-[10px]">
                              Status: {activeEndpoint.status} OK
                            </span>
                            <span className="text-text-gray font-mono text-[10px]">
                              Latency: {activeEndpoint.latency}
                            </span>
                          </div>
                        </div>
                        <pre className="p-3.5 rounded-lg bg-black/90 border border-white/10 text-xs font-mono text-teal-200 overflow-x-auto min-h-[160px] leading-relaxed">
                          {apiExecutionResult ? apiExecutionResult.responsePayload : activeEndpoint.responsePayload}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. VISUAL GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-4">
                {/* Main Display Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/70 border border-white/10">
                  <Image
                    src={projectImages[selectedImageIndex] || project.image || '/images/D1.jpeg'}
                    alt={`${project.title} screenshot ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-black/75 backdrop-blur-sm text-xs font-mono text-white border border-white/10">
                    Figure {selectedImageIndex + 1} of {projectImages.length}: {project.title} Architecture
                  </div>
                </div>

                {/* Thumbnails */}
                {projectImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {projectImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedImageIndex(i)
                          soundFX.playClick(600)
                        }}
                        className={`relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImageIndex === i
                            ? 'border-primary scale-105 shadow-teal-glow'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-6 py-3 bg-background-dark/90 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-text-gray font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Architected & Engineered by {project.role || 'Che Amah Diland Ngwa'}</span>
            </div>
            <div className="flex items-center gap-4">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
