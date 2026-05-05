import { Project, Skill, Experience, Education } from './types'

export const skills: Skill[] = [
  { name: "Python", level: 95 },
  { name: "Django", level: 90 },
  { name: "FastAPI", level: 95 },
  { name: "Flask", level: 85 },
  { name: "PostgreSQL", level: 90 },
  { name: "MongoDB", level: 85 },
  { name: "Redis", level: 85 },
  { name: "Docker", level: 85 },
  { name: "Kubernetes", level: 75 },
  { name: "Celery", level: 90 },
  { name: "RabbitMQ", level: 80 },
  { name: "Nginx", level: 80 }
]

export const experience: Experience[] = [
  {
    period: "2023 - Present",
    title: "Chief Operating Officer & Software Engineer",
    company: "SAMITECH Corporation",
    description: "Bridging the gap between technical execution and operational strategy while building high-impact, scalable solutions."
  }
]

export const education: Education[] = [
  {
    period: "2024 - Present",
    degree: "Higher National Diploma (HND) in Software Engineering",
    institution: "Candidate",
    description: "Advanced study in software architecture, distributed systems, and modern web technologies."
  },
  {
    period: "2022 - 2023",
    degree: "Systems Administrator Certification",
    institution: "Communications Engineering",
    description: "Certification in network management, server maintenance, and IT infrastructure."
  }
]