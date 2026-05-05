export interface Project {
  title: string
  category: string
  description: string
  image: string
  images: string[]
  technologies: string[]
  features: string[]
  liveUrl: string
  githubUrl: string
}

export interface Skill {
  name: string
  level: number
}

export interface Experience {
  period: string
  title: string
  company: string
  description: string
}

export interface Education {
  period: string
  degree: string
  institution: string
  description: string
}
