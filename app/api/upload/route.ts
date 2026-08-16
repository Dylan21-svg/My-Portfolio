import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { authenticate, unauthorizedResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await authenticate(request)
    if (!isAuthenticated) {
      return unauthorizedResponse()
    }

    const contentType = request.headers.get('content-type') || ''

    // Handle Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Sanitize file name
      const originalName = file.name || 'uploaded-file'
      const ext = path.extname(originalName) || (file.type.includes('pdf') ? '.pdf' : '.png')
      const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
      const uniqueFileName = `${baseName}_${Date.now()}${ext}`

      // Create uploads directory in public if possible
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      let savedUrl = ''

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const filePath = path.join(uploadsDir, uniqueFileName)
        fs.writeFileSync(filePath, buffer)
        savedUrl = `/uploads/${uniqueFileName}`
      } catch (fsErr) {
        console.warn('Could not write file to filesystem (using data URL fallback):', fsErr)
      }

      // Convert buffer to Base64 Data URL for guaranteed accessibility
      const mimeType = file.type || 'application/octet-stream'
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`

      // Format file size nicely
      const sizeBytes = buffer.length
      const formattedSize =
        sizeBytes < 1024
          ? `${sizeBytes} B`
          : sizeBytes < 1024 * 1024
          ? `${(sizeBytes / 1024).toFixed(1)} KB`
          : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`

      return NextResponse.json({
        success: true,
        filename: originalName,
        savedFilename: uniqueFileName,
        url: savedUrl || base64Data,
        dataUrl: base64Data,
        fileSize: formattedSize,
        sizeBytes: sizeBytes,
        mimeType: mimeType,
        uploadedAt: new Date().toISOString()
      })
    }

    // Handle Base64 JSON Payload
    const body = await request.json()
    if (!body.dataUrl) {
      return NextResponse.json({ error: 'Missing dataUrl in body' }, { status: 400 })
    }

    const { dataUrl, filename = 'uploaded_file' } = body
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: filename
      })
    }

    const mimeType = matches[1]
    const base64Content = matches[2]
    const buffer = Buffer.from(base64Content, 'base64')

    const ext = path.extname(filename) || (mimeType.includes('pdf') ? '.pdf' : '.png')
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    let savedUrl = ''

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const filePath = path.join(uploadsDir, uniqueFileName)
      fs.writeFileSync(filePath, buffer)
      savedUrl = `/uploads/${uniqueFileName}`
    } catch (fsErr) {
      console.warn('Could not write file to filesystem:', fsErr)
    }

    const sizeBytes = buffer.length
    const formattedSize =
      sizeBytes < 1024
        ? `${sizeBytes} B`
        : sizeBytes < 1024 * 1024
        ? `${(sizeBytes / 1024).toFixed(1)} KB`
        : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`

    return NextResponse.json({
      success: true,
      filename: filename,
      savedFilename: uniqueFileName,
      url: savedUrl || dataUrl,
      dataUrl: dataUrl,
      fileSize: formattedSize,
      sizeBytes: sizeBytes,
      mimeType: mimeType,
      uploadedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in /api/upload:', error)
    return NextResponse.json({ error: 'File upload processing failed' }, { status: 500 })
  }
}
