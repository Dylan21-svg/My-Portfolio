'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Globe, Instagram, Facebook, Youtube } from 'lucide-react'
import ContactForm from '@/components/ContactForm'
import { usePortfolioData } from '@/lib/data'

const getSocialIcon = (platform: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'GitHub': Github,
    'LinkedIn': Linkedin,
    'Twitter': Twitter,
    'Instagram': Instagram,
    'Facebook': Facebook,
    'YouTube': Youtube,
    'Website': Globe,
    'Email': Mail,
    'Phone': Phone
  }
  return iconMap[platform] || Globe
}

export default function Contact() {
  const data = usePortfolioData()

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Sidebar - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-primary mb-8 font-display">CONTACT INFO</h2>

            {/* Email */}
            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">MAIL US</h3>
              </div>
              <p className="text-text-gray">{data.contact.info.email}</p>
            </div>

            {/* Phone */}
            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">CONTACT US</h3>
              </div>
              <p className="text-text-gray">{data.contact.info.phone}</p>
            </div>

            {/* Location */}
            <div className="glassmorphism rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">LOCATION</h3>
              </div>
              <p className="text-text-gray">{data.contact.info.location}</p>
            </div>

            {/* Social */}
            <div className="glassmorphism rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">SOCIAL INFO</h3>
              <div className="flex space-x-4">
                {data.contact.social.map((social) => {
                  const IconComponent = getSocialIcon(social.platform)
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8 font-display">
              Let&apos;s work <span className="text-primary">together.</span>
            </h2>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </div>
  )
}