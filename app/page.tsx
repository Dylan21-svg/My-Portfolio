'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Plus, Github, Linkedin, Twitter, Code, Database, Server, Cloud, Palette } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getPortfolioData, usePortfolioData } from '@/lib/data'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import AnimatedGrid from '@/components/AnimatedGrid'

const ProjectModal = dynamic(() => import('@/components/ProjectModal'), {
  loading: () => <LoadingSpinner />
})

const stats = [
  { number: '03+', label: 'YEARS EXPERIENCE' },
  { number: '20+', label: 'PROJECTS COMPLETED' },
  { number: '10+', label: 'OPEN SOURCE' },
]

const techStack = [
  { name: 'Python', icon: '🐍' },
  { name: 'Django', icon: '⚖️' },
  { name: 'FastAPI', icon: '⚡' },
  { name: 'Flask', icon: '🧪' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Kubernetes', icon: '☸️' },
  { name: 'Redis', icon: '🔴' },
  { name: 'Celery', icon: '🥦' },
  { name: 'RabbitMQ', icon: '🐇' },
  { name: 'Nginx', icon: '⚙️' },
]

const services = [
  { icon: Server, name: 'Backend Development' },
  { icon: Database, name: 'Database Design' },
  { icon: Code, name: 'API Architecture' },
  { icon: Cloud, name: 'DevOps & Scaling' },
]

export default function Home() {
  const data = usePortfolioData()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Grid Background */}
        <AnimatedGrid />
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-medium to-background-light -z-10">
          <Image
            src={data.home.hero.backgroundImage}
            alt="Professional background"
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left Side - Headshot */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                <Image
                  src={data.home.hero.profileImage}
                  alt={data.home.hero.name}
                  width={400}
                  height={400}
                  className="rounded-full border-4 border-primary shadow-teal-glow"
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glassmorphism rounded-2xl p-8"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-primary mb-4 font-display">
                {data.home.hero.name}
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-6 font-display">
                {data.home.hero.title}
              </h2>
              <p className="text-lg text-text-gray mb-8">
                {data.home.hero.tagline}
              </p>
              <Link href="/resume" className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-teal-glow hover:shadow-lg transition-all duration-300">
                {data.home.hero.ctaText}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </motion.div>
      </div>

      {/* Portfolio Grid Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.home.cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glassmorphism rounded-2xl p-6 relative group hover:shadow-teal-glow transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                {card.type === 'profile' && (
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Image
                        src={data.home.hero.profileImage}
                        alt={data.home.hero.name}
                        width={100}
                        height={100}
                        className="rounded-full border-2 border-primary"
                      />
                    </div>
                    <p className="text-primary font-semibold mb-2">{card.title}</p>
                    <h3 className="text-xl font-bold mb-4">{data.home.hero.name}</h3>
                    <p className="text-text-gray text-sm">{card.content?.split('\n')[1]}</p>
                  </div>
                )}
                {card.type === 'tech-stack' && (
                  <>
                    <h3 className="text-xl font-bold text-primary mb-4">{card.title}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {techStack.map((tech, techIndex) => (
                        <div key={techIndex} className="text-center group">
                          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                            {tech.icon}
                          </div>
                          <p className="text-xs text-text-gray">{tech.name}</p>
                        </div>
                      ))}
                    </div>
                    <Link href="/works" className="text-primary text-sm mt-4 block hover:underline">
                      View All Skills →
                    </Link>
                  </>
                )}
                {card.type === 'credentials' && (
                  <>
                    <p className="text-primary font-semibold mb-2">MORE ABOUT ME</p>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <p className="text-text-gray text-sm whitespace-pre-line">{card.content}</p>
                  </>
                )}
                {card.type === 'projects' && (
                  <>
                    <p className="text-primary font-semibold mb-2">SHOWCASE</p>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <div className="grid grid-cols-1 gap-2 mb-4 h-32 items-center justify-center border border-dashed border-primary/20 rounded">
                      <p className="text-text-gray text-xs text-center italic">No projects showcase yet</p>
                    </div>
                    <Link href="/works" className="text-primary text-sm hover:underline">
                      View All Projects →
                    </Link>
                  </>
                )}
                {card.type === 'services' && (
                  <>
                    <p className="text-primary font-semibold mb-2">SPECIALIZATION</p>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="text-center">
                          <service.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                          <p className="text-xs text-text-gray">{service.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {card.type === 'profiles' && (
                  <>
                    <p className="text-primary font-semibold mb-2">STAY WITH ME</p>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <div className="flex justify-center space-x-4">
                      {data.contact.social.map((social, index) => {
                        const IconComponent = {
                          'GitHub': Github,
                          'LinkedIn': Linkedin,
                          'Twitter': Twitter
                        }[social.platform] || Github
                        return (
                          <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-text-gray hover:text-primary transition-colors">
                            <IconComponent className="w-6 h-6" />
                          </a>
                        )
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Statistics Section */}
          {data.home.stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            >
              {data.home.stats.map((stat, index) => (
                <div key={index} className="text-center glassmorphism rounded-2xl p-6">
                  <h4 className="text-4xl font-bold text-primary mb-2">{stat.number}</h4>
                  <p className="text-text-gray text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 glassmorphism rounded-2xl p-8 md:col-span-2 lg:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Let&apos;s work <span className="text-primary">together.</span>
                </h3>
                <p className="text-text-gray">Ready to bring your ideas to life</p>
              </div>
              <Link
                href="/contact"
                className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 