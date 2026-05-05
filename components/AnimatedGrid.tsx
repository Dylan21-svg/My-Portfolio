'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function AnimatedGrid() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [0.15, 0])

  return (
    <motion.div
      ref={gridRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(31, 181, 173, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(31, 181, 173, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          transform: `translate(${(mousePosition.x - 500) * 0.02}px, ${(mousePosition.y - 500) * 0.02}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark" />
    </motion.div>
  )
}
