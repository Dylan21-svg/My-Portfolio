'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-background-dark flex items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
      />
    </div>
  )
}