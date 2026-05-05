'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleHoverStart = () => setIsHovering(true)
    const handleHoverEnd = () => setIsHovering(false)

    window.addEventListener('mousemove', moveCursor)

    const interactiveElements = document.querySelectorAll('a, button, [role="button"]')
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart)
      el.addEventListener('mouseleave', handleHoverEnd)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart)
        el.removeEventListener('mouseleave', handleHoverEnd)
      })
    }
  }, [cursorX, cursorY])

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
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? 'rgba(31, 181, 173, 0.3)' : 'transparent',
      }}
    >
      <div className="w-1 h-1 bg-primary rounded-full" />
    </motion.div>
  )
}
