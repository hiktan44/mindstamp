import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyMuxWebhook } from '@/lib/video/mux'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const muxSignature = headersList.get('mux-signature')

    if (!muxSignature) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    const rawBody = await req.text()
    const payload = rawBody

    // Verify webhook signature
    const isValid = verifyMuxWebhook(payload, muxSignature)

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

      case 'video.upload.asset_created':
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

  await prisma.video.updateMany({
    where: {
      muxAssetId: id,
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
}

async function handleAssetErrored(data: any) {
  const { id, errors } = data

  console.error('Asset error:', id, errors)

  // Update video status to failed
  await prisma.video.updateMany({
    where: {
      muxAssetId: id,
    },
    data: {
      status: 'FAILED',
      updatedAt: new Date(),
    },
  })
}

async function handleAssetCreated(data: any) {
  const assetId = data.id
  const uploadId = data.upload_id
  console.log('Asset created:', assetId)

  if (assetId && uploadId) {
    await prisma.video.updateMany({
      where: { muxUploadId: uploadId },
      data: { muxAssetId: assetId, status: 'PROCESSING', updatedAt: new Date() },
    })
  }
}

async function handleUploadCompleted(data: any) {
  const uploadId = data.upload_id || data.id
  const assetId = data.asset_id
  console.log('Upload completed:', uploadId)

  if (uploadId && assetId) {
    await prisma.video.updateMany({
      where: { muxUploadId: uploadId },
      data: { muxAssetId: assetId, status: 'PROCESSING', updatedAt: new Date() },
    })
  }
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
