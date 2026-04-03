import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyMuxWebhook } from '@/lib/video/mux'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const muxSignature = headersList.get('mux-signature')
    const muxTimestamp = headersList.get('mux-timestamp')

    if (!muxSignature || !muxTimestamp) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    const rawBody = await req.text()
    const payload = rawBody

    // Verify webhook signature
    const isValid = verifyMuxWebhook(payload, muxSignature, muxTimestamp)

    if (!isValid) {
      console.error('Invalid Mux webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)

    // Process different Mux events
    switch (event.type) {
      case 'video.asset.ready':
        await handleAssetReady(event.data)
        break

      case 'video.asset.errored':
        await handleAssetErrored(event.data)
        break

      case 'video.asset.created':
        await handleAssetCreated(event.data)
        break

      case 'video.asset.upload.completed':
        await handleUploadCompleted(event.data)
        break

      case 'video.asset.static_rendition.created':
        await handleStaticRenditionCreated(event.data)
        break

      default:
        console.log('Unhandled Mux event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Mux webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleAssetReady(data: any) {
  const { id, playback_ids, mp4_playback_ids, duration } = data

  console.log('Asset ready:', id)

  // Update video in database when processing is complete
  await prisma.video.updateMany({
    where: {
      // Find video by mux asset id - you need to store this during upload
      // For now, we'll search for videos in PROCESSING status
      status: 'PROCESSING',
    },
    data: {
      status: 'PUBLISHED',
      hlsUrl: playback_ids?.[0]?.id
        ? `https://stream.mux.com/${playback_ids[0].id}.m3u8`
        : null,
      mp4Url: mp4_playback_ids?.[0]?.id
        ? `https://stream.mux.com/${mp4_playback_ids[0].id}.mp4`
        : null,
      duration: duration ? parseFloat(duration) : undefined,
      updatedAt: new Date(),
    },
  })

  // TODO: Update specific video by muxAssetId
  // You should add muxAssetId field to Video model
}

async function handleAssetErrored(data: any) {
  const { id, errors } = data

  console.error('Asset error:', id, errors)

  // Update video status to failed
  await prisma.video.updateMany({
    where: {
      // Find by mux asset id
      status: 'PROCESSING',
    },
    data: {
      status: 'FAILED',
      updatedAt: new Date(),
    },
  })
}

async function handleAssetCreated(data: any) {
  console.log('Asset created:', data.id)
}

async function handleUploadCompleted(data: any) {
  console.log('Upload completed:', data.upload_id)
}

async function handleStaticRenditionCreated(data: any) {
  console.log('Static rendition created:', data.id)
}

// Verify webhook for GET requests (debugging)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'Mux webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
