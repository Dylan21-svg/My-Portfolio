'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  RefreshCw,
  Eye,
  Plus,
  Star,
  Link as LinkIcon,
  X,
  FileImage
} from 'lucide-react'
import { soundFX } from '@/lib/soundfx'

interface ProjectImageUploaderProps {
  primaryImage: string
  images?: string[]
  projectTitle: string
  onPrimaryImageChange: (url: string) => void
  onImagesChange: (images: string[]) => void
}

export default function ProjectImageUploader({
  primaryImage,
  images = [],
  projectTitle,
  onPrimaryImageChange,
  onImagesChange
}: ProjectImageUploaderProps) {
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false)
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)

  const primaryFileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)

  // Upload file helper: converts to data URL and attempts server save
  const processImageFile = async (file: File): Promise<{ url: string; filename: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (PNG, JPG, WebP, GIF)'))
        return
      }

      // Check size (warn if > 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.warn('Large image uploaded:', file.size)
      }

      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string

        // Try server upload endpoint if available
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          if (res.ok) {
            const data = await res.json()
            resolve({
              url: data.url || dataUrl,
              filename: file.name
            })
            return
          }
        } catch (err) {
          console.warn('API upload failed, using Data URL fallback:', err)
        }

        // Fallback to Data URL
        resolve({
          url: dataUrl,
          filename: file.name
        })
      }

      reader.onerror = () => {
        reject(new Error('Failed to read image file from your laptop'))
      }

      reader.readAsDataURL(file)
    })
  }

  // Handle Primary Image File Selection
  const handlePrimaryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    soundFX.playClick(600)

    try {
      const { url } = await processImageFile(file)
      onPrimaryImageChange(url)
      // Also ensure it's in the images list if empty
      if (!images || images.length === 0) {
        onImagesChange([url])
      } else if (!images.includes(url)) {
        onImagesChange([url, ...images])
      }
      soundFX.playSuccess()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image')
    } finally {
      setIsUploading(false)
      if (primaryFileInputRef.current) {
        primaryFileInputRef.current.value = ''
      }
    }
  }

  // Handle Primary Image Drop
  const handlePrimaryDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingPrimary(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    soundFX.playClick(600)

    try {
      const { url } = await processImageFile(file)
      onPrimaryImageChange(url)
      if (!images || images.length === 0) {
        onImagesChange([url])
      } else if (!images.includes(url)) {
        onImagesChange([url, ...images])
      }
      soundFX.playSuccess()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Gallery Files Selection
  const handleGalleryFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)
    soundFX.playClick(600)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const { url } = await processImageFile(files[i])
        newUrls.push(url)
      }

      const updated = [...images, ...newUrls]
      onImagesChange(updated)

      // If no primary image set, set the first uploaded one
      if (!primaryImage && newUrls.length > 0) {
        onPrimaryImageChange(newUrls[0])
      }
      soundFX.playSuccess()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process gallery images')
    } finally {
      setIsUploading(false)
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }
    }
  }

  // Handle Gallery Drop
  const handleGalleryDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingGallery(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)
    soundFX.playClick(600)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const { url } = await processImageFile(files[i])
        newUrls.push(url)
      }

      const updated = [...images, ...newUrls]
      onImagesChange(updated)

      if (!primaryImage && newUrls.length > 0) {
        onPrimaryImageChange(newUrls[0])
      }
      soundFX.playSuccess()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process gallery images')
    } finally {
      setIsUploading(false)
    }
  }

  // Remove an image from gallery
  const removeGalleryImage = (idxToRemove: number) => {
    soundFX.playClick(400)
    const removedUrl = images[idxToRemove]
    const filtered = images.filter((_, i) => i !== idxToRemove)
    onImagesChange(filtered)

    // If removed was primary, switch primary to first remaining
    if (primaryImage === removedUrl && filtered.length > 0) {
      onPrimaryImageChange(filtered[0])
    }
  }

  // Set image as primary preview
  const setAsPrimary = (url: string) => {
    soundFX.playSuccess()
    onPrimaryImageChange(url)
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-background-dark/95 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Project Visual Previews & Screenshots
          </span>
          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono">
            Direct Machine Upload
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-mono text-text-gray hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL Override' : 'Edit raw URL'}</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {uploadError}
        </div>
      )}

      {/* Raw URL fallback input (collapsible) */}
      {showUrlInput && (
        <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
          <label className="text-[11px] font-mono text-text-gray">Direct Image URL / Path</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={primaryImage || ''}
              onChange={(e) => onPrimaryImageChange(e.target.value)}
              placeholder="/images/project.jpg or https://..."
              className="flex-1 bg-background-dark border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white focus:border-primary outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (primaryImage && !images.includes(primaryImage)) {
                  onImagesChange([...images, primaryImage])
                }
              }}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white"
            >
              Add to Gallery
            </button>
          </div>
        </div>
      )}

      {/* 1. Main Project Preview Image Dropzone & Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Current Primary Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <span className="text-xs font-mono text-text-gray mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-white">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Main Card Preview Image</span>
            </span>
            {primaryImage && (
              <button
                type="button"
                onClick={() => setPreviewModalImg(primaryImage)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Enlarge</span>
              </button>
            )}
          </span>

          <div className="relative flex-1 min-h-[160px] rounded-xl overflow-hidden border border-white/15 bg-black/60 flex items-center justify-center group">
            {primaryImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage}
                  alt={projectTitle}
                  className="w-full h-full object-cover max-h-[220px]"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() => primaryFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg(primaryImage)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-mono transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-text-gray space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-text-gray/50" />
                <p className="text-xs font-mono">No preview image set</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload from Laptop Dropzone */}
        <div className="lg:col-span-7 flex flex-col">
          <span className="text-xs font-mono text-text-gray mb-1.5 font-semibold text-white">
            Upload New Preview from Laptop
          </span>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingPrimary(true)
            }}
            onDragLeave={() => setIsDraggingPrimary(false)}
            onDrop={handlePrimaryDrop}
            onClick={() => primaryFileInputRef.current?.click()}
            className={`flex-1 min-h-[160px] rounded-xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center text-center cursor-pointer ${
              isDraggingPrimary
                ? 'border-primary bg-primary/15 shadow-teal-glow'
                : 'border-white/20 hover:border-primary/60 bg-black/30 hover:bg-black/50'
            }`}
          >
            <input
              ref={primaryFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handlePrimaryFileSelect}
              className="hidden"
            />

            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-2.5">
              {isUploading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <p className="text-xs font-mono font-bold text-white mb-1">
              {isUploading ? 'Processing File...' : 'Drag & drop image from your machine'}
            </p>
            <p className="text-[11px] font-mono text-text-gray">
              or <span className="text-primary underline">browse laptop files</span> (PNG, JPG, WebP, GIF)
            </p>
            <p className="text-[10px] font-mono text-text-gray/60 mt-2">
              Automatically saved & optimized for the live portfolio card
            </p>
          </div>
        </div>
      </div>

      {/* 2. Gallery Screenshots Strip & Multi-Upload */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-text-gray flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-white">Project Screenshots Gallery ({images.length})</span>
          </span>

          <button
            type="button"
            onClick={() => galleryFileInputRef.current?.click()}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-primary/20 text-text-gray hover:text-primary text-xs font-mono border border-white/10 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Screenshot</span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((imgUrl, idx) => {
            const isSelectedPrimary = primaryImage === imgUrl
            return (
              <div
                key={idx}
                className={`group relative rounded-lg overflow-hidden border transition-all aspect-video bg-black/60 flex items-center justify-center ${
                  isSelectedPrimary ? 'border-primary ring-2 ring-primary/40' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {isSelectedPrimary && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-primary text-black font-mono text-[9px] font-bold flex items-center gap-1 shadow">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    <span>Primary</span>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {!isSelectedPrimary && (
                    <button
                      type="button"
                      onClick={() => setAsPrimary(imgUrl)}
                      className="p-1.5 rounded bg-primary hover:bg-secondary text-white text-[10px] font-mono font-bold transition-colors"
                      title="Set as Main Preview"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewModalImg(imgUrl)}
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono transition-colors"
                    title="Enlarge"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[10px] font-mono transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Upload More Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingGallery(true)
            }}
            onDragLeave={() => setIsDraggingGallery(false)}
            onDrop={handleGalleryDrop}
            onClick={() => galleryFileInputRef.current?.click()}
            className={`rounded-lg border-2 border-dashed transition-all aspect-video flex flex-col items-center justify-center text-center cursor-pointer p-2 ${
              isDraggingGallery
                ? 'border-primary bg-primary/20'
                : 'border-white/15 hover:border-primary/50 bg-black/20 hover:bg-black/40'
            }`}
          >
            <input
              ref={galleryFileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleGalleryFilesSelect}
              className="hidden"
            />
            <Plus className="w-4 h-4 text-primary mb-1" />
            <span className="text-[10px] font-mono font-bold text-white">Add Screenshot</span>
            <span className="text-[9px] font-mono text-text-gray">From Laptop</span>
          </div>
        </div>
      </div>

      {/* Enlarged Image Preview Modal */}
      <AnimatePresence>
        {previewModalImg && (
          <div
            onClick={() => setPreviewModalImg(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 bg-background-dark p-2"
            >
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalImg}
                alt="Enlarged preview"
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
