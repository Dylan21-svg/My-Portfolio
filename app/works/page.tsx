'use client'

import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Image from 'next/image'
import { usePortfolioData } from '@/lib/data'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/LoadingSpinner'

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

const ProjectModal = dynamic(() => import('@/components/ProjectModal'), {
  loading: () => <LoadingSpinner />
})

export default function Works() {
  const data = usePortfolioData()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-center mb-16 font-display"
        >
          FEATURED PROJECTS
        </motion.h1>

        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {data.works.projects.map((project, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <motion.div
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-110 shadow-teal-glow' : 'scale-85 opacity-60'
                  }`}
                  onClick={() => setSelectedProject(project)}
                  whileHover={{ scale: isActive ? 1.05 : 1 }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                      {project.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-text-gray text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="bg-white/20 text-white px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </div>
  )
}