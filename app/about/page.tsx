'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, Linkedin, Twitter, Globe, Mail, Phone, Instagram, Facebook, Youtube, Music } from 'lucide-react'
import Link from 'next/link'
import { usePortfolioData } from '@/lib/data'
import GithubActivity from '@/components/GithubActivity'

const getSocialIcon = (platform: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'GitHub': Github,
    'LinkedIn': Linkedin,
    'Twitter': Twitter,
    'Website': Globe,
    'Email': Mail,
    'Phone': Phone,
    'TikTok': Music,
    'Tiktok': Music,
    'Instagram': Instagram,
    'Facebook': Facebook,
    'YouTube': Youtube
  }
  return iconMap[platform] || Globe
}

export default function About() {
  const data = usePortfolioData()

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold text-center mb-16 font-display"
        >
          ✦ SELF-SUMMARY ✦
        </motion.h1>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-8">
            <Image
              src={data.about.profile.image}
              alt={data.about.profile.name}
              width={200}
              height={200}
              className="rounded-full border-4 border-primary shadow-teal-glow"
              loading="lazy"
            />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4 font-display">{data.about.profile.name}</h2>
          <p className="text-lg text-text-gray max-w-3xl mx-auto">
            {data.about.profile.bio}
          </p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glassmorphism rounded-2xl p-8 border-l-4 border-primary"
          >
            <h3 className="text-2xl font-bold text-primary mb-6 font-display flex items-center gap-2">
              <span className="text-xs opacity-50 tracking-tighter">01.</span> EXPERIENCE
            </h3>
            <div className="space-y-6">
              {data.about.experience.map((exp, index) => (
                <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                  <p className="text-sm text-text-gray font-mono">{exp.period}</p>
                  <h4 className="text-lg font-bold">{exp.title}</h4>
                  <p className="text-primary font-medium">{exp.company}</p>
                  <p className="text-sm text-text-gray/80 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glassmorphism rounded-2xl p-8 border-l-4 border-primary"
          >
            <h3 className="text-2xl font-bold text-primary mb-6 font-display flex items-center gap-2">
              <span className="text-xs opacity-50 tracking-tighter">02.</span> EDUCATION
            </h3>
            <div className="space-y-6">
              {data.about.education.map((edu, index) => (
                <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                  <p className="text-sm text-text-gray font-mono">{edu.period}</p>
                  <h4 className="text-lg font-bold">{edu.degree}</h4>
                  <p className="text-primary font-medium">{edu.institution}</p>
                  <p className="text-sm text-text-gray/80 mt-2">{edu.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Technical Focus & Projects */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-primary mb-6 font-display">TECHNICAL FOCUS & INTERESTS</h3>
            <div className="space-y-4">
              {[
                { title: 'Backend Development', desc: 'Architecting robust SaaS solutions using Python.' },
                { title: 'Future-Proofing', desc: 'Exploring the intersection of Machine Learning and daily automation.' },
                { title: 'Design Philosophy', desc: 'Hacker aesthetics, clean terminal-inspired interfaces, and logic-driven UI/UX.' },
                { title: 'Operational Leadership', desc: 'Managing workflows and product roadmaps to turn ideas into revenue.' }
              ].map((item, i) => (
                <div key={i} className="group">
                  <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-text-gray text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-primary mb-6 font-display">CURRENT PROJECTS</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  CodeForge <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                </h4>
                <p className="text-text-gray text-sm mt-1">An educational platform designed to gamify software engineering for offline users.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  RevenueArchitect AI <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                </h4>
                <p className="text-text-gray text-sm mt-1">A conversion optimization tool for e-commerce merchants powered by agentic loops.</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* GitHub Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <GithubActivity />
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="glassmorphism rounded-2xl p-8 mb-16 text-center italic text-text-gray/80"
        >
          <p className="max-w-4xl mx-auto leading-relaxed">
            &ldquo;When I&apos;m not writing code or refining business operations, you&apos;ll likely find me deconstructing complex logic puzzles or deep in a strategy game, deep diving into the future of vocational tech training, always looking for ways to bridge the gap between traditional education and industry-ready skills.&rdquo;
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Profiles */}
          <div className="glassmorphism rounded-2xl p-6 text-center">
            <h4 className="text-lg font-semibold mb-4 font-display">STAY WITH ME</h4>
            <h5 className="text-primary font-bold mb-4 font-display">Profiles</h5>
            <div className="flex justify-center space-x-4">
              {data.contact.social.map((social, index) => {
                const IconComponent = getSocialIcon(social.platform)
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-gray hover:text-primary transition-colors"
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Credentials */}
          <div className="glassmorphism rounded-2xl p-6 text-center">
            <h4 className="text-lg font-semibold mb-4 font-display">MORE ABOUT ME</h4>
            <h5 className="text-primary font-bold mb-4 font-display">Credentials</h5>
            <div className="space-y-2">
              <p className="text-sm text-text-gray font-medium">Technical Specialist</p>
              <p className="text-xs text-text-gray/80">Advanced Python Backend & API Design</p>
              <div className="h-px bg-primary/10 my-2 w-1/2 mx-auto" />
              <p className="text-sm text-text-gray font-medium">AWS Certified Developer</p>
              <p className="text-xs text-text-gray/80">Associate Level</p>
            </div>
          </div>

          {/* CTA */}
          <div className="glassmorphism rounded-2xl p-6 text-center border-t-2 border-primary/20">
            <h4 className="text-lg font-semibold mb-4 font-display">LET&apos;S WORK</h4>
            <h5 className="text-primary font-bold mb-4 font-display">Together</h5>
            <Link href="/contact" className="inline-block bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Contact Me
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}