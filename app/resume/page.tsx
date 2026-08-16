'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Eye,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  Award,
  Terminal,
  Server,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  Code,
  ShieldCheck,
  Zap,
  Check,
  X,
  FileCheck
} from 'lucide-react'
import { usePortfolioData } from '@/lib/data'
import { soundFX } from '@/lib/soundfx'
import { ResumeDocument } from '@/lib/types'

export default function ResumePage() {
  const data = usePortfolioData()
  const [activeTab, setActiveTab] = useState<'interactive' | 'ats_view'>('interactive')
  const [filterSkill, setFilterSkill] = useState<string>('All')
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedContact, setCopiedContact] = useState<string | null>(null)
  const [previewingResume, setPreviewingResume] = useState<ResumeDocument | null>(null)

  const experiences = data.about.experience || []
  const educations = data.about.education || []
  const projects = data.works.projects || []

  // Ensure resumes array
  const uploadedResumes: ResumeDocument[] = (data.resumes && data.resumes.length > 0)
    ? data.resumes
    : data.resume?.url
    ? [
        {
          id: 'resume-primary',
          title: 'Primary Technical Resume',
          label: 'Senior Backend & Distributed Systems Architecture',
          filename: data.resume.filename || 'Che_Dylan_Backend_Resume.pdf',
          url: data.resume.url,
          fileSize: '142 KB',
          fileType: 'application/pdf',
          uploadedAt: '2026-08-15',
          description: 'Focused on Python, FastAPI, distributed task queues, database concurrency, and high-scale architecture.'
        }
      ]
    : []

  const coreSkills = [
    { category: 'Languages', items: ['Python (FastAPI, Flask, Django)', 'TypeScript', 'SQL (PostgreSQL)', 'JavaScript', 'Go (Basics)'] },
    { category: 'Distributed Systems & Queues', items: ['Redis', 'RabbitMQ', 'Celery', 'CRDT Delta Sync', 'WebSockets', 'gRPC'] },
    { category: 'Databases & Storage', items: ['PostgreSQL (Timescale, RLS)', 'MySQL', 'IndexedDB', 'Redis Cache', 'S3/Blob'] },
    { category: 'DevOps & Tooling', items: ['Docker & Container Jails', 'CI/CD Pipelines', 'Linux/Bash', 'Git', 'Prometheus & Grafana'] }
  ]

  // One-click print/PDF generation
  const handlePrintPDF = () => {
    soundFX.playSuccess()
    setIsDownloading(true)
    setTimeout(() => {
      window.print()
      setIsDownloading(false)
    }, 300)
  }

  const handleCopy = (text: string, label: string) => {
    soundFX.playSuccess()
    navigator.clipboard.writeText(text)
    setCopiedContact(label)
    setTimeout(() => setCopiedContact(null), 2000)
  }

  return (
    <div className="min-h-screen py-16 sm:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Server className="w-3.5 h-3.5" />
              <span>Verified Engineering Credentials</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              CURRICULUM VITAE
            </h1>
            <p className="text-text-gray text-sm sm:text-base mt-2 max-w-xl">
              Production-tested backend engineer architecting high-throughput distributed systems, offline-first sync protocols, and resilient database schemas.
            </p>
          </div>

          {/* Action Buttons: 1-Click PDF & Dedicated Uploaded Resumes */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handlePrintPDF}
              disabled={isDownloading}
              className="px-5 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-mono text-xs font-bold transition-all shadow-teal-glow flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isDownloading ? 'Preparing PDF...' : '1-Click ATS / Print PDF'}</span>
            </button>

            {uploadedResumes.map((resDoc, rIdx) => (
              <div key={rIdx} className="flex items-center gap-1.5">
                <a
                  href={resDoc.url}
                  download={resDoc.filename || `Dylan_Resume_${rIdx + 1}.pdf`}
                  onClick={() => soundFX.playSuccess()}
                  className="px-4 py-3 rounded-xl bg-background-medium hover:bg-white/10 border border-white/15 text-white font-mono text-xs font-semibold transition-all flex items-center gap-2 group shadow-sm"
                  title={`Download ${resDoc.title}`}
                >
                  <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span>{rIdx === 0 ? 'Primary Resume' : 'Full-Stack Resume'}</span>
                  {resDoc.fileSize && (
                    <span className="text-[10px] text-text-gray font-mono hidden sm:inline">
                      ({resDoc.fileSize})
                    </span>
                  )}
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewingResume(resDoc)}
                  className="p-3 rounded-xl bg-background-medium hover:bg-white/10 border border-white/15 text-text-gray hover:text-white transition-colors"
                  title={`Preview ${resDoc.title}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Resumes Multi-Version Banner */}
        {uploadedResumes.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedResumes.map((resDoc, rIdx) => (
              <div
                key={rIdx}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  rIdx === 0
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-background-dark/80 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{resDoc.title}</span>
                    </span>
                    {resDoc.fileSize && (
                      <span className="text-[10px] font-mono text-text-gray px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {resDoc.fileSize}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white font-mono mb-1">
                    {resDoc.label || resDoc.filename}
                  </div>
                  {resDoc.description && (
                    <p className="text-[11px] text-text-gray leading-relaxed font-mono">
                      {resDoc.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono text-text-gray truncate max-w-[180px]">
                    {resDoc.filename}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewingResume(resDoc)}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={resDoc.url}
                      download={resDoc.filename || 'Resume.pdf'}
                      onClick={() => soundFX.playSuccess()}
                      className="px-3 py-1 rounded bg-primary hover:bg-secondary text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-background-dark border border-white/10 mb-8">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab('interactive')
                soundFX.playClick(500)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'interactive'
                  ? 'bg-primary text-white shadow-teal-glow'
                  : 'text-text-gray hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Recruiter View</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ats_view')
                soundFX.playClick(600)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'ats_view'
                  ? 'bg-primary text-white shadow-teal-glow'
                  : 'text-text-gray hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print-Ready / ATS Clean View</span>
            </button>
          </div>

          <span className="hidden sm:inline text-xs font-mono text-emerald-400 flex items-center gap-1.5 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open to Remote & Hybrid Roles</span>
          </span>
        </div>

        {/* PRINT / SCREEN RESUME CANVAS */}
        <div className="rounded-2xl bg-background-medium/95 border border-white/10 p-6 sm:p-10 shadow-2xl relative">
          {/* Candidate Bio Header Card */}
          <div className="p-6 rounded-xl bg-black/40 border border-white/10 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  CHE AMAH DILAND NGWA
                </h2>
                <div className="text-primary font-mono text-sm font-semibold mt-0.5">
                  Senior Backend & Distributed Systems Engineer
                </div>
                <p className="text-xs text-text-gray mt-1">
                  Buea, Cameroon • Open to Global Remote Relocation
                </p>
              </div>

              {/* Direct Quick-Contact Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopy('ngwadiland68@gmail.com', 'email')}
                  className="px-3 py-1.5 rounded-lg bg-background-dark hover:bg-primary/20 border border-white/10 text-xs font-mono text-text-gray hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{copiedContact === 'email' ? 'Email Copied!' : 'ngwadiland68@gmail.com'}</span>
                </button>

                <button
                  onClick={() => handleCopy('+237672344814', 'phone')}
                  className="px-3 py-1.5 rounded-lg bg-background-dark hover:bg-primary/20 border border-white/10 text-xs font-mono text-text-gray hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copiedContact === 'phone' ? 'Phone Copied!' : '+237 672 344 814'}</span>
                </button>

                <a
                  href="https://github.com/Dylan21-svg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-background-dark hover:bg-white/10 border border-white/10 text-xs font-mono text-text-gray hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>github.com/Dylan21-svg</span>
                </a>
              </div>
            </div>
          </div>

          {/* 1. CORE TECHNICAL SKILLS GRID */}
          <div className="mb-10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Core Technical Competencies & Stack</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreSkills.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-background-dark/80 border border-white/5 space-y-2"
                >
                  <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {cat.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item, iIdx) => (
                      <span
                        key={iIdx}
                        className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PROFESSIONAL WORK EXPERIENCE */}
          <div className="mb-10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold mb-6 flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Professional Engineering Experience</span>
            </h3>

            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-background-dark/60 border border-white/5 relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/50 before:rounded-l-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className="text-lg font-bold text-white font-display">
                      {exp.title}
                    </h4>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full self-start sm:self-auto border border-primary/20">
                      {exp.period}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-emerald-400 font-mono mb-3">
                    {exp.company}
                  </div>

                  <p className="text-xs sm:text-sm text-text-gray leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Highlights Bullet List */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((h: string, hIdx: number) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-text-gray leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Skills tags */}
                  {exp.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {exp.skills.map((s: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-text-gray"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. KEY PRODUCTION PROJECTS ON RESUME */}
          <div className="mb-10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Selected High-Impact Architectural Projects</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-xl bg-background-dark/80 border border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h5 className="font-bold text-sm text-white font-display">
                        {proj.title}
                      </h5>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {proj.metrics && proj.metrics[0] ? proj.metrics[0].value : 'Live'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-primary mb-2">
                      {proj.role || 'Backend Architect'}
                    </div>
                    <p className="text-xs text-text-gray line-clamp-3 mb-3 leading-relaxed">
                      {proj.challenge || proj.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                    {(proj.technologies || []).slice(0, 3).map((t: string, tIdx: number) => (
                      <span key={tIdx} className="text-[10px] font-mono text-text-gray bg-white/5 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. FORMAL EDUCATION */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-primary font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>Education & Academic Credentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-background-dark/60 border border-white/5"
                >
                  <div className="text-xs font-mono text-primary mb-1">
                    {edu.period}
                  </div>
                  <h4 className="text-base font-bold text-white font-display">
                    {edu.degree}
                  </h4>
                  <div className="text-xs font-mono font-semibold text-emerald-400 mb-2">
                    {edu.institution}
                  </div>
                  <p className="text-xs text-text-gray leading-relaxed">
                    {edu.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Document PDF Preview Modal */}
      <AnimatePresence>
        {previewingResume && (
          <div
            onClick={() => setPreviewingResume(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-background-dark flex flex-col shadow-2xl"
            >
              <div className="p-4 bg-background-medium border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{previewingResume.title}</h4>
                    <p className="text-xs text-text-gray font-mono">{previewingResume.filename} ({previewingResume.fileSize || 'PDF'})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewingResume.url}
                    download={previewingResume.filename || 'Resume.pdf'}
                    onClick={() => soundFX.playSuccess()}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewingResume(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-black/60 p-2">
                <iframe
                  src={previewingResume.url}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                  title="Resume PDF Viewer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
