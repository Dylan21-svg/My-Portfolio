#!/usr/bin/env node

/**
 * Script to automatically scan the /public and /public/images directories
 * and map local images (codeforge, revenuearchitect, velora, samitech, netcom, anne, bookkeeping)
 * to their respective project data entries in data/portfolio-data.json.
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '..')
const DATA_FILE = path.join(ROOT_DIR, 'data', 'portfolio-data.json')
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')

// Supported image extensions
const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

// Mapping rules: project keywords -> candidate image keywords
const PROJECT_RULES = [
  {
    projectId: 'codeforge',
    aliases: ['codeforge', 'code-forge', 'code_forge'],
    imageKeywords: ['codeforge', 'code_forge', 'code-forge']
  },
  {
    projectId: 'revenue-architect',
    aliases: ['revenue-architect', 'revenuearchitect', 'reveneuarchitect', 'revenue_architect', 'revenue'],
    imageKeywords: ['revenuearchitect', 'reveneuarchitect', 'revenue_architect', 'revenue-architect']
  },
  {
    projectId: 'velora-store',
    aliases: ['velora-store', 'velora', 'velorastore'],
    imageKeywords: ['velora', 'velora-store', 'velora_store']
  },
  {
    projectId: 'samitech237',
    aliases: ['samitech237', 'samitech', 'sami-tech'],
    imageKeywords: ['samitech237', 'samitech', 'sami-tech', 'samitech_portal']
  },
  {
    projectId: 'netcom237',
    aliases: ['netcom237', 'netcom', 'net-com'],
    imageKeywords: ['netcom237', 'netcom', 'net-com', 'netcom_telecom']
  },
  {
    projectId: 'sa-bookkeeping',
    aliases: ['sa-bookkeeping', 'sa-bookeeping', 'bookkeeping', 'bookeeping', 'sea-digital-wealth', 'sea-digital'],
    imageKeywords: ['sa-bookkeeping', 'sa-bookeeping', 'bookkeeping', 'bookeeping', 'sea_bookkeeping', 'sea-bookkeeping']
  },
  {
    projectId: 'rare-beauty-by-anne',
    aliases: ['rare-beauty-by-anne', 'rarebeautybyanne', 'rarebeauty', 'rare-beauty', 'anne', 'rare_beauty'],
    imageKeywords: ['rarebeauty', 'rare-beauty', 'rare_beauty', 'rarebeautybyanne', 'anne']
  }
]

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function scanImagesInDir(dir, urlPrefix = '') {
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
  const results = []

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

function mapProjectImages() {
  console.log('🔍 Scanning local image assets in public folder...')
  ensureDirectory(PUBLIC_DIR)
  ensureDirectory(IMAGES_DIR)

  const publicImages = scanImagesInDir(PUBLIC_DIR, '')
  const nestedImages = scanImagesInDir(IMAGES_DIR, '/images')

  // Combine and deduplicate
  const allImages = [...nestedImages, ...publicImages]

  console.log(`📁 Found ${nestedImages.length} images in /public/images and ${publicImages.length} images in /public root.`)

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found at ${DATA_FILE}`)
    process.exit(1)
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf8')
  let portfolioData
  try {
    portfolioData = JSON.parse(rawData)
  } catch (err) {
    console.error('❌ Failed to parse portfolio-data.json:', err)
    process.exit(1)
  }

  if (!portfolioData.works || !Array.isArray(portfolioData.works.projects)) {
    console.error('❌ portfolioData.works.projects is not an array')
    process.exit(1)
  }

  let mappedCount = 0
  const syncSummary = []

  // Ensure mirrored copies between /public and /public/images for maximum reliability
  for (const img of allImages) {
    const inImagesDir = path.join(IMAGES_DIR, img.fileName)
    const inPublicDir = path.join(PUBLIC_DIR, img.fileName)

    if (!fs.existsSync(inImagesDir) && fs.existsSync(inPublicDir)) {
      try {
        fs.copyFileSync(inPublicDir, inImagesDir)
        console.log(`  ↪ Synced ${img.fileName} from /public to /public/images`)
      } catch (e) {}
    } else if (!fs.existsSync(inPublicDir) && fs.existsSync(inImagesDir)) {
      try {
        fs.copyFileSync(inImagesDir, inPublicDir)
        console.log(`  ↪ Synced ${img.fileName} from /public/images to /public`)
      } catch (e) {}
    }
  }

  // Re-scan after sync
  const updatedImages = scanImagesInDir(IMAGES_DIR, '/images')

  // Process projects
  portfolioData.works.projects = portfolioData.works.projects.map((project) => {
    const projId = (project.id || '').toLowerCase()
    const projTitle = (project.title || '').toLowerCase()

    // Find rule
    const rule = PROJECT_RULES.find((r) => {
      if (r.projectId === projId) return true
      return r.aliases.some((alias) => projId.includes(alias) || projTitle.includes(alias))
    })

    if (!rule) {
      return project
    }

    // Match image candidates
    const matches = updatedImages.filter((img) => {
      const bName = img.baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
      return rule.imageKeywords.some((kw) => {
        const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '')
        return bName.includes(cleanKw) || cleanKw.includes(bName)
      })
    })

    if (matches.length > 0) {
      // Prioritize PNG if available, then JPG/JPEG
      const preferred = matches.sort((a, b) => {
        if (a.ext === '.png' && b.ext !== '.png') return -1
        if (b.ext === '.png' && a.ext !== '.png') return 1
        return 0
      })

      const primaryImg = preferred[0].url
      const gallery = Array.from(new Set([
        primaryImg,
        ...preferred.map((m) => m.url),
        ...(Array.isArray(project.images) ? project.images : [])
      ])).filter((url) => {
        // Filter out old un-matched generic images if new ones exist
        return typeof url === 'string' && url.length > 0
      })

      mappedCount++
      syncSummary.push({
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

  // Save back to disk
  fs.writeFileSync(DATA_FILE, JSON.stringify(portfolioData, null, 2) + '\n', 'utf8')

  console.log('\n=======================================================')
  console.log(`✅ Successfully mapped ${mappedCount} projects to local image previews:`)
  console.log('=======================================================')
  syncSummary.forEach((s) => {
    console.log(`📌 ${s.project} [${s.id}]`)
    console.log(`   Preview URL: ${s.primaryImage}`)
    console.log(`   Gallery Images: ${s.galleryCount}`)
  })
  console.log('=======================================================\n')
}

// Execute
mapProjectImages()
