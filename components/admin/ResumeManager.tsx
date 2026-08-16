'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  Tag,
  Briefcase,
  AlertCircle,
  FileUp,
  X,
  Plus
} from 'lucide-react'
import { ResumeDocument } from '@/lib/types'
import { soundFX } from '@/lib/soundfx'

interface ResumeManagerProps {
  resumes: ResumeDocument[]
  legacyResume?: { url: string; filename: string }
  onChange: (resumes: ResumeDocument[]) => void
  onLegacyChange?: (resume: { url: string; filename: string }) => void
}

const DEFAULT_SLOTS: Array<{ id: string; defaultTitle: string; defaultLabel: string; description: string }> = [
  {
    id: 'resume-primary',
    defaultTitle: 'Primary Technical Resume',
    defaultLabel: 'Senior Backend & Distributed Systems Architecture',
    description: 'The core resume highlighted by default for recruiters, focusing on Python, FastAPI, database scalability, and system design.'
  },
  {
    id: 'resume-secondary',
    defaultTitle: 'Secondary / Specialized Resume',
    defaultLabel: 'Full-Stack & Solutions Engineering Leadership',
    description: 'An alternative or tailored resume for full-stack engineering, solutions architecture, or leadership positions.'
  }
]

export default function ResumeManager({
  resumes = [],
  legacyResume,
  onChange,
  onLegacyChange
}: ResumeManagerProps) {
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null)
  const [isDraggingSlot, setIsDraggingSlot] = useState<number | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<ResumeDocument | null>(null)

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ]

  // Ensure we have at least 2 structured slots
  const ensureTwoResumes = (): ResumeDocument[] => {
    const list: ResumeDocument[] = [...resumes]

    // Slot 1
    if (!list[0]) {
      list[0] = {
        id: 'resume-primary',
        title: DEFAULT_SLOTS[0].defaultTitle,
        label: DEFAULT_SLOTS[0].defaultLabel,
        filename: legacyResume?.filename || 'Che_Dylan_Backend_Resume.pdf',
        url: legacyResume?.url || '/resume.pdf',
        fileSize: '142 KB',
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        description: DEFAULT_SLOTS[0].description
      }
    }

    // Slot 2
    if (!list[1]) {
      list[1] = {
        id: 'resume-secondary',
        title: DEFAULT_SLOTS[1].defaultTitle,
        label: DEFAULT_SLOTS[1].defaultLabel,
        filename: 'Che_Dylan_FullStack_Resume.pdf',
        url: legacyResume?.url || '/resume.pdf',
        fileSize: '158 KB',
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        description: DEFAULT_SLOTS[1].description
      }
    }

    return list.slice(0, 2)
  }

  const activeResumes = ensureTwoResumes()

  // Process uploaded resume file from machine
  const processResumeFile = async (file: File, slotIndex: number) => {
    setUploadingSlot(slotIndex)
    setErrorMessage(null)
    soundFX.playClick(600)

    try {
      // Validate file type
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isDoc = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')

      if (!isPdf && !isDoc) {
        throw new Error('Please upload a PDF document (.pdf) or Word document (.docx)')
      }

      // Format size
      const sizeBytes = file.size
      const formattedSize =
        sizeBytes < 1024
          ? `${sizeBytes} B`
          : sizeBytes < 1024 * 1024
          ? `${(sizeBytes / 1024).toFixed(1)} KB`
          : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`

      // Read as Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file from machine'))
        reader.readAsDataURL(file)
      })

      let finalUrl = dataUrl

      // Try server upload API
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        if (res.ok) {
          const apiRes = await res.json()
          if (apiRes.url) {
            finalUrl = apiRes.url
          }
        }
      } catch (err) {
        console.warn('Server upload endpoint failed, storing data URL locally:', err)
      }

      const updatedList = [...activeResumes]
      const currentSlot = updatedList[slotIndex] || {}

      updatedList[slotIndex] = {
        ...currentSlot,
        id: currentSlot.id || (slotIndex === 0 ? 'resume-primary' : 'resume-secondary'),
        title: currentSlot.title || (slotIndex === 0 ? DEFAULT_SLOTS[0].defaultTitle : DEFAULT_SLOTS[1].defaultTitle),
        label: currentSlot.label || (slotIndex === 0 ? DEFAULT_SLOTS[0].defaultLabel : DEFAULT_SLOTS[1].defaultLabel),
        filename: file.name,
        fileSize: formattedSize,
        fileType: file.type || 'application/pdf',
        url: finalUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        description: currentSlot.description || (slotIndex === 0 ? DEFAULT_SLOTS[0].description : DEFAULT_SLOTS[1].description)
      }

      onChange(updatedList)

      // Also update legacy single resume if slot 0
      if (slotIndex === 0 && onLegacyChange) {
        onLegacyChange({
          url: finalUrl,
          filename: file.name
        })
      }

      soundFX.playSuccess()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload resume file')
    } finally {
      setUploadingSlot(null)
      if (fileInputRefs[slotIndex]?.current) {
        fileInputRefs[slotIndex].current!.value = ''
      }
    }
  }

  // Update specific metadata fields for a slot
  const updateSlotField = (slotIndex: number, field: keyof ResumeDocument, value: string) => {
    const updatedList = [...activeResumes]
    updatedList[slotIndex] = {
      ...updatedList[slotIndex],
      [field]: value
    }
    onChange(updatedList)
  }

  // Remove a resume file
  const removeResumeFile = (slotIndex: number) => {
    soundFX.playClick(400)
    const updatedList = [...activeResumes]
    updatedList[slotIndex] = {
      ...updatedList[slotIndex],
      url: '',
      filename: 'No document uploaded',
      fileSize: undefined,
      uploadedAt: undefined
    }
    onChange(updatedList)
  }

  return (
    <div className="p-6 rounded-2xl bg-background-medium/95 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white font-display">Resume Document Management</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-mono font-semibold">
              2 Resume Slots
            </span>
          </div>
          <p className="text-xs text-text-gray font-mono mt-1">
            Upload two dedicated resume versions (e.g. Primary Backend & Tailored Full-Stack) directly from your laptop.
          </p>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Syncs with Public /resume Page</span>
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2 Resume Slots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeResumes.map((resumeItem, slotIdx) => {
          const isSlotUploading = uploadingSlot === slotIdx
          const isSlotDragging = isDraggingSlot === slotIdx
          const hasFile = !!resumeItem.url && resumeItem.url.length > 0
          const isPrimary = slotIdx === 0

          return (
            <div
              key={slotIdx}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-5 ${
                isPrimary
                  ? 'bg-black/40 border-primary/40 shadow-xl relative'
                  : 'bg-black/30 border-white/15 hover:border-white/25'
              }`}
            >
              {/* Slot Header Banner */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        isPrimary
                          ? 'bg-primary text-black'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      {slotIdx + 1}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        {isPrimary ? 'Slot 1: Primary Technical Resume' : 'Slot 2: Secondary / Specialized Resume'}
                      </span>
                    </div>
                  </div>

                  {hasFile && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  )}
                </div>

                {/* Editable Title & Role Specialty */}
                <div className="space-y-2.5 mb-4">
                  <div>
                    <label className="text-[11px] font-mono text-text-gray block mb-1">Resume Document Title</label>
                    <input
                      type="text"
                      value={resumeItem.title}
                      onChange={(e) => updateSlotField(slotIdx, 'title', e.target.value)}
                      placeholder={DEFAULT_SLOTS[slotIdx].defaultTitle}
                      className="w-full bg-background-dark border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-primary outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-text-gray block mb-1">Role & Focus Tag</label>
                    <input
                      type="text"
                      value={resumeItem.label || ''}
                      onChange={(e) => updateSlotField(slotIdx, 'label', e.target.value)}
                      placeholder={DEFAULT_SLOTS[slotIdx].defaultLabel}
                      className="w-full bg-background-dark border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-primary focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-text-gray block mb-1">Recruiter Pitch / Focus Notes</label>
                    <textarea
                      value={resumeItem.description || ''}
                      onChange={(e) => updateSlotField(slotIdx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Brief note describing who this resume is tailored for..."
                      className="w-full bg-background-dark border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-text-gray focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Current File Metadata Card (if uploaded) */}
                {hasFile && (
                  <div className="p-3.5 rounded-xl bg-background-dark/90 border border-white/10 space-y-2 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-mono font-bold text-white truncate" title={resumeItem.filename}>
                            {resumeItem.filename}
                          </div>
                          <div className="text-[10px] font-mono text-text-gray flex items-center gap-2 mt-0.5">
                            {resumeItem.fileSize && <span>{resumeItem.fileSize}</span>}
                            {resumeItem.fileSize && resumeItem.uploadedAt && <span>•</span>}
                            {resumeItem.uploadedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{resumeItem.uploadedAt}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick File Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(resumeItem)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-text-gray hover:text-white transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={resumeItem.url}
                          download={resumeItem.filename || 'Resume.pdf'}
                          onClick={() => soundFX.playSuccess()}
                          className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                          title="Download File to Test"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => removeResumeFile(slotIdx)}
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-text-gray hover:text-rose-400 transition-colors"
                          title="Remove Uploaded File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Drag & Drop / File Browser Upload Card */}
              <div>
                <input
                  ref={fileInputRefs[slotIdx]}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) processResumeFile(file, slotIdx)
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDraggingSlot(slotIdx)
                  }}
                  onDragLeave={() => setIsDraggingSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDraggingSlot(null)
                    const file = e.dataTransfer.files?.[0]
                    if (file) processResumeFile(file, slotIdx)
                  }}
                  onClick={() => fileInputRefs[slotIdx].current?.click()}
                  className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    isSlotDragging
                      ? 'border-primary bg-primary/20 shadow-teal-glow'
                      : 'border-white/20 hover:border-primary/60 bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-2">
                    {isSlotUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>

                  <p className="text-xs font-mono font-bold text-white mb-0.5">
                    {isSlotUploading
                      ? 'Uploading Resume...'
                      : hasFile
                      ? `Replace ${isPrimary ? 'Primary' : 'Secondary'} Resume File`
                      : `Upload ${isPrimary ? 'Primary' : 'Secondary'} Resume from Laptop`}
                  </p>
                  <p className="text-[11px] font-mono text-text-gray">
                    Drag & drop PDF / DOCX file or <span className="text-primary underline">browse laptop</span>
                  </p>
                  <p className="text-[10px] font-mono text-text-gray/60 mt-1">
                    Accepts PDF or Word documents
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Helper Guidance Footer */}
      <div className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-text-gray">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>Both uploaded resumes will be made accessible as direct downloads on your public <strong>/resume</strong> page.</span>
        </div>

        <a
          href="/resume"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1 shrink-0 font-semibold"
        >
          <span>View Live /resume Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* PDF Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div
            onClick={() => setPreviewDoc(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-background-dark flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 bg-background-medium border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{previewDoc.title}</h4>
                    <p className="text-xs text-text-gray font-mono">{previewDoc.filename} ({previewDoc.fileSize || 'PDF'})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.url}
                    download={previewDoc.filename}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Iframe or Embed */}
              <div className="flex-1 bg-black/60 p-2">
                <iframe
                  src={previewDoc.url}
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
