'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Image from 'next/image'
import { usePortfolioData } from '@/lib/data'
import { Project } from '@/lib/types'
import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  ExternalLink,
  Github,
  Terminal,
  Activity,
  Layers,
  LayoutGrid,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Server,
  Tag,
  Filter,
  X,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
  Code2
} from 'lucide-react'
import { soundFX } from '@/lib/soundfx'

const ProjectModal = dynamic(() => import('@/components/ProjectModal'), {
  loading: () => <LoadingSpinner />,
})

export default function Works() {
  const data = usePortfolioData()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid')
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({})

  const rawProjects = data.works.projects
  const projects: Project[] = useMemo(() => rawProjects || [], [rawProjects])

  // Extract all categories
  const categories = useMemo(() => {
    const rawCategories = projects.map((p) => p.category).filter(Boolean)
    const uniqueCategories = Array.from(new Set(rawCategories))
    return ['All', ...uniqueCategories]
  }, [projects])

  // Extract all technologies with project counts
  const techStats = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach((p) => {
      ;(p.technologies || []).forEach((t) => {
        const trimmed = t.trim()
        if (trimmed) {
          counts[trimmed] = (counts[trimmed] || 0) + 1
        }
      })
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [projects])

  // Filtered projects by category, technology tag, and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      const matchesTech =
        !selectedTech ||
        (p.technologies || []).some(
          (t) => t.trim().toLowerCase() === selectedTech.trim().toLowerCase()
        )
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.technologies || []).some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesCategory && matchesTech && matchesSearch
    })
  }, [projects, selectedCategory, selectedTech, searchQuery])

  // Handler for tech tag clicking (click-to-filter)
  const handleTechClick = (tech: string) => {
    soundFX.playClick(600)
    if (selectedTech?.toLowerCase() === tech.toLowerCase()) {
      setSelectedTech(null)
    } else {
      setSelectedTech(tech)
      // Check if current category has matches for this tech; if not, reset category to All so results show
      const matchesInCategory = projects.filter(
        (p) =>
          (selectedCategory === 'All' || p.category === selectedCategory) &&
          (p.technologies || []).some(
            (t) => t.trim().toLowerCase() === tech.trim().toLowerCase()
          )
      )
      if (matchesInCategory.length === 0 && selectedCategory !== 'All') {
        setSelectedCategory('All')
      }
    }
  }

  // Toggle expanding full tags on a project card
  const toggleExpandCardTags = (cardId: string) => {
    soundFX.playClick(500)
    setExpandedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  // Clear all active filters
  const handleResetFilters = () => {
    soundFX.playSuccess()
    setSelectedCategory('All')
    setSelectedTech(null)
    setSearchQuery('')
  }

  const isFilteringActive = selectedCategory !== 'All' || selectedTech !== null || searchQuery.trim() !== ''

  return (
    <div className="min-h-screen py-16 sm:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Recruiter Fast-Pitch Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Server className="w-3.5 h-3.5" />
            <span>Backend Systems & Distributed Architecture</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4 font-display tracking-tight"
          >
            ENGINEERING WORK & SYSTEMS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-gray text-base sm:text-lg leading-relaxed"
          >
            Production-grade backend architectures, resilient offline sync protocols, high-concurrency e-commerce backends, and automated ML pipelines. Click any <span className="text-primary font-semibold">tech tag</span> to instantly filter all systems built with that technology.
          </motion.p>
        </div>

        {/* Filter & View Mode Controls Bar */}
        <div className="space-y-3 mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3.5 rounded-2xl bg-background-dark/80 border border-white/10 backdrop-blur-md">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="text-xs font-mono text-text-gray/70 mr-1 hidden sm:inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-primary" /> Domain:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundFX.playClick(500)
                    setSelectedCategory(cat)
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-teal-glow'
                      : 'text-text-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Controls: Search & View Mode Switcher */}
            <div className="flex items-center gap-2.5 justify-between lg:justify-end">
              {/* Quick Search Input */}
              <div className="relative flex-1 sm:w-56 lg:w-48">
                <Search className="w-3.5 h-3.5 text-text-gray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search systems/stack..."
                  className="w-full bg-background-medium/90 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-text-gray/50 focus:border-primary focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-gray hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-background-medium p-1 rounded-xl border border-white/10 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    viewMode === 'carousel'
                      ? 'bg-primary text-white'
                      : 'text-text-gray hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Carousel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Technology Filter Ribbon */}
          <div className="p-3 rounded-xl bg-background-medium/40 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
              <div className="flex items-center gap-1 text-primary shrink-0 mr-1 font-semibold">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Tech Filter:</span>
              </div>

              {/* All Techs Chip */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick(500)
                  setSelectedTech(null)
                }}
                className={`px-2.5 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedTech === null
                    ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                    : 'text-text-gray hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>All ({projects.length})</span>
              </button>

              {/* Individual Tech Chips */}
              {techStats.map((tech) => {
                const isSelected = selectedTech?.toLowerCase() === tech.name.toLowerCase()
                return (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => handleTechClick(tech.name)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-teal-glow font-bold ring-1 ring-primary/50'
                        : 'bg-background-dark/80 hover:bg-primary/15 border-white/10 hover:border-primary/40 text-text-gray hover:text-white'
                    }`}
                  >
                    <span>{tech.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-text-gray'
                      }`}
                    >
                      {tech.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          {isFilteringActive && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center flex-wrap gap-2 text-white">
                <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Showing</span>
                <span className="font-bold text-primary px-1.5 py-0.5 rounded bg-primary/20">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                </span>
                {selectedTech && (
                  <span className="flex items-center gap-1 text-text-gray">
                    built with <span className="text-white font-bold bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-primary" />
                      {selectedTech}
                      <button
                        onClick={() => setSelectedTech(null)}
                        className="hover:text-red-400 ml-0.5"
                        title="Remove tech filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="flex items-center gap-1 text-text-gray">
                    in category <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="hover:text-red-400 ml-0.5"
                        title="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1 text-text-gray">
                    matching &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedCategory !== 'All' && selectedTech && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-primary hover:text-white hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>View all {selectedTech} projects across domains</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 rounded-lg bg-background-dark hover:bg-red-950/40 text-text-gray hover:text-red-300 border border-white/10 hover:border-red-500/40 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* PROJECTS CONTAINER */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            /* EMPTY FILTER STATE */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center py-16 px-6 rounded-2xl bg-background-medium/60 border border-white/10 max-w-xl mx-auto space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                No matching projects found
              </h3>
              <p className="text-xs sm:text-sm text-text-gray">
                {selectedTech && selectedCategory !== 'All'
                  ? `No systems found using ${selectedTech} under "${selectedCategory}".`
                  : `No projects match your current filter parameters.`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {selectedTech && selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary text-white font-mono text-xs font-semibold shadow-teal-glow transition-all"
                  >
                    Show all {selectedTech} projects
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-background-dark hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-semibold transition-all"
                >
                  Reset all filters
                </button>
              </div>
            </motion.div>
          ) : viewMode === 'grid' ? (
            /* 1. HIGH-IMPACT GRID VIEW */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project, index) => {
                const cardKey = project.id || project.title || String(index)
                const isExpanded = !!expandedCardIds[cardKey]
                const allTags = project.technologies || []
                const visibleTags = isExpanded ? allTags : allTags.slice(0, 4)
                const remainingCount = allTags.length - 4

                return (
                  <motion.div
                    key={cardKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-2xl bg-background-medium/90 border border-white/10 hover:border-primary/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Card Header & Image */}
                    <div>
                      <div
                        className="relative aspect-video w-full overflow-hidden bg-background-dark cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Image
                          src={project.image || '/images/D1.jpeg'}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-medium via-background-medium/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-primary/30 text-primary text-[11px] font-mono font-semibold">
                            {project.category}
                          </span>
                          {project.status && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {project.status}
                            </span>
                          )}
                        </div>

                        {/* Role on hover */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-xs text-text-gray font-mono">
                            {project.role || 'Senior Backend Engineer'}
                          </div>
                          <h3 className="text-xl font-bold text-white font-display group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        <p className="text-text-gray text-xs sm:text-sm line-clamp-3 leading-relaxed">
                          {project.challenge || project.description}
                        </p>

                        {/* Key Metric Highlight */}
                        {project.metrics && project.metrics.length > 0 && (
                          <div className="p-3 rounded-xl bg-background-dark/90 border border-white/5 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-mono text-text-gray">
                                {project.metrics[0].label}
                              </div>
                              <div className="text-lg font-black text-primary font-mono">
                                {project.metrics[0].value}
                              </div>
                            </div>
                            {project.metrics[1] && (
                              <div className="text-right">
                                <div className="text-[10px] uppercase font-mono text-text-gray">
                                  {project.metrics[1].label}
                                </div>
                                <div className="text-lg font-black text-emerald-400 font-mono">
                                  {project.metrics[1].value}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Technologies (Click-to-Filter Tags) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-text-gray/70">
                            <span className="flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-primary" /> Tech Stack:
                            </span>
                            <span>Click tag to filter</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {visibleTags.map((tech, techIdx) => {
                              const isSelected = selectedTech?.toLowerCase() === tech.toLowerCase()
                              return (
                                <button
                                  key={techIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTechClick(tech)
                                  }}
                                  title={`Click to filter all projects using ${tech}`}
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                    isSelected
                                      ? 'bg-primary text-white border-primary shadow-teal-glow font-bold ring-1 ring-primary/40'
                                      : 'bg-white/5 hover:bg-primary/20 text-text-gray hover:text-white border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  <span>{tech}</span>
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </button>
                              )
                            })}

                            {remainingCount > 0 && !isExpanded && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpandCardTags(cardKey)
                                }}
                                title="Show all technology tags"
                                className="px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-[11px] font-mono text-primary font-semibold transition-colors"
                              >
                                +{remainingCount} more
                              </button>
                            )}

                            {isExpanded && allTags.length > 4 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleExpandCardTags(cardKey)
                                }}
                                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-text-gray hover:text-white"
                              >
                                Show less
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-primary/15 hover:bg-primary text-primary hover:text-white border border-primary/30 hover:border-primary font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Inspect Architecture & API</span>
                      </button>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-background-dark hover:bg-white/10 text-text-gray hover:text-white border border-white/10 transition-colors"
                          title="Open Live Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-background-dark hover:bg-white/10 text-text-gray hover:text-white border border-white/10 transition-colors"
                          title="GitHub Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            /* 2. CAROUSEL SHOWCASE VIEW */
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Swiper
                modules={[Navigation, Pagination, Keyboard, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                centeredSlides={true}
                navigation
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                loop={filteredProjects.length > 2}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 1.5, spaceBetween: 20 },
                  1024: { slidesPerView: 2.3, spaceBetween: 30 },
                }}
                className="pb-14"
              >
                {filteredProjects.map((project, index) => (
                  <SwiperSlide key={project.id || index}>
                    {({ isActive }) => (
                      <motion.div
                        className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-background-medium border ${
                          isActive
                            ? 'scale-100 opacity-100 border-primary/50 shadow-teal-glow'
                            : 'scale-90 opacity-40 border-white/10'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="relative aspect-video w-full">
                          <Image
                            src={project.image || '/images/D1.jpeg'}
                            alt={project.title}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                              {project.category}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 space-y-2">
                            <div>
                              <div className="text-xs text-text-gray font-mono">
                                {project.role || 'Backend Engineer'}
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                {project.title}
                              </h3>
                              <p className="text-text-gray text-xs line-clamp-2">
                                {project.description}
                              </p>
                            </div>

                            {/* Clickable Tech Stack Tags inside Carousel */}
                            <div
                              className="flex flex-wrap gap-1 pt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(project.technologies || []).slice(0, 5).map((tech, tIdx) => {
                                const isSelected = selectedTech?.toLowerCase() === tech.toLowerCase()
                                return (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={() => handleTechClick(tech)}
                                    title={`Click to filter by ${tech}`}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all ${
                                      isSelected
                                        ? 'bg-primary text-white border-primary font-bold'
                                        : 'bg-black/60 hover:bg-primary/30 text-text-gray hover:text-white border-white/20'
                                    }`}
                                  >
                                    {tech}
                                  </button>
                                )
                              })}
                            </div>

                            {project.metrics && project.metrics[0] && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-primary/30 text-primary text-xs font-mono">
                                <Zap className="w-3.5 h-3.5" />
                                <span>
                                  {project.metrics[0].label}: {project.metrics[0].value}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recruiter Fast-Action CTA Footer */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-background-dark via-background-medium to-background-dark border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Available for Backend & Distributed Systems Roles</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-display">
              Interested in how these systems scale?
            </h3>
            <p className="text-text-gray text-sm mt-1 max-w-xl">
              I specialize in Python (FastAPI, Flask, Django), asynchronous worker queues (Celery, RabbitMQ), PostgreSQL performance tuning, and distributed caching.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/resume"
              className="px-5 py-3 rounded-xl bg-background-dark hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
            >
              Review Full Resume
            </a>
            <a
              href="/contact"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-xs transition-all shadow-teal-glow flex items-center gap-2"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Comprehensive Project Deep Dive Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onSelectTech={handleTechClick}
            selectedTech={selectedTech}
          />
        )}
      </div>
    </div>
  )
}

