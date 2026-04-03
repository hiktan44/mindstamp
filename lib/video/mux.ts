import { Mux } from '@mux/mux-node'

const muxTokenId = process.env.MUX_TOKEN_ID || ''
const muxSecretKey = process.env.MUX_SECRET_KEY || ''
const muxWebhookSigningSecret = process.env.MUX_WEBHOOK_SIGNING_SECRET || ''

// Mux client singleton
let muxClient: Mux | null = null

export function getMuxClient() {
  if (!muxTokenId || !muxSecretKey) {
    throw new Error('Mux credentials not configured')
  }

  if (!muxClient) {
    muxClient = new Mux({
      tokenId: muxTokenId,
      tokenSecret: muxSecretKey,
    })
  }

  return muxClient
}

// Create direct upload URL
export async function createMuxUpload(options: {
  title: string
  description?: string
  timeout?: number // seconds
}) {
  try {
    const client = getMuxClient()
    const upload = await client.video.uploads.create({
      new_asset_settings: {
        playback_policies: ['public'],
        mp4_support: 'standard',
      },
      test_mode: process.env.NODE_ENV !== 'production',
      timeout: options.timeout || 3600, // 1 hour default
      cors_origin: '*', // In production, set to your domain
    })

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
    }
  } catch (error) {
    console.error('Mux upload creation error:', error)
    throw new Error('Failed to create upload URL')
  }
}

// Create asset from uploaded video
export async function createMuxAsset(uploadId: string) {
  try {
    const asset = await getMuxClient().video.assets.create({
      input: [{
        url: `https://storage.googleapis.com/muxdemofiles/mux-logo-animation.mp4`, // This would be the uploaded file URL
      }],
      playback_policies: ['public'],
      mp4_support: 'standard',
    })

    return {
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
    }
  } catch (error) {
    console.error('Mux asset creation error:', error)
    throw new Error('Failed to create asset')
  }
}

// Get asset details
export async function getMuxAsset(assetId: string) {
  try {
    const asset = await getMuxClient().video.assets.get(assetId)
    return {
      assetId: asset.id,
      status: asset.status,
      playbackId: asset.playback_ids?.[0]?.id,
      mp4PlaybackId: asset.playback_ids?.[1]?.id,
      duration: asset.duration,
      createdAt: asset.created_at,
      ready: asset.status === 'ready',
    }
  } catch (error) {
    console.error('Mux asset fetch error:', error)
    throw new Error('Failed to fetch asset')
  }
}

// Generate thumbnail from asset
export async function generateMuxThumbnail(assetId: string, time: number = 1) {
  try {
    const thumbnail = await getMuxClient().video.assets.createThumbnailTime(assetId, {
      time: time,
    })

    return thumbnail.url
  } catch (error) {
    console.error('Mux thumbnail error:', error)
    throw new Error('Failed to generate thumbnail')
  }
}

// Verify webhook signature
export function verifyMuxWebhook(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const crypto = require('crypto')

  const signedPayload = `${timestamp}.${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', muxWebhookSigningSecret)
    .update(signedPayload)
    .digest('hex')

  return signature === expectedSignature
}

// Get playback URL
export function getMuxPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

// Get MP4 URL (for download/fallback)
export function getMuxMp4Url(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.mp4`
}
