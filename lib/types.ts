export interface ProjectMetric {
  label: string
  value: string
  change?: string
}

export interface ProjectEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  requestPayload?: string
  responsePayload: string
  status: number
  latency: string
}

export interface ArchitectureNode {
  id: string
  label: string
  type: 'client' | 'gateway' | 'cache' | 'service' | 'queue' | 'database' | 'storage' | 'worker'
  tech: string
  description: string
  throughput?: string
  latency?: string
  connections: string[] // target node IDs
}

export interface SchemaTableColumn {
  name: string
  type: string
  constraints?: string
  description?: string
}

export interface SchemaTable {
  tableName: string
  description: string
  columns: SchemaTableColumn[]
  indexes?: string[]
}

export interface ConcurrencyTradeoff {
  approach: string
  status: 'chosen' | 'rejected'
  reason: string
  benefits: string[]
  tradeoffs: string[]
}

export interface PostMortemLesson {
  incident: string
  impact: string
  rootCause: string
  resolution: string
  takeaway: string
}

export interface Project {
  id?: string
  title: string
  category: string
  tagline?: string
  role?: string
  timeline?: string
  description: string
  challenge?: string
  solution?: string
  architecture?: string
  metrics?: ProjectMetric[]
  image: string
  images: string[]
  technologies: string[]
  features: string[]
  endpoints?: ProjectEndpoint[]
  architectureNodes?: ArchitectureNode[]
  schemaTables?: SchemaTable[]
  concurrencyTradeoffs?: ConcurrencyTradeoff[]
  postMortem?: PostMortemLesson[]
  architectureDiagram?: string
  liveUrl?: string
  githubUrl?: string
  status?: 'Production' | 'Live Beta' | 'Open Source' | 'Enterprise'
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
  skills?: string[]
  highlights?: string[]
}

export interface Education {
  period: string
  degree: string
  institution: string
  description: string
}

export interface Certification {
  name: string
  issuer: string
  year: string
  credentialId?: string
}

export interface ResumeDocument {
  id: string
  title: string
  label?: string
  filename: string
  fileSize?: string
  fileType?: string
  url: string
  uploadedAt?: string
  description?: string
}
