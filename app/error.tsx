'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error for debugging
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <AlertTriangle className="w-16 h-16 text-red-400" />
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-lg text-text-gray mb-4">
            An unexpected error occurred. Don&apos;t worry, our team has been notified.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-8 text-left"
            >
              <p className="text-red-400 font-mono text-sm break-words">{error.message}</p>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-background-medium hover:bg-background-light text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
