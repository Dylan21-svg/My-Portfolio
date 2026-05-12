import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SmoothScroll from '@/components/SmoothScroll'
import CustomCursor from '@/components/CustomCursor'
import PageTransition from '@/components/PageTransition'
import CommandPalette from '@/components/CommandPalette'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Che Amah Diland Ngwa - Software Engineer Portfolio',
  description: 'Software Engineer specializing in Backend Development, Python, and scalable distributed systems. Known as Che Amah Diland Ngwa and Dylan Sparks.',
  keywords: ['Che Amah Diland Ngwa', 'Dylan Sparks', 'Software Engineer', 'Backend Developer', 'Python', 'Next.js'],
  authors: [{ name: 'Che Amah Diland Ngwa' }],
  openGraph: {
    title: 'Che Amah Diland Ngwa - Software Engineer Portfolio',
    description: 'Building scalable solutions and innovative applications. Backend specialist in Python and distributed systems.',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a7a7a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} relative`}>
        <div className="noise-overlay" />
        <CustomCursor />
        <CommandPalette />
        <SmoothScroll>
          <Navigation />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  )
}