'use client'

import { motion } from 'framer-motion'
import { Download, FileText, Eye } from 'lucide-react'
import { usePortfolioData } from '@/lib/data'

export default function Resume() {
  const data = usePortfolioData()

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4 font-display">
              MY RESUME
            </h1>
            <p className="text-lg text-text-gray">
              Download or view my professional resume
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism rounded-2xl p-8 text-center"
          >
            <div className="mb-8">
              <FileText className="w-24 h-24 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">
                Dylan Sparks - Resume
              </h2>
              <p className="text-text-gray mb-6">
                Software Engineer | Full-Stack Developer
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={data.resume?.url || "#"}
                download="Dylan_Sparks_Resume.pdf"
                className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
              <button
                onClick={() => window.open(data.resume?.url || "#", '_blank')}
                className="bg-background-medium hover:bg-background-light text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Resume
              </button>
            </div>

            {!data.resume?.url && (
              <p className="text-red-400 text-sm mt-4">
                Resume not uploaded yet. Please upload via admin panel.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}