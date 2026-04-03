import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getMuxAsset } from '@/lib/video/mux'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Access control
    if (video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If processing with Mux, check status
    if (video.status === 'PROCESSING' && video.muxAssetId) {
      try {
        const muxAsset = await getMuxAsset(video.muxAssetId)

        if (muxAsset.ready) {
          // Update video status
          await prisma.video.update({
            where: { id: params.id },
            data: {
              status: 'PUBLISHED',
              hlsUrl: `https://stream.mux.com/${muxAsset.playbackId}.m3u8`,
              duration: muxAsset.duration,
              publishedAt: new Date(),
            },
          })

          return NextResponse.json({
            status: 'PUBLISHED',
            progress: 100,
            video: {
              ...video,
              status: 'PUBLISHED',
              hlsUrl: `https://stream.mux.com/${muxAsset.playbackId}.m3u8`,
              duration: muxAsset.duration,
            },
          })
        }

        // Mux processing in progress
        return NextResponse.json({
          status: 'PROCESSING',
          progress: 50, // Estimated progress
          muxStatus: muxAsset.status,
        })
      } catch (error) {
        console.error('Mux status check error:', error)
        // Continue with local status
      }
    }

    return NextResponse.json({
      status: video.status,
      progress: video.status === 'PROCESSING' ? 0 : 100,
      video: {
        id: video.id,
        title: video.title,
        status: video.status,
        hlsUrl: video.hlsUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        publishedAt: video.publishedAt,
      },
    })
  } catch (error) {
    console.error('Video status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    )
  }
}
