import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authenticate, unauthorizedResponse } from '@/lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio-data.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Default data structure
const getDefaultData = () => ({
  home: {
    hero: {
      name: 'DYLAN SPARKS',
      title: 'SOFTWARE ENGINEER',
      tagline: 'Building scalable solutions and innovative applications',
      ctaText: 'DOWNLOAD RESUME',
      profileImage: 'https://via.placeholder.com/300x300/1a7a7a/ffffff?text=Profile',
      backgroundImage: 'https://via.placeholder.com/1920x1080/0d4d4d/1a7a7a?text=Hero+Background'
    },
    cards: [
      { id: '1', type: 'profile', title: 'A SOFTWARE ENGINEER', content: 'Dylan Sparks\nSan Francisco, CA' },
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
      name: 'DYLAN SPARKS',
      bio: 'Passionate software engineer with 4+ years of experience in full-stack development. Specialized in React, Next.js, and Node.js. Committed to creating efficient, scalable solutions and delivering exceptional user experiences.',
      image: 'https://via.placeholder.com/200x200/1a7a7a/ffffff?text=Profile'
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
        title: "E-Commerce Platform",
        category: "Full-Stack Development",
        description: "A modern e-commerce solution with real-time inventory management",
        image: "https://via.placeholder.com/400x300/1a7a7a/ffffff?text=E-Commerce",
        images: ["https://via.placeholder.com/800x400/1a7a7a/ffffff?text=E-Commerce+1", "https://via.placeholder.com/800x400/1a7a7a/ffffff?text=E-Commerce+2"],
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
        features: [
          "User authentication and authorization",
          "Real-time inventory tracking",
          "Payment processing with Stripe",
          "Admin dashboard for order management",
          "Responsive design for all devices"
        ],
        liveUrl: "https://example-ecommerce.com",
        githubUrl: "https://github.com/dylansparks/ecommerce-platform"
      },
      {
        title: "Task Management App",
        category: "React Application",
        description: "Collaborative task management with real-time updates",
        image: "https://via.placeholder.com/400x300/1a7a7a/ffffff?text=Task+Manager",
        images: ["https://via.placeholder.com/800x400/1a7a7a/ffffff?text=Task+Manager+1", "https://via.placeholder.com/800x400/1a7a7a/ffffff?text=Task+Manager+2"],
        technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
        features: [
          "Real-time collaboration",
          "Drag and drop task management",
          "Team workspaces",
          "Progress tracking",
          "Mobile responsive"
        ],
        liveUrl: "https://taskmanager-demo.com",
        githubUrl: "https://github.com/dylansparks/task-manager"
      },
      {
        title: "AI-Powered Analytics Dashboard",
        category: "Data Visualization",
        description: "Intelligent analytics platform with predictive insights",
        image: "https://via.placeholder.com/400x300/1a7a7a/ffffff?text=Analytics",
        images: ["https://via.placeholder.com/800x400/1a7a7a/ffffff?text=Analytics+1", "https://via.placeholder.com/800x400/1a7a7a/ffffff?text=Analytics+2"],
        technologies: ["Python", "FastAPI", "React", "D3.js", "TensorFlow"],
        features: [
          "Predictive analytics",
          "Interactive data visualizations",
          "Machine learning insights",
          "Real-time data processing",
          "Custom dashboard builder"
        ],
        liveUrl: "https://analytics-ai.com",
        githubUrl: "https://github.com/dylansparks/ai-analytics"
      }
    ]
  },
  contact: {
    info: {
      email: 'hello@dylansparks.com',
      phone: '+1 (555) 123-4567',
      location: '123 Tech Street, San Francisco, CA 94105'
    },
    social: [
      { platform: 'GitHub', url: 'https://github.com/dylansparks' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/dylansparks' },
      { platform: 'Twitter', url: 'https://twitter.com/dylansparks' }
    ]
  }
})

const readData = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading data file:', error)
  }
  return getDefaultData()
}

const writeData = (data: any) => {
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing data file:', error)
    return false
  }
}

export async function GET() {
  try {
    const data = readData()
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

    const body = await request.json()

    // Basic validation - ensure it's an object
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Merge with defaults to ensure all required properties exist
    const mergedData = { ...getDefaultData(), ...body }

    if (writeData(mergedData)) {
      return NextResponse.json({ success: true, message: 'Data saved successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
