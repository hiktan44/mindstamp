import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createMuxUpload, getMuxPlaybackUrl, createMuxAsset } from '@/lib/video/mux'
import { processUploadedVideo, checkFFmpeg } from '@/lib/video/ffmpeg'


export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.formData()
    const file = data.get('file') as File
    const title = data.get('title') as string
    const url = data.get('url') as string
    const processingMethod = data.get('processing') as 'mux' | 'ffmpeg' | 'none' || 'ffmpeg'

    // URL ile video ekleme
    if (url) {
      const video = await prisma.video.create({
        data: {
          title: title || 'URL Video',
          videoUrl: url,
          status: 'DRAFT',
          userId: session.user.id,
        },
      })

      return NextResponse.json({ video })
    }

    // Dosya yükleme
    if (!file) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
    }

    // Dosya boyutu kontrolü
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu 500MB\'dan küçük olmalıdır' },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece MP4, MOV ve WEBM formatları desteklenmektedir' },
        { status: 400 }
      )
    }

    // Video kaydı oluştur (PROCESSING status)
    const video = await prisma.video.create({
      data: {
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        status: 'PROCESSING',
        userId: session.user.id,
      },
    })

    // Video processing başlat (async)
    processVideoAsync(video.id, file, processingMethod).catch(error => {
      console.error('Video processing error:', error)
      // Mark as failed
      prisma.video.update({
        where: { id: video.id },
        data: { 
          status: 'FAILED',
          description: error instanceof Error ? error.message : String(error)
        },
      }).catch(console.error)
    })

    return NextResponse.json({
      video,
      processingStarted: true,
    })
  } catch (error: any) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Video yüklenirken bir hata oluştu: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

// Async video processing
async function processVideoAsync(
  videoId: string,
  file: File,
  method: 'mux' | 'ffmpeg' | 'none'
) {
  try {
    if (method === 'mux') {
      // Try Mux first
      const muxTokenId = process.env.MUX_TOKEN_ID
      const muxSecretKey = process.env.MUX_SECRET_KEY

      if (muxTokenId && muxSecretKey) {
        await processWithMux(videoId, file)
      } else {
        console.log('Mux not configured, falling back to FFmpeg')
        await processWithFFmpeg(videoId, file)
      }
    } else if (method === 'ffmpeg') {
      // Check FFmpeg availability
      const hasFFmpeg = await checkFFmpeg()

      if (!hasFFmpeg) {
        throw new Error('FFmpeg (ffmpeg -version) was not found in the environment path or failed to execute.')
      }

      await processWithFFmpeg(videoId, file)
    } else {
      // No processing - just store original file
      await processWithoutTranscoding(videoId, file)
    }
  } catch (error) {
    console.error('Video processing failed:', error)
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        status: 'FAILED',
        description: error instanceof Error ? error.message : String(error)
      },
    }).catch(console.error)
    throw error
  }
}

// Process with Mux
async function processWithMux(videoId: string, file: File) {
  try {
    // Create Mux upload URL
    const { uploadUrl, uploadId } = await createMuxUpload({
      title: `Video ${videoId}`,
    })

    // Upload file to Mux
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Mux: ${uploadResponse.statusText}`)
    }

    // Create asset from upload
    const { assetId, playbackId, status } = await createMuxAsset(uploadId)

    // Update video with Mux info
    await prisma.video.update({
      where: { id: videoId },
      data: {
        muxAssetId: assetId,
        muxUploadId: uploadId,
        hlsUrl: playbackId ? getMuxPlaybackUrl(playbackId) : null,
        status: status === 'ready' ? 'PUBLISHED' : 'PROCESSING',
        // Store raw file URL if available
        videoUrl: uploadUrl,
      },
    })

    // Poll for asset readiness
    if (status !== 'ready') {
      await pollMuxAssetReady(videoId, assetId)
    }
  } catch (error) {
    console.error('Mux processing error:', error)
    throw error
  }
}

// Poll Mux asset until ready
async function pollMuxAssetReady(videoId: string, assetId: string) {
  const maxAttempts = 60 // 5 minutes with 5-second intervals
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const { getMuxAsset } = await import('@/lib/video/mux')
      const asset = await getMuxAsset(assetId)

      if (asset.ready) {
        await prisma.video.update({
          where: { id: videoId },
          data: {
            status: 'PUBLISHED',
            hlsUrl: getMuxPlaybackUrl(asset.playbackId!),
            duration: asset.duration,
            publishedAt: new Date(),
          },
        })
        return
      }

      if (asset.status === 'errored') {
        throw new Error('Mux asset processing failed')
      }

      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++
    } catch (error) {
      console.error('Polling error:', error)
      throw error
    }
  }

  throw new Error('Mux asset processing timeout')
}

// Process with FFmpeg
async function processWithFFmpeg(videoId: string, file: File) {
  const result = await processUploadedVideo(file, videoId)

  if (!result.success || !result.hlsUrl) {
    throw new Error(result.error || 'Video işlenirken bir hata oluştu. Daha fazla detay yok.')
  }

  // Update video with processing results
  await prisma.video.update({
    where: { id: videoId },
    data: {
      hlsUrl: result.hlsUrl,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
}

// Process without transcoding (for development)
async function processWithoutTranscoding(videoId: string, file: File) {
  // For now, just store the file locally
  // In production, you would upload to S3/R2
  const fs = await import('fs/promises')
  const path = await import('path')

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })

  const fileName = `${videoId}-${file.name}`
  const filePath = path.join(uploadsDir, fileName)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filePath, buffer)

  await prisma.video.update({
    where: { id: videoId },
    data: {
      videoUrl: `/api/uploads/${fileName}`,
      status: 'DRAFT', // User needs to manually publish
    },
  })
}

// GET endpoint for listing videos
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      userId: session.user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              analytics: true,
              interactions: true,
            },
          },
        },
      }),
      prisma.video.count({ where }),
    ])

    return NextResponse.json({
      videos,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Videos fetch error:', error)
    return NextResponse.json(
      { error: 'Videolar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
