'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { sendContactEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await sendContactEmail(data)
      
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message,
        })
        reset()
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message,
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <input
          {...register('name')}
          type="text"
          placeholder="Name *"
          className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-3 text-white placeholder-text-gray focus:border-primary focus:outline-none transition-colors"
          aria-label="Your name"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email *"
          className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-3 text-white placeholder-text-gray focus:border-primary focus:outline-none transition-colors"
          aria-label="Your email"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register('subject')}
          type="text"
          placeholder="Subject *"
          className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-3 text-white placeholder-text-gray focus:border-primary focus:outline-none transition-colors"
          aria-label="Message subject"
        />
        {errors.subject && (
          <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register('message')}
          rows={6}
          placeholder="Message *"
          className="w-full bg-background-medium border border-primary/20 rounded-lg px-4 py-3 text-white placeholder-text-gray focus:border-primary focus:outline-none transition-colors resize-none"
          aria-label="Your message"
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      {submitStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg text-center font-medium ${
            submitStatus.type === 'success'
              ? 'bg-green-400/20 text-green-400 border border-green-400/50'
              : 'bg-red-400/20 text-red-400 border border-red-400/50'
          }`}
        >
          {submitStatus.message}
        </motion.div>
      )}
    </motion.form>
  )
}
