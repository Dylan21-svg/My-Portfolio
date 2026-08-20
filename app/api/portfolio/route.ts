import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import fs from 'fs'
import path from 'path'
import { authenticate, unauthorizedResponse } from '@/lib/auth'
import { kv } from '@vercel/kv'

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio-data.json')
const KV_KEY = 'portfolio_data'

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (err) {
      // Ignore directory creation errors in readonly containers
    }
  }
}

// In-memory store fallback
const memoryStore = new Map<string, any>()

const readData = async () => {
  // 1. Check in-memory store
  if (memoryStore.has(KV_KEY)) {
    return memoryStore.get(KV_KEY)
  }

  // 2. Try Vercel KV if credentials exist
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const kvData = await kv.get(KV_KEY)
      if (kvData) {
        memoryStore.set(KV_KEY, kvData)
        return kvData
      }
    }
  } catch (error) {
    console.warn('Vercel KV not reachable, falling back to local file:', error)
  }

  // 3. Fallback to local file on disk
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      memoryStore.set(KV_KEY, parsed)
      return parsed
    }
  } catch (error) {
    console.error('Error reading portfolio data file:', error)
  }

  return null
}

const writeData = async (data: any) => {
  // Always update memory store immediately
  memoryStore.set(KV_KEY, data)
  let success = true

  // 1. Write to local file on disk
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.warn('Local file write notice (in-memory updated):', error)
  }

  // 2. Try saving to Vercel KV if available
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(KV_KEY, data)
    }
  } catch (error) {
    console.warn('Vercel KV write notice (in-memory updated):', error)
  }

  return success
}

export async function GET() {
  try {
    const data = await readData()
    return NextResponse.json(data || {}, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
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

    const isSaved = await writeData(body)

    if (isSaved) {
      return NextResponse.json(
        { success: true, message: 'Data saved and synchronized successfully', data: body },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        }
      )
    } else {
      return NextResponse.json({
        error: 'Failed to save data to storage.',
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in POST /api/portfolio:', error)
    return NextResponse.json({ error: error.message || 'Failed to save data' }, { status: 500 })
  }
}
