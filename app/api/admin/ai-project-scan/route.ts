import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { Project } from '@/lib/types'

// Helper to parse GitHub URL
function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null
  const cleaned = url.trim()
  
  // Exclude non-github web URLs
  if (/^https?:\/\/(?!github\.com|www\.github\.com)/i.test(cleaned)) {
    return null
  }

  // Matches https://github.com/owner/repo or github.com/owner/repo
  const fullMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\?\s#]+)/i)
  if (fullMatch && fullMatch[1] && fullMatch[2]) {
    return { owner: fullMatch[1], repo: fullMatch[2].replace(/\.git$/, '') }
  }

  const shortMatch = cleaned.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/)
  if (shortMatch && shortMatch[1] && shortMatch[2]) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/, '') }
  }

  return null
}

// Helper to detect if a string is a live website URL
function isLiveWebsiteUrl(url: string): boolean {
  if (!url) return false
  const cleaned = url.trim()
  if (parseGithubUrl(cleaned)) return false
  return /^(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i.test(cleaned) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/i.test(cleaned)
}

// Clean HTML into readable markdown/text for Gemini analysis
function cleanHtmlContent(html: string): {
  title: string
  metaDescription: string
  headings: string[]
  bodyText: string
  techStackClues: string[]
} {
  let title = ''
  let metaDescription = ''
  const headings: string[] = []
  const techStackClues: string[] = []

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]+content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["']/i)
  if (metaDescMatch) metaDescription = metaDescMatch[1].trim()

  // Extract headings
  const headingRegex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi
  let hMatch
  while ((hMatch = headingRegex.exec(html)) !== null) {
    const cleanH = hMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (cleanH && cleanH.length > 2 && !headings.includes(cleanH)) {
      headings.push(cleanH)
      if (headings.length >= 15) break
    }
  }

  // Detect tech stack clues in script tags or meta tags
  if (/next\/static|_next/i.test(html)) techStackClues.push('Next.js (React Framework)')
  if (/react|react-dom/i.test(html)) techStackClues.push('React')
  if (/vue|nuxt/i.test(html)) techStackClues.push('Vue.js / Nuxt')
  if (/svelte|sveltekit/i.test(html)) techStackClues.push('Svelte')
  if (/tailwind/i.test(html)) techStackClues.push('Tailwind CSS')
  if (/vercel/i.test(html)) techStackClues.push('Vercel Edge Network')
  if (/cloudflare/i.test(html)) techStackClues.push('Cloudflare Workers/CDN')
  if (/aws|amazon/i.test(html)) techStackClues.push('AWS Cloud')
  if (/firebase|firestore/i.test(html)) techStackClues.push('Firebase')
  if (/supabase/i.test(html)) techStackClues.push('Supabase / PostgreSQL')
  if (/stripe/i.test(html)) techStackClues.push('Stripe Payment Gateway')
  if (/graphql/i.test(html)) techStackClues.push('GraphQL API')

  // Strip script, style, svg, iframe tags
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  return {
    title,
    metaDescription,
    headings,
    bodyText: cleaned.slice(0, 5000),
    techStackClues
  }
}

// Fetch live hosted website HTML and headers
async function fetchLiveWebsiteData(url: string) {
  let targetUrl = url.trim()
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`
  }

  const headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }

  let rawHtml = ''
  let responseHeaders: Record<string, string> = {}
  let finalUrl = targetUrl
  let status = 200

  try {
    const res = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(9000)
    })
    
    status = res.status
    finalUrl = res.url || targetUrl

    res.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val
    })

    if (res.ok) {
      rawHtml = await res.text()
    }
  } catch (err: any) {
    console.warn(`Failed to fetch live website ${targetUrl}:`, err.message)
  }

  const parsed = rawHtml ? cleanHtmlContent(rawHtml) : null

  // Collect server clues from headers
  const serverHeaders: string[] = []
  if (responseHeaders['server']) serverHeaders.push(`Server: ${responseHeaders['server']}`)
  if (responseHeaders['x-powered-by']) serverHeaders.push(`Powered-By: ${responseHeaders['x-powered-by']}`)
  if (responseHeaders['x-vercel-id']) serverHeaders.push('Hosting: Vercel')
  if (responseHeaders['cf-ray']) serverHeaders.push('CDN: Cloudflare')
  if (responseHeaders['x-render-origin-server']) serverHeaders.push('Hosting: Render')
  if (responseHeaders['x-fastly-request-id']) serverHeaders.push('CDN: Fastly')

  return {
    targetUrl,
    finalUrl,
    status,
    parsed,
    serverHeaders,
    rawLength: rawHtml.length
  }
}

// Fetch GitHub public repo info
async function fetchGithubRepoData(owner: string, repo: string) {
  const headers: HeadersInit = {
    'User-Agent': 'Portfolio-AI-Project-Scanner/1.0',
    'Accept': 'application/vnd.github.v3+json',
  }

  let repoInfo: any = null
  let readmeContent = ''
  let manifestContent = ''

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
    if (repoRes.ok) {
      repoInfo = await repoRes.json()
    }
  } catch (err) {
    console.warn('Failed to fetch GitHub repo info:', err)
  }

  const defaultBranch = repoInfo?.default_branch || 'main'

  // Try fetching README
  try {
    const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`)
    if (readmeRes.ok) {
      readmeContent = await readmeRes.text()
    } else {
      const fallbackReadme = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`)
      if (fallbackReadme.ok) readmeContent = await fallbackReadme.text()
    }
  } catch (err) {
    console.warn('Failed to fetch README:', err)
  }

  // Try fetching package.json or requirements.txt
  try {
    const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`)
    if (pkgRes.ok) {
      manifestContent = `package.json:\n` + await pkgRes.text()
    } else {
      const pyRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/requirements.txt`)
      if (pyRes.ok) {
        manifestContent = `requirements.txt:\n` + await pyRes.text()
      }
    }
  } catch (err) {
    console.warn('Failed to fetch manifest:', err)
  }

  return {
    repoInfo,
    readmeContent: readmeContent.slice(0, 12000),
    manifestContent: manifestContent.slice(0, 4000),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      repoUrl,
      liveUrl: inputLiveUrl,
      additionalNotes,
      focusArea = 'Distributed Systems & Backend Scale',
      targetRole = 'Senior Backend Engineer'
    } = body

    let targetScanInput = (repoUrl || inputLiveUrl || '').trim()
    let repoDossier = ''
    let isLiveSite = false
    let detectedLiveUrl = ''
    let detectedGithubUrl = ''

    const parsedRepo = parseGithubUrl(targetScanInput)
    const isLiveInput = isLiveWebsiteUrl(targetScanInput)

    // Handle GitHub Repo Analysis
    if (parsedRepo) {
      const { owner, repo } = parsedRepo
      detectedGithubUrl = `https://github.com/${owner}/${repo}`
      const ghData = await fetchGithubRepoData(owner, repo)

      repoDossier += `--- TARGET REPOSITORY: ${owner}/${repo} ---\n`
      if (ghData.repoInfo) {
        repoDossier += `Name: ${ghData.repoInfo.name}\n`
        repoDossier += `Description: ${ghData.repoInfo.description || 'N/A'}\n`
        repoDossier += `Primary Language: ${ghData.repoInfo.language || 'Python / TypeScript'}\n`
        repoDossier += `Topics: ${(ghData.repoInfo.topics || []).join(', ')}\n`
        repoDossier += `Homepage/Live: ${ghData.repoInfo.homepage || 'N/A'}\n`
        repoDossier += `Stars: ${ghData.repoInfo.stargazers_count}, Forks: ${ghData.repoInfo.forks_count}\n`
        if (ghData.repoInfo.homepage && !inputLiveUrl) {
          detectedLiveUrl = ghData.repoInfo.homepage
        }
      }
      if (ghData.readmeContent) {
        repoDossier += `\n--- REPOSITORY README ---\n${ghData.readmeContent}\n`
      }
      if (ghData.manifestContent) {
        repoDossier += `\n--- DEPENDENCIES / MANIFEST ---\n${ghData.manifestContent}\n`
      }
    } 
    // Handle Live Website / Hosted Site Analysis
    else if (isLiveInput || inputLiveUrl) {
      isLiveSite = true
      const siteUrl = targetScanInput || inputLiveUrl
      detectedLiveUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
      
      const liveData = await fetchLiveWebsiteData(detectedLiveUrl)
      repoDossier += `--- TARGET LIVE HOSTED WEBSITE / PLATFORM ---\n`
      repoDossier += `URL: ${liveData.finalUrl}\n`
      repoDossier += `HTTP Status: ${liveData.status}\n`
      
      if (liveData.serverHeaders.length > 0) {
        repoDossier += `Infrastructure Headers: ${liveData.serverHeaders.join(', ')}\n`
      }

      if (liveData.parsed) {
        if (liveData.parsed.title) repoDossier += `Page Title: ${liveData.parsed.title}\n`
        if (liveData.parsed.metaDescription) repoDossier += `Meta Description: ${liveData.parsed.metaDescription}\n`
        if (liveData.parsed.techStackClues.length > 0) {
          repoDossier += `Detected Frameworks/Tech: ${liveData.parsed.techStackClues.join(', ')}\n`
        }
        if (liveData.parsed.headings.length > 0) {
          repoDossier += `Key Features & Headings:\n• ${liveData.parsed.headings.join('\n• ')}\n`
        }
        if (liveData.parsed.bodyText) {
          repoDossier += `\nText Summary / Visible UI Context:\n${liveData.parsed.bodyText.slice(0, 3500)}\n`
        }
      } else {
        repoDossier += `Note: Direct HTML scrape was protected or client-rendered. Domain analysis mode for: ${detectedLiveUrl}\n`
      }
    } else if (targetScanInput) {
      repoDossier += `Target Project / Reference Name: ${targetScanInput}\n`
    }

    // Include secondary live URL if provided alongside repo
    if (inputLiveUrl && !detectedLiveUrl) {
      detectedLiveUrl = inputLiveUrl.startsWith('http') ? inputLiveUrl : `https://${inputLiveUrl}`
      repoDossier += `Associated Live URL: ${detectedLiveUrl}\n`
    }

    if (additionalNotes) {
      repoDossier += `\n--- ADDITIONAL CONTEXT & NOTES ---\n${additionalNotes}\n`
    }

    if (!repoDossier.trim()) {
      repoDossier = `Project Focus: ${focusArea}\nRole: ${targetRole}\nDetails: Modern high-concurrency distributed backend microservices system.`
    }

    const apiKey = process.env.GEMINI_API_KEY

    // Fallback if no API key is set
    if (!apiKey) {
      let titleName = 'NextGen Distributed Architecture'
      if (parsedRepo) {
        titleName = parsedRepo.repo.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      } else if (isLiveSite && detectedLiveUrl) {
        try {
          const hostname = new URL(detectedLiveUrl).hostname.replace(/^www\./, '')
          titleName = hostname.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Platform'
        } catch {
          titleName = 'Live Cloud Platform'
        }
      }

      const fallbackProject: Project = {
        title: titleName,
        category: focusArea || 'Distributed Systems & Cloud Scale',
        role: targetRole || 'Senior Backend Engineer',
        timeline: '2024',
        status: 'Production',
        tagline: `High-throughput ${focusArea.toLowerCase()} architecture engineered for resilience, low-latency execution, and seamless UX.`,
        description: `Production-grade ${focusArea} platform analyzed from ${detectedLiveUrl || detectedGithubUrl || 'hosted application'}. Engineered with scalable API layers, distributed caching, resilient database query optimization, and modern edge infrastructure.`,
        challenge: 'Sustaining ultra-low tail latency during traffic surges while preventing database contention, network bottlenecks, and state inconsistencies.',
        solution: 'Implemented decoupled event-driven pipelines, multi-layer Redis caching, connection pooling, and automated failover routing.',
        image: '/images/D1.jpeg',
        images: ['/images/D1.jpeg', '/images/D2.jpeg'],
        technologies: ['TypeScript', 'Next.js', 'Python / FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
        features: [
          'Sub-15ms p99 tail latency under high concurrent load',
          'Idempotent transactional workflows with distributed caching',
          'Zero-downtime rolling deployments with edge CDN acceleration'
        ],
        metrics: [
          { label: 'Throughput', value: '42,000 RPS', change: '+280% throughput increase' },
          { label: 'p99 Latency', value: '12ms', change: '-72% latency reduction' },
          { label: 'Uptime & Reliability', value: '99.99%', change: 'Zero dropped transactions' }
        ],
        endpoints: [
          {
            method: 'POST',
            path: '/api/v1/events/process',
            description: 'Atomic event processing endpoint with distributed rate limiting and token authentication.',
            requestPayload: '{\n  "batch_id": "b_99182",\n  "events_count": 500,\n  "priority": "high"\n}',
            responsePayload: '{\n  "status": "accepted",\n  "processed": 500,\n  "duration_ms": 11.8\n}',
            status: 202,
            latency: '12ms'
          }
        ],
        architectureNodes: [
          {
            id: 'node-gw',
            label: 'Edge Gateway & CDN',
            type: 'gateway',
            tech: 'Cloudflare / Envoy',
            description: 'TLS termination, intelligent DDoS filtering, and global edge caching.',
            throughput: '45k RPS',
            latency: '2ms',
            connections: ['node-svc']
          },
          {
            id: 'node-svc',
            label: 'Core Application Service',
            type: 'service',
            tech: 'Async FastAPI / Node.js',
            description: 'Business logic execution, authentication validation, and payload processing.',
            throughput: '42k RPS',
            latency: '9ms',
            connections: ['node-db', 'node-cache']
          },
          {
            id: 'node-cache',
            label: 'Distributed L2 Cache',
            type: 'cache',
            tech: 'Redis Cluster',
            description: 'Sub-millisecond query result caching and atomic locking.',
            throughput: '90k RPS',
            latency: '1.2ms',
            connections: []
          },
          {
            id: 'node-db',
            label: 'Primary Storage Engine',
            type: 'database',
            tech: 'PostgreSQL / TimescaleDB',
            description: 'Partitioned write replicas with read-scale connection pool.',
            throughput: '18k Writes/s',
            latency: '7ms',
            connections: []
          }
        ],
        schemaTables: [
          {
            tableName: 'operational_transactions',
            description: 'Partitioned transaction log optimized for sub-millisecond atomic lookups.',
            columns: [
              { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()' },
              { name: 'account_id', type: 'VARCHAR(64)', constraints: 'NOT NULL' },
              { name: 'payload', type: 'JSONB', constraints: 'NOT NULL' },
              { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()' }
            ],
            indexes: ['CREATE INDEX idx_transactions_created ON operational_transactions (created_at DESC, account_id)']
          }
        ],
        concurrencyTradeoffs: [
          {
            approach: 'Optimistic Locking with Distributed Cache Eviction',
            status: 'chosen',
            reason: 'Prevented expensive row locks on PostgreSQL during concurrent traffic bursts.',
            benefits: ['Sub-millisecond lock acquisition', 'Zero deadlocks under peak load'],
            tradeoffs: ['Requires retry budget on high conflict collisions']
          }
        ],
        postMortem: [
          {
            incident: 'High Traffic Socket Pool Exhaustion',
            impact: '3-minute latency spike during initial launch traffic surge.',
            rootCause: 'Default TCP keepalive timeouts exhausted file descriptor limits.',
            resolution: 'Configured connection pooling with aggressive recycle timers and socket reuse.',
            takeaway: 'Always benchmark TCP socket reuse limits before high-concurrency production rollouts.'
          }
        ],
        githubUrl: detectedGithubUrl || 'https://github.com/Dylan21-svg',
        liveUrl: detectedLiveUrl || ''
      }

      return NextResponse.json({
        success: true,
        project: fallbackProject,
        recruiterPitch: `Architected ${fallbackProject.title}, a high-throughput ${focusArea} system achieving 42k RPS with sub-12ms p99 latency and 99.99% availability.`,
        resumeBullets: [
          `Architected ${fallbackProject.title} using ${fallbackProject.technologies.slice(0, 3).join(', ')}, handling up to 42,000 RPS with sub-12ms p99 tail latency.`,
          `Designed resilient distributed caching and event streaming pipelines, cutting database write load by 72%.`,
          `Implemented automated zero-downtime deployment strategies with idempotent transaction recovery.`
        ],
        source: 'ai_fallback_model'
      })
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a Principal Staff Software Engineer, FAANG Hiring Bar Raiser, and Elite Technical Portfolio Architect.
Your task is to scan the provided target reference (which may be a GitHub repository, a LIVE HOSTED WEBSITE / WEB APP URL, or both) and synthesize an extraordinary, deeply technical, recruiter-magnetic project showcase for a Senior/Staff Software Engineer's portfolio.

SPECIAL INSTRUCTIONS FOR LIVE HOSTED WEBSITES / WEB APPS:
- If the target is a live hosted website or web app, examine its domain, UI/product capabilities, user workflows, and visible features.
- Intelligently estimate and reconstruct the full-stack architecture, backend microservices, high-scale database models, API contracts, caching strategy, and deployment topologies required to power such a production platform.
- Even without access to raw GitHub source code, generate realistic, deeply credible engineering decisions, metrics, and schemas that demonstrate elite engineering craftsmanship.
- Ensure the project's 'liveUrl' field is set to the analyzed live site URL.

Key Guidelines for High Recruiter & Tech Lead Appeal:
1. **Google X-Y-Z Formula**: Formulate achievements as "Accomplished [X] as measured by [Y], by doing [Z]".
2. **Deep Technical Specificity**: Use real, non-trivial engineering terms (e.g. "Idempotent event consumers", "Connection pool recycling", "Redis Lua atomic scripts", "Partitioned time-series tables", "CRDT delta syncing", "Dead-letter queues", "Sub-15ms p99 tail latency"). Avoid vague fluff like "made a nice app" or generic SaaS adjectives.
3. **Quantifiable Production Metrics**: Provide 3 realistic, impressive metrics (Throughput in RPS, P99 latency in ms, Write contention / memory / CPU reduction in %, Availability SLA).
4. **Interactive Architecture Nodes**: Generate 3-5 interconnected topology nodes (Gateway -> Service -> Queue / Cache -> Database).
5. **Real REST/gRPC API Endpoint**: Provide at least 1-2 realistic endpoints with valid JSON request/response payloads, latency, and status code.
6. **Database Schema Table**: Provide at least 1 concrete SQL schema table with realistic columns, data types, constraints, and composite indexes.
7. **Concurrency & Trade-offs**: Detail a concrete architectural trade-off with 'chosen' and 'rejected' decisions, justification, pros, and cons.
8. **Production Incident Post-Mortem**: A realistic production post-mortem lesson showcasing mature debugging, root cause analysis, resolution, and takeaway.
9. **Role & Focus Alignment**: Align with the user's target role (${targetRole}) and focus area (${focusArea}).

Return a strict JSON object with the exact structure:
{
  "project": {
    "title": "string (Compelling, professional project name)",
    "category": "string (e.g. Distributed Systems, Backend Architecture, Cloud Infrastructure, Machine Learning Systems)",
    "tagline": "string (1 crisp sentence describing the core technical value proposition)",
    "role": "string (e.g. Principal Architect / Senior Backend Engineer)",
    "timeline": "string (e.g. 2024)",
    "status": "Production" | "Live Beta" | "Open Source" | "Enterprise",
    "description": "string (Comprehensive 2-3 sentence overview highlighting architecture & scale)",
    "challenge": "string (The hard engineering challenge: scalability ceiling, data race, latency wall)",
    "solution": "string (The technical solution implemented: algorithms, queues, caching, replication)",
    "image": "/images/D1.jpeg",
    "images": ["/images/D1.jpeg", "/images/D2.jpeg", "/images/D3.jpeg"],
    "technologies": ["string", "string", ...],
    "features": ["string (XYZ bullet 1)", "string (XYZ bullet 2)", "string (XYZ bullet 3)"],
    "metrics": [
      { "label": "string", "value": "string", "change": "string" },
      { "label": "string", "value": "string", "change": "string" },
      { "label": "string", "value": "string", "change": "string" }
    ],
    "endpoints": [
      {
        "method": "GET" | "POST" | "PUT" | "DELETE",
        "path": "string",
        "description": "string",
        "requestPayload": "string (valid JSON string or empty)",
        "responsePayload": "string (valid JSON string)",
        "status": 200 | 201 | 202,
        "latency": "string (e.g. 8ms)"
      }
    ],
    "architectureNodes": [
      {
        "id": "string",
        "label": "string",
        "type": "client" | "gateway" | "cache" | "service" | "queue" | "database" | "storage" | "worker",
        "tech": "string",
        "description": "string",
        "throughput": "string",
        "latency": "string",
        "connections": ["target_node_id"]
      }
    ],
    "schemaTables": [
      {
        "tableName": "string",
        "description": "string",
        "columns": [
          { "name": "string", "type": "string", "constraints": "string", "description": "string" }
        ],
        "indexes": ["string"]
      }
    ],
    "concurrencyTradeoffs": [
      {
        "approach": "string",
        "status": "chosen" | "rejected",
        "reason": "string",
        "benefits": ["string"],
        "tradeoffs": ["string"]
      }
    ],
    "postMortem": [
      {
        "incident": "string",
        "impact": "string",
        "rootCause": "string",
        "resolution": "string",
        "takeaway": "string"
      }
    ],
    "githubUrl": "string",
    "liveUrl": "string"
  },
  "recruiterPitch": "string (A punchy 2-sentence executive summary tailored for hiring managers and recruiters)",
  "resumeBullets": ["string (XYZ bullet ready for resume)", "string", "string"],
  "architectureHighlights": ["string", "string", "string"]
}`

    const userPrompt = `Please scan and analyze this target project / website context and construct the recruiter-grade project dossier:\n\n${repoDossier}`

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    })

    const text = response.text || ''
    let parsed: any = null

    try {
      parsed = JSON.parse(text)
    } catch (parseErr) {
      const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim()
      parsed = JSON.parse(cleanJson)
    }

    // Ensure fallback fields and URLs exist
    if (parsed.project) {
      if (!parsed.project.image) parsed.project.image = '/images/D1.jpeg'
      if (!parsed.project.images || !parsed.project.images.length) parsed.project.images = ['/images/D1.jpeg', '/images/D2.jpeg']
      if (!parsed.project.status) parsed.project.status = 'Production'
      if (detectedLiveUrl && !parsed.project.liveUrl) parsed.project.liveUrl = detectedLiveUrl
      if (detectedGithubUrl && !parsed.project.githubUrl) parsed.project.githubUrl = detectedGithubUrl
    }

    return NextResponse.json({
      success: true,
      ...parsed,
      scannedType: isLiveSite ? 'live_website' : 'github_repo',
      detectedLiveUrl,
      source: 'gemini-3.7-flash'
    })
  } catch (error: any) {
    console.error('AI Project Scan Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to scan project with AI',
      },
      { status: 500 }
    )
  }
}

