'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Upload } from 'lucide-react'
import { Project, Skill, Experience, Education } from '@/lib/types'
import { projects, skills, experience, education } from '@/lib/constants'

interface Card {
  id: string
  type: 'profile' | 'tech-stack' | 'credentials' | 'projects' | 'services' | 'profiles' | 'stats' | 'cta'
  title?: string
  content?: string
  image?: string
  links?: { name: string; url: string }[]
}

interface PageData {
  home: {
    hero: {
      name: string
      title: string
      tagline: string
      ctaText: string
      profileImage: string
      backgroundImage: string
    }
    cards: Card[]
    stats: { number: string; label: string }[]
  }
  about: {
    profile: {
      name: string
      bio: string
      image: string
    }
    experience: Experience[]
    education: Education[]
  }
  works: {
    projects: Project[]
  }
  contact: {
    info: {
      email: string
      phone: string
      location: string
    }
    social: { platform: string; url: string }[]
  }
  resume?: {
    url: string
    filename: string
  }
}

const defaultData: PageData = {
  home: {
    hero: {
      name: 'DYLAN SPARKS',
      title: 'SOFTWARE ENGINEER',
      tagline: 'Building scalable solutions and innovative applications',
      ctaText: 'VIEW MY WORK',
      profileImage: '/images/profile.jpg',
      backgroundImage: '/images/hero-bg.jpg'
    },
    cards: [
      { id: '1', type: 'profile', title: 'A SOFTWARE ENGINEER', content: 'Dylan Sparks\nSan Francisco, CA' },
      { id: '2', type: 'tech-stack', title: 'Tech Stack' },
      { id: '3', type: 'credentials', title: 'Credentials', content: 'AWS Certified Developer\nReact Certified' },
      { id: '4', type: 'projects', title: 'Projects' },
      { id: '5', type: 'services', title: 'Services Offering' },
      { id: '6', type: 'profiles', title: 'Profiles' }
    ],
    stats: [
      { number: '04', label: 'YEARS EXPERIENCE' },
      { number: '+125', label: 'CLIENTS WORLDWIDE' },
      { number: '+210', label: 'TOTAL PROJECTS' }
    ]
  },
  about: {
    profile: {
      name: 'DYLAN SPARKS',
      bio: 'Passionate software engineer with 4+ years of experience...',
      image: '/images/profile.jpg'
    },
    experience,
    education
  },
  works: { projects },
  contact: {
    info: {
      email: 'hello@dylansparks.com',
      phone: '+1 (555) 123-4567',
      location: '123 Tech Street, San Francisco, CA 94105'
    },
    social: [
      { platform: 'GitHub', url: 'https://github.com/dylansparks' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/dylansparks' },
      { platform: 'Twitter', url: 'https://twitter.com/dylansparks' }
    ]
  }
}

export default function Admin() {
  const router = useRouter()
  const [data, setData] = useState<PageData>(defaultData)
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'works' | 'contact' | 'resume'>('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()

    // Load data using the same logic as the main app
    const saved = localStorage.getItem('portfolioData')
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        // Merge with defaults to ensure all properties exist
        setData({ ...defaultData, ...parsedData })
      } catch (error) {
        console.error('Error parsing saved data:', error)
        setData(defaultData)
      }
    } else {
      setData(defaultData)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const saveData = async () => {
    try {
      // Save to API first (server-side storage)
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('portfolioData', JSON.stringify(data))

        // Dispatch custom event to notify other components of data update
        window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))

        alert('Data saved successfully! Changes will be reflected on the main site.')
      } else {
        throw new Error('API save failed')
      }
    } catch (error) {
      console.error('Error saving data:', error)

      // Fallback to localStorage only
      try {
        localStorage.setItem('portfolioData', JSON.stringify(data))
        window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))
        alert('Data saved to local storage only. API unavailable - changes may not persist across devices.')
      } catch (localError) {
        console.error('Error saving to localStorage:', localError)
        alert('Error saving data. Please try again.')
      }
    }
  }

  const updateHomeHero = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        hero: { ...prev.home.hero, [field]: value }
      }
    }))
  }

  const addCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      type: 'profile',
      title: 'New Card',
      content: 'Card content'
    }
    setData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        cards: [...prev.home.cards, newCard]
      }
    }))
  }

  const updateCard = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        cards: prev.home.cards.map(card =>
          card.id === id ? { ...card, [field]: value } : card
        )
      }
    }))
  }

  const deleteCard = (id: string) => {
    setData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        cards: prev.home.cards.filter(card => card.id !== id)
      }
    }))
  }

  const updateStat = (index: number, field: 'number' | 'label', value: string) => {
    setData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        stats: prev.home.stats.map((stat, i) =>
          i === index ? { ...stat, [field]: value } : stat
        )
      }
    }))
  }

  const updateAbout = (section: 'profile' | 'experience' | 'education', field: string, value: any) => {
    setData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [section]: typeof value === 'object' ? value : { ...prev.about[section], [field]: value }
      }
    }))
  }

  const updateProject = <K extends keyof Project>(index: number, field: K, value: Project[K]) => {
    const newProjects = [...data.works.projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setData(prev => ({
      ...prev,
      works: { projects: newProjects }
    }))
  }

  const addProject = () => {
    const newProject: Project = {
      title: "New Project",
      category: "Category",
      description: "Description",
      image: "https://via.placeholder.com/400x300",
      images: [],
      technologies: [],
      features: [],
      liveUrl: "",
      githubUrl: ""
    }
    setData(prev => ({
      ...prev,
      works: { projects: [...prev.works.projects, newProject] }
    }))
  }

  const deleteProject = (index: number) => {
    const newProjects = data.works.projects.filter((_, i) => i !== index)
    setData(prev => ({
      ...prev,
      works: { projects: newProjects }
    }))
  }

  const updateContact = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        info: { ...prev.contact.info, [field]: value }
      }
    }))
  }

  const addSocialLink = () => {
    setData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        social: [...prev.contact.social, { platform: '', url: '' }]
      }
    }))
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        social: prev.contact.social.map((social, i) =>
          i === index ? { ...social, [field]: value } : social
        )
      }
    }))
  }

  const removeSocialLink = (index: number) => {
    setData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        social: prev.contact.social.filter((_, i) => i !== index)
      }
    }))
  }


  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all data to defaults? This will delete all your customizations.')) {
      setData(defaultData)
      localStorage.setItem('portfolioData', JSON.stringify(defaultData))
      window.dispatchEvent(new CustomEvent('portfolioDataUpdate'))
      alert('Data reset to defaults successfully!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark text-white pt-20 p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-gray">Verifying session...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background-dark text-white pt-20 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Portfolio Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={resetToDefaults}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={saveData}
              className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(['home', 'about', 'works', 'contact', 'resume'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-background-medium text-text-gray hover:bg-background-light'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6 text-primary font-display">Home Page</h2>

            {/* Hero Section */}
            <div className="glassmorphism rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Hero Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={data.home.hero.name}
                  onChange={(e) => updateHomeHero('name', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={data.home.hero.title}
                  onChange={(e) => updateHomeHero('title', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={data.home.hero.tagline}
                  onChange={(e) => updateHomeHero('tagline', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white col-span-2"
                  placeholder="Tagline"
                />
                <input
                  type="text"
                  value={data.home.hero.ctaText}
                  onChange={(e) => updateHomeHero('ctaText', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                  placeholder="CTA Text"
                />
                <input
                  type="text"
                  value={data.home.hero.profileImage}
                  onChange={(e) => updateHomeHero('profileImage', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Profile Image URL"
                />
                <input
                  type="text"
                  value={data.home.hero.backgroundImage}
                  onChange={(e) => updateHomeHero('backgroundImage', e.target.value)}
                  className="bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Background Image URL"
                />
              </div>
            </div>

            {/* Cards */}
            <div className="glassmorphism rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Portfolio Cards</h3>
                <button
                  onClick={addCard}
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </button>
              </div>
              <div className="space-y-4">
                {data.home.cards.map((card, index) => (
                  <div key={card.id} className="bg-background-medium rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <select
                        value={card.type}
                        onChange={(e) => updateCard(card.id, 'type', e.target.value)}
                        className="bg-background-dark border border-primary/20 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="profile">Profile</option>
                        <option value="tech-stack">Tech Stack</option>
                        <option value="credentials">Credentials</option>
                        <option value="projects">Projects</option>
                        <option value="services">Services</option>
                        <option value="profiles">Profiles</option>
                      </select>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                      className="w-full bg-background-dark border border-primary/20 rounded px-3 py-2 text-white mb-2"
                      placeholder="Card Title"
                    />
                    <textarea
                      value={card.content || ''}
                      onChange={(e) => updateCard(card.id, 'content', e.target.value)}
                      className="w-full bg-background-dark border border-primary/20 rounded px-3 py-2 text-white"
                      placeholder="Card Content"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.home.stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => updateStat(index, 'number', e.target.value)}
                      className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                      placeholder="Number"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                      placeholder="Label"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6 text-primary font-display">About Page</h2>
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Profile</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={data.about.profile.name}
                  onChange={(e) => updateAbout('profile', 'name', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Name"
                />
                <textarea
                  value={data.about.profile.bio}
                  onChange={(e) => updateAbout('profile', 'bio', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Bio"
                  rows={4}
                />
                <input
                  type="text"
                  value={data.about.profile.image}
                  onChange={(e) => updateAbout('profile', 'image', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Profile Image URL"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Works Tab */}
        {activeTab === 'works' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary font-display">Manage Projects</h2>
              <button
                onClick={addProject}
                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Project
              </button>
            </div>
            
            <div className="space-y-6">
              {data.works.projects.map((project, index) => (
                <div key={index} className="glassmorphism rounded-2xl p-6 border border-primary/10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">Project #{index + 1}: {project.title}</h3>
                    <button
                      onClick={() => deleteProject(index)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">Project Title</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="e.g. E-commerce Platform"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">Category</label>
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) => updateProject(index, 'category', e.target.value)}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="e.g. Full-Stack Development"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <label className="text-sm text-text-gray">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                      rows={3}
                      placeholder="What did you build?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">Cover Image URL</label>
                      <input
                        type="text"
                        value={project.image}
                        onChange={(e) => updateProject(index, 'image', e.target.value)}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="/images/project.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={project.technologies.join(', ')}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="React, Next.js, Tailwind"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">Live Demo URL</label>
                      <input
                        type="url"
                        value={project.liveUrl}
                        onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="https://my-app.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-gray">GitHub URL</label>
                      <input
                        type="url"
                        value={project.githubUrl}
                        onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                        className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-2 text-white"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {data.works.projects.length === 0 && (
                <div className="text-center py-12 glassmorphism rounded-2xl border border-dashed border-primary/20">
                  <p className="text-text-gray">No projects added yet. Get started by clicking the button above!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6 text-primary font-display">Contact Page</h2>
            
            <div className="glassmorphism rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  value={data.contact.info.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  value={data.contact.info.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={data.contact.info.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Location"
                />
              </div>
            </div>

            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Social Media Links</h3>
                <button
                  onClick={addSocialLink}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
                >
                  Add Link
                </button>
              </div>
              <div className="space-y-4">
                {data.contact.social.map((social, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <select
                      value={social.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="bg-background-medium border border-primary/20 rounded px-3 py-2 text-white flex-1"
                    >
                      <option value="">Select Platform</option>
                      <option value="GitHub">GitHub</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Website">Website</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                    </select>
                    <input
                      type="url"
                      value={social.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="bg-background-medium border border-primary/20 rounded px-3 py-2 text-white flex-1"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6 text-primary font-display">Resume Management</h2>
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Resume Upload</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  value={data.resume?.url || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    resume: { ...prev.resume, url: e.target.value, filename: 'Dylan_Sparks_Resume.pdf' }
                  }))}
                  className="w-full bg-background-medium border border-primary/20 rounded px-3 py-2 text-white"
                  placeholder="Resume URL (e.g., Google Drive link, Dropbox link, etc.)"
                />
                <p className="text-sm text-text-gray">
                  Upload your resume to Google Drive, Dropbox, or any file hosting service and paste the shareable link here.
                </p>
                {data.resume?.url && (
                  <div className="mt-4 p-4 bg-background-medium rounded-lg">
                    <p className="text-green-400 text-sm">Resume uploaded successfully!</p>
                    <p className="text-text-gray text-sm mt-1">Users can download: {data.resume.filename}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}