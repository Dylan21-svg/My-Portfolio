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
    period: "September 2023 - Present",
    title: "Lead Software Engineer & COO | SAMITECH Corporation",
    company: "SAMITECH Corporation",
    description: "Technical Leadership (Lead Software Engineer): Engineered decoupled asynchronous event pipelines and multi-tenant database architectures using Python, FastAPI, and Docker, reducing latency by >60%. Executive Operations & Product Strategy (COO): Established standardized DevOps CI/CD pipelines and restructured developer sprint workflows."
  },
  {
    period: "August 2024 – October 2024",
    title: "Full Stack Backend Developer",
    company: "NEXORA / Freelance",
    description: "Designed and deployed modular backend architectures and standardized REST APIs for 5+ client applications across fintech, logistics, and edtech."
  },
  {
    period: "June 2025 – November 2025",
    title: "Software Engineer Intern",
    company: "Revival Company Ltd.",
    description: "Standardized internal API integration layers and authored comprehensive unit and integration test suites, decreasing system regressions and stabilizing uptime."
  }
]

export const education: Education[] = [
  {
    period: "October 2024 - June 2026",
    degree: "Higher National Diploma in Software Engineering",
    institution: "College of Technology / University of Buea",
    description: "Key Achievements & Applied Focus: Specialized in Distributed Systems, Relational Database Theory, and Network Protocols. Applied advanced concurrency models and algorithmic optimization techniques to solve real-world system architecture problems."
  },
  {
    period: "October 2022 - December 2026",
    degree: "Bachelor of Science in Computer Science",
    institution: "College of Technology / University of Buea",
    description: "Key Achievements & Applied Focus: Focused on Computer Architecture, Operating Systems, and Concurrent Programming. Built a strong theoretical and practical foundation in memory management and high-performance system design."
  }
]

export const projects: Project[] = []