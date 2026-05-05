'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glassmorphism rounded-2xl p-8 shadow-2xl border border-primary/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Admin Portal</h1>
            <p className="text-text-gray">Secure dashboard access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-gray block ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background-medium/50 border border-primary/20 rounded-xl px-10 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-gray block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background-medium/50 border border-primary/20 rounded-xl px-10 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray/50 hover:text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Connect Securely
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-text-gray/50 text-xs text-primary">
          Hint: Check your credentials and try again.
        </p>
      </motion.div>
    </div>
  )
}
