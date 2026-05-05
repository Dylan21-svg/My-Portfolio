'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Home, User, Briefcase, Mail, X, Command } from 'lucide-react'
import { useRouter } from 'next/navigation'

const items = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: User, label: 'About', href: '/about' },
  { icon: Briefcase, label: 'Works', href: '/works' },
  { icon: FileText, label: 'Blog', href: '/blog' },
  { icon: FileText, label: 'Resume', href: '/resume' },
  { icon: Mail, label: 'Contact', href: '/contact' },
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <>
      {/* Keyboard Shortcut Hint (Desktop Only) */}
      <div className="fixed bottom-8 right-8 z-40 hidden md:block">
        <button
          onClick={toggle}
          className="glassmorphism p-3 rounded-full hover:shadow-teal-glow transition-all duration-300 flex items-center gap-2 group"
        >
          <Command className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-text-gray">K</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl glassmorphism rounded-2xl overflow-hidden shadow-2xl border-primary/30"
            >
              <div className="flex items-center p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-primary mr-3" />
                <input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent border-none outline-none text-white placeholder-text-gray/50 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-text-gray hover:text-white" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center p-3 rounded-xl hover:bg-primary/10 transition-colors group"
                    >
                      <item.icon className="w-5 h-5 text-text-gray group-hover:text-primary mr-4" />
                      <span className="text-white font-medium">{item.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-text-gray">
                    No results found for &quot;{query}&quot;
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-white/10 flex justify-between items-center text-[10px] text-text-gray font-bold tracking-widest uppercase">
                <span>Select with Enter</span>
                <div className="flex gap-2">
                  <span className="bg-white/5 px-1 rounded">ESC to close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
