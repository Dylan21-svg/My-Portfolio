'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  GitBranch,
  Globe,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Database,
  Server,
  Zap,
  Network,
  Cpu,
  RefreshCw,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Award,
  X,
  FileCode2,
  Loader2
} from 'lucide-react'
import { Project } from '@/lib/types'
import { soundFX } from '@/lib/soundfx'

interface AIProjectScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyProject: (project: Project) => void
  initialRepoUrl?: string
  projectIndexToUpdate?: number | null
}

const PRESET_SOURCES = [
  { name: '🌐 Live Vercel App', url: 'https://codeforge.dev', desc: 'Live Gamified Platform' },
  { name: '🌐 Live SaaS Dashboard', url: 'https://linear.app', desc: 'Real-time Distributed App' },
  { name: '🌐 Render Cloud App', url: 'https://render.com', desc: 'Cloud Infrastructure Portal' },
  { name: '📦 GitHub: CodeForge', url: 'Dylan21-svg/CodeForge', desc: 'Offline-First Engine Repo' },
  { name: '📦 GitHub: FastAPI', url: 'fastapi/fastapi', desc: 'Async Python Framework' },
  { name: '📦 GitHub: Celery', url: 'celery/celery', desc: 'Task Queue System' }
]

const FOCUS_AREAS = [
  'Distributed Systems & Backend Scale',
  'High-Throughput API Architecture',
  'Offline-First & Delta Sync Protocols',
  'Database Optimization & Caching',
  'Machine Learning & Automation Pipelines',
  'Full-Stack Cloud Infrastructure'
]

const TARGET_ROLES = [
  'Senior Backend Engineer',
  'Staff Distributed Systems Architect',
  'Lead Python / SaaS Engineer',
  'Principal Software Engineer'
]

