import fs from 'fs'
import path from 'path'

export const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

export interface ProjectRule {
  projectId: string
  aliases: string[]
  imageKeywords: string[]
}

export const PROJECT_RULES: ProjectRule[] = [
  {
    projectId: 'codeforge',
    aliases: ['codeforge', 'code-forge', 'code_forge'],
    imageKeywords: ['codeforge', 'code_forge', 'code-forge']
  },
  {
    projectId: 'revenue-architect',
    aliases: ['revenue-architect', 'revenuearchitect', 'revenuearchitech', 'reveneuarchitect', 'revenue_architect', 'revenue'],
    imageKeywords: ['revenuearchitech', 'revenuearchitect', 'reveneuarchitect', 'revenue_architect', 'revenue-architect']
  },
  {
    projectId: 'velora-store',
    aliases: ['velora-store', 'velora', 'velorastore'],
    imageKeywords: ['velora', 'velora-store', 'velora_store']
  },
  {
    projectId: 'samitech237',
    aliases: ['samitech237', 'samitech', 'sami-tech'],
    imageKeywords: ['samitech', 'samitech237', 'sami-tech', 'samitech_portal']
  },
  {
    projectId: 'netcom237',
    aliases: ['netcom237', 'netcom', 'net-com'],
    imageKeywords: ['netcom', 'netcom237', 'net-com', 'netcom_telecom']
  },
  {
    projectId: 'sa-bookkeeping',
    aliases: ['sa-bookkeeping', 'sa-bookeeping', 'bookkeeping', 'bookeeping', 'sea-digital-wealth', 'sea-digital'],
    imageKeywords: ['bookeeping', 'sa-bookkeeping', 'sa-bookeeping', 'bookkeeping', 'sea_bookkeeping', 'sea-bookkeeping']
  },
  {
    projectId: 'rare-beauty-by-anne',
    aliases: ['rare-beauty-by-anne', 'rarebeautybyanne', 'rarebeauty', 'rare-beauty', 'anne', 'rare_beauty'],
    imageKeywords: ['anne', 'rarebeauty', 'rare-beauty', 'rare_beauty', 'rarebeautybyanne']
  }
]

export interface ScannedImage {
  fileName: string
  fullPath: string
  url: string
  baseName: string
  ext: string
}

export interface MapResult {
  success: boolean
  mappedCount: number
  summary: Array<{
    project: string
    id: string
    primaryImage: string
    galleryCount: number
  }>
  message?: string
}

export function scanImages(dir: string, urlPrefix = ''): ScannedImage[] {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
  const results: ScannedImage[] = []

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase()
      if (VALID_EXTENSIONS.includes(ext)) {
        results.push({
          fileName: file,
          fullPath,
          url: `${urlPrefix}/${file}`.replace(/\/+/g, '/'),
          baseName: path.basename(file, ext).toLowerCase(),
          ext
        })
      }
    }
  }

  return results
}

export function executeImageMapping(rootDir = process.cwd()): MapResult {
  const dataFile = path.join(rootDir, 'data', 'portfolio-data.json')
  const publicDir = path.join(rootDir, 'public')
  const imagesDir = path.join(publicDir, 'images')

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }

  const publicImages = scanImages(publicDir, '')
  const nestedImages = scanImages(imagesDir, '/images')
  const allImages = [...nestedImages, ...publicImages]

  // Mirror files between public and public/images
  for (const img of allImages) {
    const inImagesDir = path.join(imagesDir, img.fileName)
    const inPublicDir = path.join(publicDir, img.fileName)

    if (!fs.existsSync(inImagesDir) && fs.existsSync(inPublicDir)) {
      try {
        fs.copyFileSync(inPublicDir, inImagesDir)
      } catch (e) {}
    } else if (!fs.existsSync(inPublicDir) && fs.existsSync(inImagesDir)) {
      try {
        fs.copyFileSync(inImagesDir, inPublicDir)
      } catch (e) {}
    }
  }

  const updatedImages = scanImages(imagesDir, '/images')

  if (!fs.existsSync(dataFile)) {
    return {
      success: false,
      mappedCount: 0,
      summary: [],
      message: `Data file not found at ${dataFile}`
    }
  }

  const rawData = fs.readFileSync(dataFile, 'utf8')
  let portfolioData: any
  try {
    portfolioData = JSON.parse(rawData)
  } catch (err: any) {
    return {
      success: false,
      mappedCount: 0,
      summary: [],
      message: `JSON parse error: ${err.message}`
    }
  }

  if (!portfolioData.works || !Array.isArray(portfolioData.works.projects)) {
    return {
      success: false,
      mappedCount: 0,
      summary: [],
      message: 'Projects array not found in portfolio data'
    }
  }

  let mappedCount = 0
  const summary: MapResult['summary'] = []

  portfolioData.works.projects = portfolioData.works.projects.map((project: any) => {
    const projId = (project.id || '').toLowerCase()
    const projTitle = (project.title || '').toLowerCase()

    const rule = PROJECT_RULES.find((r) => {
      if (r.projectId === projId) return true
      return r.aliases.some((alias) => projId.includes(alias) || projTitle.includes(alias))
    })

    if (!rule) return project

    const matches = updatedImages.filter((img) => {
      const bName = img.baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
      return rule.imageKeywords.some((kw) => {
        const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '')
        return bName.includes(cleanKw) || cleanKw.includes(bName)
      })
    })

    if (matches.length > 0) {
      const getScore = (img: ScannedImage) => {
        const bName = img.baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
        let kwIndex = 999
        let isExact = false
        for (let i = 0; i < rule.imageKeywords.length; i++) {
          const cleanKw = rule.imageKeywords[i].toLowerCase().replace(/[^a-z0-9]/g, '')
          if (bName === cleanKw) {
            kwIndex = i
            isExact = true
            break
          }
          if (bName.includes(cleanKw) || cleanKw.includes(bName)) {
            if (i < kwIndex) {
              kwIndex = i
            }
          }
        }
        return { kwIndex, isExact, isPng: img.ext === '.png' }
      }

      const preferred = matches.sort((a, b) => {
        const scoreA = getScore(a)
        const scoreB = getScore(b)
        if (scoreA.isExact && !scoreB.isExact) return -1
        if (!scoreA.isExact && scoreB.isExact) return 1
        if (scoreA.kwIndex !== scoreB.kwIndex) return scoreA.kwIndex - scoreB.kwIndex
        if (scoreA.isPng && !scoreB.isPng) return -1
        if (!scoreA.isPng && scoreB.isPng) return 1
        return 0
      })

      const primaryImg = preferred[0].url
      const gallery = Array.from(new Set([
        primaryImg,
        ...preferred.map((m) => m.url),
        ...(Array.isArray(project.images) ? project.images : [])
      ])).filter((url) => typeof url === 'string' && url.length > 0)

      mappedCount++
      summary.push({
        project: project.title,
        id: project.id,
        primaryImage: primaryImg,
        galleryCount: gallery.length
      })

      return {
        ...project,
        image: primaryImg,
        images: gallery
      }
    }

    return project
  })

  fs.writeFileSync(dataFile, JSON.stringify(portfolioData, null, 2) + '\n', 'utf8')

  return {
    success: true,
    mappedCount,
    summary,
    message: `Mapped ${mappedCount} projects to matching public image assets.`
  }
}
