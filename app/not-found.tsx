'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl lg:text-8xl font-bold text-primary mb-4 font-display">
            404
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-text-gray mb-8 max-w-2xl mx-auto">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
