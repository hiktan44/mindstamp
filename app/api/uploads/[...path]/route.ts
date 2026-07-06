import { NextRequest, NextResponse } from 'next/server'
import { resolve, sep } from 'path'
import { readFile, stat } from 'fs/promises'
import { createReadStream } from 'fs'
import { Readable } from 'stream'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const uploadsRoot = resolve(process.cwd(), 'public', 'uploads')
    const filePath = resolve(uploadsRoot, ...path)

    if (filePath !== uploadsRoot && !filePath.startsWith(`${uploadsRoot}${sep}`)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Check if file exists
    try {
      const fileStat = await stat(filePath)
      if (!fileStat.isFile()) {
        return new NextResponse('Not found', { status: 404 })
      }

      // Determine content type
      let contentType = 'application/octet-stream'
      const ext = path[path.length - 1].split('.').pop()?.toLowerCase()
      
      switch (ext) {
        case 'm3u8':
          contentType = 'application/vnd.apple.mpegurl'
          break
        case 'ts':
          contentType = 'video/MP2T'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'webp':
          contentType = 'image/webp'
          break
        case 'svg':
          contentType = 'image/svg+xml'
          break
        case 'mp4':
          contentType = 'video/mp4'
          break
        case 'webm':
          contentType = 'video/webm'
          break
        case 'mov':
          contentType = 'video/quicktime'
          break
        case 'mp3':
          contentType = 'audio/mpeg'
          break
        case 'wav':
          contentType = 'audio/wav'
          break
        case 'ogg':
          contentType = 'audio/ogg'
          break
      }

      // Handle Range requests (mainly for mp4 fallback, HLS rarely needs it but good to have)
      const range = req.headers.get('range')
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1

        if (start >= fileStat.size || end >= fileStat.size) {
          return new NextResponse('Requested range not satisfiable', {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileStat.size}` }
          })
        }

        const chunkSize = (end - start) + 1
        const fileStream = createReadStream(filePath, { start, end })

        return new NextResponse(Readable.toWeb(fileStream) as ReadableStream<Uint8Array>, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': contentType,
            // Cache chunks
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        })
      }

      // Read small files completely for HLS index files or thumbnails
      const fileContent = await readFile(filePath)
      
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': ext === 'm3u8' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable',
          'Content-Length': fileStat.size.toString()
        }
      })
    } catch {
      return new NextResponse('File not found', { status: 404 })
    }
  } catch (error) {
    console.error('API /api/uploads error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