export default function AIProjectScannerModal({
  isOpen,
  onClose,
  onApplyProject,
  initialRepoUrl = '',
  projectIndexToUpdate = null
}: AIProjectScannerModalProps) {
  const [sourceUrl, setSourceUrl] = useState(initialRepoUrl)
  const [liveUrlSecondary, setLiveUrlSecondary] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [focusArea, setFocusArea] = useState(FOCUS_AREAS[0])
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0])
  
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState<number>(0)
  const [scanError, setScanError] = useState<string | null>(null)
  
  const [scanResult, setScanResult] = useState<{
    project: Project
    recruiterPitch: string
    resumeBullets: string[]
    architectureHighlights?: string[]
    scannedType?: string
    detectedLiveUrl?: string
    source?: string
  } | null>(null)

  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'recruiter' | 'architecture' | 'api_schema' | 'tradeoffs'>('recruiter')

  const isInputLiveSite = /^(?:https?:\/\/|www\.)(?!github\.com)/i.test(sourceUrl.trim()) ||
                          /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/i.test(sourceUrl.trim())

  const scanStepsText = isInputLiveSite
    ? [
        'Fetching live hosted website HTML, meta tags & server headers...',
        'Deconstructing product features, data workflows & UI contracts...',
        'Synthesizing estimated high-scale backend topologies & p99 metrics...',
        'Formulating FAANG-grade Google X-Y-Z bullets, schemas & recruiter dossier...'
      ]
    : [
        'Connecting to repository tree & inspecting code manifests...',
        'Analyzing architecture patterns, tech stack & dependencies...',
        'Synthesizing quantifiable XYZ metrics & system design topology...',
        'Generating production API endpoints, schema tables & recruiter pitch...'
      ]

  const handleStartScan = async () => {
    if (!sourceUrl.trim() && !additionalNotes.trim()) {
      setScanError('Please enter a live website link, GitHub repository URL, or project context.')
      return
    }

    setScanError(null)
    setIsScanning(true)
    setScanStep(0)
    soundFX.playClick(600)

    // Simulate progression while API runs
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 1800)

    try {
      const response = await fetch('/api/admin/ai-project-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: sourceUrl.trim(),
          liveUrl: liveUrlSecondary.trim(),
          additionalNotes: additionalNotes.trim(),
          focusArea,
          targetRole
        })
      })

      const data = await response.json()
      clearInterval(stepInterval)

      if (data.success && data.project) {
        setScanResult(data)
        soundFX.playSuccess()
      } else {
        throw new Error(data.error || 'Failed to analyze project')
      }
    } catch (err: any) {
      clearInterval(stepInterval)
      console.error('Scan error:', err)
      setScanError(err.message || 'Error occurred while scanning source')
      soundFX.playError()
    } finally {
      setIsScanning(false)
    }
  }

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    soundFX.playSuccess()
    setCopiedSection(label)
    setTimeout(() => setCopiedSection(null), 2500)
  }

  const handleApply = () => {
    if (!scanResult?.project) return
    soundFX.playSuccess()
    onApplyProject(scanResult.project)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-background-medium/95 border border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/30 to-emerald-400/20 border border-primary/50 flex items-center justify-center text-primary shadow-teal-glow">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  AI Project & Live Website Scanner
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Powered by Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-text-gray font-mono mt-0.5">
                Scan live hosted websites, SaaS portals, or GitHub repos to synthesize high-scale architecture & recruiter pitches.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-text-gray hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Scan Configuration Form */}
          {!scanResult && (
            <div className="space-y-5">
              {/* Primary Source Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-primary flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isInputLiveSite ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <GitBranch className="w-3.5 h-3.5 text-primary" />}
                    <span>Live Website / Hosted URL OR GitHub Repository</span>
                  </div>
                  <span className="text-[10px] font-normal text-text-gray">
                    {isInputLiveSite ? '🌐 Live Web Scraping Mode Active' : '📦 Codebase Analysis Mode'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="e.g. https://my-app.vercel.app OR https://github.com/Dylan21-svg/CodeForge..."
                    disabled={isScanning}
                    className="w-full bg-background-dark border border-white/15 rounded-xl pl-4 pr-10 py-3 text-sm font-mono text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-gray/50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray/60">
                    {isInputLiveSite ? <Globe className="w-4 h-4 text-emerald-400" /> : <GitBranch className="w-4 h-4 text-primary" />}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-text-gray">Quick Presets:</span>
                  {PRESET_SOURCES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setSourceUrl(preset.url)
                        soundFX.playClick(500)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-background-dark hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-[11px] font-mono text-text-gray hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Secondary URL Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-primary" />
                  <span>Optional Companion URL (e.g. Live Link if primary is GitHub, or GitHub if primary is Live)</span>
                </label>
                <input
                  type="text"
                  value={liveUrlSecondary}
                  onChange={(e) => setLiveUrlSecondary(e.target.value)}
                  placeholder="https://..."
                  disabled={isScanning}
                  className="w-full bg-background-dark border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none placeholder:text-text-gray/40"
                />
              </div>

              {/* Focus Area and Role Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-gray">Architectural Focus</label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    disabled={isScanning}
                    className="w-full bg-background-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-primary outline-none"
                  >
                    {FOCUS_AREAS.map((area) => (
                      <option key={area} value={area} className="bg-background-dark">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-text-gray">Target Seniority / Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={isScanning}
                    className="w-full bg-background-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-primary outline-none"
                  >
                    {TARGET_ROLES.map((role) => (
                      <option key={role} value={role} className="bg-background-dark">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Custom Notes / Code snippet */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-gray flex items-center justify-between">
                  <span>Additional Architecture Details or Code Highlights (Optional)</span>
                  <span className="text-[10px] text-text-gray/70 font-sans">e.g. key algorithms, performance numbers, SLAs</span>
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Paste specific architectural choices, throughput numbers, or problem constraints you want highlighted..."
                  rows={2}
                  disabled={isScanning}
                  className="w-full bg-background-dark border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-primary outline-none placeholder:text-text-gray/50"
                />
              </div>

              {scanError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Scanning Active Indicator */}
              {isScanning && (
                <div className="p-6 rounded-2xl bg-black/40 border border-primary/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">
                        {isInputLiveSite ? 'Scanning Live Web App & Reconstructing Architecture...' : 'Deep AI Scanning in Progress...'}
                      </h4>
                      <p className="text-xs text-primary font-mono mt-0.5">
                        {scanStepsText[scanStep]}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-background-dark rounded-full h-1.5 overflow-hidden border border-white/10">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-emerald-400 h-full"
                      initial={{ width: '10%' }}
                      animate={{ width: `${((scanStep + 1) / 4) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Trigger Button */}
              {!isScanning && (
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-mono text-xs sm:text-sm font-bold transition-all shadow-teal-glow flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isInputLiveSite ? 'Scan Live Website & Generate Architecture' : 'Analyze Source & Synthesize Recruiter Pitch'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}

          {/* Generated Result Review Screen */}
          {scanResult && (
            <div className="space-y-6">
              {/* Top Banner Alert */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white font-mono">
                        {scanResult.scannedType === 'live_website'
                          ? 'Live Site Deconstructed & Scaled!'
                          : 'Deep Codebase Scan Complete!'}
                      </h3>
                      {scanResult.project.liveUrl && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Live URL Linked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-gray font-mono">
                      Generated architecture dossier for <span className="text-primary font-bold">{scanResult.project.title}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="px-3 py-1.5 rounded-lg bg-background-dark hover:bg-white/10 border border-white/10 text-xs font-mono text-text-gray hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Rescan</span>
                </button>
              </div>

              {/* Result Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-background-dark border border-white/10 overflow-x-auto">
                <button
                  onClick={() => setActiveResultTab('recruiter')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                    activeResultTab === 'recruiter'
                      ? 'bg-primary text-white shadow-teal-glow'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Recruiter Pitch & Resume XYZ</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('architecture')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                    activeResultTab === 'architecture'
                      ? 'bg-primary text-white shadow-teal-glow'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>System Architecture & Metrics</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('api_schema')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                    activeResultTab === 'api_schema'
                      ? 'bg-primary text-white shadow-teal-glow'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>API Endpoints & DB Schema</span>
                </button>

                <button
                  onClick={() => setActiveResultTab('tradeoffs')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                    activeResultTab === 'tradeoffs'
                      ? 'bg-primary text-white shadow-teal-glow'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trade-offs & Post-Mortem</span>
                </button>
              </div>

              {/* TAB 1: RECRUITER PITCH & RESUME BULLETS */}
              {activeResultTab === 'recruiter' && (
                <div className="space-y-4">
                  {/* Executive Pitch Box */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-primary/30 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>30-Second Recruiter Elevator Pitch</span>
                      </span>
                      <button
                        onClick={() => handleCopyText(scanResult.recruiterPitch, 'pitch')}
                        className="px-2.5 py-1 rounded-lg bg-background-dark hover:bg-primary/20 border border-white/10 text-xs font-mono text-text-gray hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {copiedSection === 'pitch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'pitch' ? 'Copied!' : 'Copy Pitch'}</span>
                      </button>
                    </div>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed italic bg-background-dark/80 p-4 rounded-xl border border-white/5">
                      &ldquo;{scanResult.recruiterPitch}&rdquo;
                    </p>
                  </div>

                  {/* Google X-Y-Z Resume Bullets */}
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Google X-Y-Z Resume & LinkedIn Bullets</span>
                      </span>
                      <button
                        onClick={() => handleCopyText((scanResult.resumeBullets || []).join('\n• '), 'bullets')}
                        className="px-2.5 py-1 rounded-lg bg-background-dark hover:bg-primary/20 border border-white/10 text-xs font-mono text-text-gray hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {copiedSection === 'bullets' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'bullets' ? 'Copied All!' : 'Copy All Bullets'}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(scanResult.resumeBullets || []).map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-3 rounded-xl bg-background-dark/80 border border-white/5 text-xs sm:text-sm text-text-gray font-mono flex items-start gap-2.5"
                        >
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span className="text-white/90 leading-relaxed">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM ARCHITECTURE & METRICS */}
              {activeResultTab === 'architecture' && (
                <div className="space-y-4">
                  {/* Quantifiable Metrics Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(scanResult.project.metrics || []).map((m, mIdx) => (
                      <div key={mIdx} className="p-4 rounded-xl bg-black/40 border border-primary/20 space-y-1">
                        <div className="text-[10px] font-mono text-text-gray uppercase tracking-wider">{m.label}</div>
                        <div className="text-xl font-bold font-mono text-primary">{m.value}</div>
                        {m.change && <div className="text-[11px] font-mono text-emerald-400">{m.change}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Challenge & Solution */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-rose-500/20 space-y-2">
                      <span className="text-xs font-mono font-bold text-rose-400">The Hard Engineering Challenge</span>
                      <p className="text-xs sm:text-sm text-text-gray leading-relaxed">
                        {scanResult.project.challenge}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">Architectural Solution</span>
                      <p className="text-xs sm:text-sm text-text-gray leading-relaxed">
                        {scanResult.project.solution}
                      </p>
                    </div>
                  </div>

                  {/* Architecture Nodes Preview */}
                  {scanResult.project.architectureNodes && scanResult.project.architectureNodes.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5" />
                        <span>System Topology Nodes ({scanResult.project.architectureNodes.length})</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {scanResult.project.architectureNodes.map((node) => (
                          <div key={node.id} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white font-mono">{node.label}</span>
                              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{node.tech}</span>
                            </div>
                            <p className="text-[11px] text-text-gray">{node.description}</p>
                            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-2 pt-1">
                              {node.throughput && <span>⚡ {node.throughput}</span>}
                              {node.latency && <span>⏱ {node.latency}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: API ENDPOINTS & DB SCHEMA */}
              {activeResultTab === 'api_schema' && (
                <div className="space-y-4">
                  {/* Endpoints */}
                  {scanResult.project.endpoints && scanResult.project.endpoints.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <span className="text-xs font-mono font-bold text-primary">REST / gRPC Endpoints</span>
                      {scanResult.project.endpoints.map((ep, eIdx) => (
                        <div key={eIdx} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{ep.method}</span>
                              <span className="text-white font-bold">{ep.path}</span>
                            </div>
                            <span className="text-[10px] font-mono text-primary">{ep.latency}</span>
                          </div>
                          <p className="text-xs text-text-gray">{ep.description}</p>
                          <pre className="text-[11px] font-mono bg-black/60 p-2.5 rounded text-emerald-400 overflow-x-auto">
                            {ep.responsePayload}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schema Tables */}
                  {scanResult.project.schemaTables && scanResult.project.schemaTables.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <span className="text-xs font-mono font-bold text-cyan-400">Database Schema Tables</span>
                      {scanResult.project.schemaTables.map((tbl, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-2">
                          <div className="text-xs font-mono font-bold text-white">{tbl.tableName}</div>
                          <p className="text-xs text-text-gray">{tbl.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {tbl.columns.map((col, cIdx) => (
                              <div key={cIdx} className="text-[11px] font-mono p-1.5 rounded bg-black/30 border border-white/5 flex items-center justify-between">
                                <span className="text-white">{col.name}</span>
                                <span className="text-primary">{col.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TRADEOFFS & POST-MORTEM */}
              {activeResultTab === 'tradeoffs' && (
                <div className="space-y-4">
                  {/* Concurrency Tradeoff */}
                  {scanResult.project.concurrencyTradeoffs && scanResult.project.concurrencyTradeoffs.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <span className="text-xs font-mono font-bold text-amber-400">Architectural Trade-offs & Decisions</span>
                      {scanResult.project.concurrencyTradeoffs.map((to, toIdx) => (
                        <div key={toIdx} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-white">{to.approach}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 uppercase">
                              {to.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-gray">{to.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post-Mortem Lesson */}
                  {scanResult.project.postMortem && scanResult.project.postMortem.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-rose-500/20 space-y-3">
                      <span className="text-xs font-mono font-bold text-rose-400">Production Incident & Post-Mortem Lesson</span>
                      {scanResult.project.postMortem.map((pm, pIdx) => (
                        <div key={pIdx} className="p-3 rounded-lg bg-background-dark border border-white/5 space-y-2 text-xs font-mono">
                          <div className="text-white font-bold">{pm.incident}</div>
                          <div className="text-text-gray"><strong className="text-rose-400">Root Cause:</strong> {pm.rootCause}</div>
                          <div className="text-text-gray"><strong className="text-emerald-400">Resolution:</strong> {pm.resolution}</div>
                          <div className="text-primary italic"><strong className="text-primary">Takeaway:</strong> {pm.takeaway}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-background-dark hover:bg-white/10 border border-white/10 text-xs font-mono text-text-gray hover:text-white transition-colors"
          >
            Cancel
          </button>

          {scanResult && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-mono text-xs font-bold transition-all shadow-teal-glow flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {projectIndexToUpdate !== null
                    ? 'Apply & Update Project'
                    : 'Add Generated Project to Portfolio'}
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
