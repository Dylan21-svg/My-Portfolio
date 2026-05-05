'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Monitor, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface Project {
  title: string
  category: string
  description: string
  image: string
  images: string[]
  technologies: string[]
  features: string[]
  liveUrl?: string
  githubUrl?: string
}

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [viewMode, setViewMode] = useState<'image' | 'preview'>('image')

  if (!project) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-background-medium rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* View Mode Toggle */}
            {project.liveUrl && (
              <div className="flex justify-center mb-6">
                <div className="bg-background-dark p-1 rounded-full flex gap-1 border border-primary/20">
                  <button
                    onClick={() => setViewMode('image')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      viewMode === 'image' ? 'bg-primary text-white' : 'text-text-gray hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Gallery
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      viewMode === 'preview' ? 'bg-primary text-white' : 'text-text-gray hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Live Preview
                  </button>
                </div>
              </div>
            )}

            {/* Visual Content */}
            <div className="mb-8 relative rounded-xl overflow-hidden bg-background-dark aspect-video border border-primary/10">
              <AnimatePresence mode="wait">
                {viewMode === 'image' ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <iframe
                      src={project.liveUrl}
                      className="w-full h-full border-none"
                      title={project.title}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Project Info */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-primary mb-4 font-display">{project.title}</h2>
                <p className="text-text-gray text-lg mb-8 leading-relaxed">{project.description}</p>
                
                <h3 className="text-xl font-semibold text-primary mb-4">KEY FEATURES</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-text-gray">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">TECH STACK</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-teal-glow hover:shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Site
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-background-dark hover:bg-background-light border border-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      Source Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}