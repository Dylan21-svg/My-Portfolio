'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(true)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if device supports hover/fine pointer
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!hasFinePointer) {
      setIsTouchDevice(true)
      return
    }
    setIsTouchDevice(false)

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.closest('a, button, [role="button"], input, textarea, select')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, isVisible])

  if (isTouchDevice || !isVisible) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        left: -16,
        top: -16,
      }}
      animate={{
        scale: isHovering ? 2.2 : 1,
        backgroundColor: isHovering ? 'rgba(31, 181, 173, 0.3)' : 'rgba(31, 181, 173, 0)',
      }}
    >
      <div className="w-1 h-1 bg-primary rounded-full" />
    </motion.div>
  )
}
