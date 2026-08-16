'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // When pathname or search params change, complete the progress bar
  useEffect(() => {
    setProgress(100)
    const timeout = setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, 250)
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  useEffect(() => {
    // Intercept internal link clicks to start progress bar immediately
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, mailto, tel, anchor hashes, downloads, and new tabs
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // Check if navigating to a different page or query
      const currentUrl = `${window.location.pathname}${window.location.search}`
      const targetUrl = new URL(href, window.location.origin)
      const targetPath = `${targetUrl.pathname}${targetUrl.search}`

      if (targetPath !== currentUrl) {
        setIsVisible(true)
        setProgress(25)
      }
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      setIsVisible(true)
      setProgress(35)
    }

    document.addEventListener('click', handleLinkClick, { capture: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Trickle effect while loading
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        // Slower increment as it approaches 90%
        const diff = (95 - prev) * 0.15
        return Math.min(prev + diff, 90)
      })
    }, 120)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none bg-transparent">
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: `${progress}%`, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              width: { type: 'spring', damping: 25, stiffness: 120 },
              opacity: { duration: 0.2 },
            }}
            className="h-full bg-gradient-to-r from-primary via-teal-400 to-secondary shadow-[0_0_10px_#1a7a7a,0_0_5px_#2dd4bf]"
          />
        </div>
      )}
    </AnimatePresence>
  )
}

export default function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}

