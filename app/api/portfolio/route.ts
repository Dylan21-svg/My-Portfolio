import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import fs from 'fs'
import path from 'path'
import { authenticate, unauthorizedResponse } from '@/lib/auth'
import { kv } from '@vercel/kv'

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio-data.json')
const KV_KEY = 'portfolio_data'

// Ensure data directory exists (for local dev)
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (err) {
      // Ignore directory creation errors in production/readonly environments
    }
  }
}

// Default data structure
const getDefaultData = () => ({
  home: {
    hero: {
      name: 'CHE AMAH DILAND NGWA',
      title: 'SOFTWARE ENGINEER',
      tagline: 'I specialize in backend architecture where speed, security, and scalability converge.',
      ctaText: 'EXPLORE MY WORK',
      profileImage: '/images/D21.jpeg',
      backgroundImage: '/images/dylan.jpg'
    },
    cards: [
      { id: '1', type: 'profile', title: 'A SOFTWARE ENGINEER', content: 'Che Amah Diland Ngwa\nBuea, Cameroon' },
      { id: '2', type: 'tech-stack', title: 'Tech Stack' },
      { id: '3', type: 'credentials', title: 'Credentials', content: 'AWS Certified Developer\nReact Certified' },
      { id: '4', type: 'projects', title: 'Projects' },
      { id: '5', type: 'services', title: 'Services Offering' },
      { id: '6', type: 'profiles', title: 'Profiles' }
    ],
    stats: [
      { number: '04', label: 'YEARS EXPERIENCE' },
      { number: '+125', label: 'CLIENTS WORLDWIDE' },
      { number: '+210', label: 'TOTAL PROJECTS' }
    ]
  },
  about: {
    profile: {
      name: 'CHE AMAH DILAND NGWA',
      bio: 'Software Engineer and COO at SAMITECH Corporation, focused on building high-impact, scalable solutions.',
      image: '/images/D21.jpeg'
    },
    experience: [
      {
        period: "2022 - Present",
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        description: "Leading development of scalable web applications serving 100k+ users"
      },
      {
        period: "2020 - 2022",
        title: "Full Stack Developer",
        company: "StartupXYZ",
        description: "Built MVPs for 5+ startups, focusing on React and Node.js stack"
      },
      {
        period: "2018 - 2020",
        title: "Junior Developer",
        company: "WebSolutions Ltd.",
        description: "Developed responsive websites and maintained legacy systems"
      }
    ],
    education: [
      {
        period: "2016 - 2020",
        degree: "Bachelor of Computer Science",
        institution: "University of Technology",
        description: "Focus on software engineering and data structures"
      },
      {
        period: "2014 - 2016",
        degree: "Associate Degree in IT",
        institution: "Community College",
        description: "Foundation in programming and web development"
      }
    ]
  },
  works: {
    projects: [
      {
        title: "CodeForge",
        category: "Backend Development",
        description: "A resilient educational platform designed for low-connectivity environments with an optimized data sync engine.",
        image: "/images/D1.jpeg",
        images: ["/images/D1.jpeg", "/images/D2.jpeg", "/images/D3.jpeg"],
        technologies: ["Python", "FastAPI", "PostgreSQL", "Service Workers"],
        features: [
          "Priority-Queue data synchronization protocol",
          "Instant offline code execution and feedback",
          "Reduced data overhead by 98% for remote users"
        ],
        liveUrl: "https://codeforge.dev",
        githubUrl: "https://github.com/Dylan21-svg/codeforge"
      },
      {
        title: "RevenueArchitect AI",
        category: "SaaS Development",
        description: "A conversion optimization tool that uses machine learning to analyze revenue leaks and automate growth workflows.",
        image: "/images/D2.jpeg",
        images: ["/images/D2.jpeg", "/images/D3.jpeg", "/images/D4.jpeg"],
        technologies: ["Python", "Machine Learning", "Redis", "Next.js"],
        features: [
          "Automated conversion rate analysis",
          "Real-time revenue tracking and forecasting",
          "Scalable background processing with Celery"
        ],
        liveUrl: "https://revenuearchitect.ai",
        githubUrl: "https://github.com/Dylan21-svg/revenue-architect"
      },
      {
        title: "VELORA Store",
        category: "High-Scale E-Commerce",
        description: "A modern e-commerce backend built for high-concurrency environments and real-time inventory management.",
        image: "/images/D3.jpeg",
        images: ["/images/D3.jpeg", "/images/D4.jpeg", "/images/D1.jpeg"],
        technologies: ["Flask", "Celery", "RabbitMQ", "PostgreSQL"],
        features: [
          "Real-time inventory synchronization",
          "Distributed task management",
          "Automated audit logging and monitoring"
        ],
        liveUrl: "https://velora-store.com",
        githubUrl: "https://github.com/Dylan21-svg/velora-store"
      }
    ]
  },
  contact: {
    info: {
      email: 'ngwadiland68@gmail.com',
      phone: '+237 672 344 814',
      location: 'Buea, Cameroon'
    },
    social: [
      { platform: 'GitHub', url: 'https://github.com/Dylan21-svg' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/dylansparks' },
      { platform: 'Twitter', url: 'https://twitter.com/dylansparks' }
    ]
  },
  resume: {
    url: '/resume.pdf',
    filename: 'Che_Dylan_Backend_Resume.pdf'
  },
  resumes: [
    {
      id: 'resume-primary',
      title: 'Primary Technical Resume',
      label: 'Senior Backend & Distributed Systems Engineer',
      filename: 'Che_Dylan_Backend_Resume.pdf',
      fileSize: '142 KB',
      fileType: 'application/pdf',
      url: '/resume.pdf',
      uploadedAt: '2026-08-15',
      description: 'Focused on Python, FastAPI, distributed task queues, database concurrency, and high-scale architecture.'
    },
    {
      id: 'resume-secondary',
      title: 'Full-Stack & Solutions Resume',
      label: 'Full-Stack & Systems Solutions Architect',
      filename: 'Che_Dylan_FullStack_Resume.pdf',
      fileSize: '158 KB',
      fileType: 'application/pdf',
      url: '/resume.pdf',
      uploadedAt: '2026-08-15',
      description: 'Focused on full-stack architecture, Next.js/React frontend integration, REST/WebSocket APIs, and cloud deployments.'
    }
  ]
})

// MOCKED in-memory store for environments without external KV credentials
const memoryStore = new Map<string, any>()

const readData = async () => {
  // Check memory store first
  if (memoryStore.has(KV_KEY)) {
    return memoryStore.get(KV_KEY)
  }

  // Try KV if available
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const kvData = await kv.get(KV_KEY)
      if (kvData) {
        memoryStore.set(KV_KEY, kvData)
        return kvData
      }
    }
  } catch (error) {
    console.warn('Vercel KV not reachable — using local/memory storage:', error)
  }

  // Fallback to local file
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      const parsed = JSON.parse(data)
      memoryStore.set(KV_KEY, parsed)
      return parsed
    }
  } catch (error) {
    console.error('Error reading data file:', error)
  }

  const defaultVal = getDefaultData()
  memoryStore.set(KV_KEY, defaultVal)
  return defaultVal
}

const writeData = async (data: any) => {
  // Always update memory store
  memoryStore.set(KV_KEY, data)
  let success = true

  // Try saving to KV if configured
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(KV_KEY, data)
    }
  } catch (error) {
    console.warn('Vercel KV not writable — saved to in-memory store:', error)
  }

  // Try saving to local file
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.warn('Local file write skipped (in-memory updated):', error)
  }

  return success
}

export async function GET() {
  try {
    const data = await readData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error)
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await authenticate(request)
    if (!isAuthenticated) {
      return unauthorizedResponse()
    }
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({ error: 'Vercel KV not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.' }, { status: 500 })
    }

    const body = await request.json()

    // Basic validation - ensure it's an object
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Merge with defaults to ensure all required properties exist
    const mergedData = { ...getDefaultData(), ...body }

    if (await writeData(mergedData)) {
      return NextResponse.json({ success: true, message: 'Data saved successfully' })
    } else {
      return NextResponse.json({
        error: 'Failed to save data. Please ensure Vercel KV is configured for production persistence.',
        details: 'Check server logs for more information.'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
