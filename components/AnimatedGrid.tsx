'use client'

import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function AnimatedGrid() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [0.15, 0])

  // Optimization: useMotionValue + useTransform avoids React re-renders on every mouse move
  const translateX = useTransform(mouseX, (x) => (x - 500) * 0.02)
  const translateY = useTransform(mouseY, (y) => (y - 500) * 0.02)

  return (
    <motion.div
      ref={gridRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(31, 181, 173, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(31, 181, 173, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          translateX,
          translateY,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark" />
    </motion.div>
  )
}
