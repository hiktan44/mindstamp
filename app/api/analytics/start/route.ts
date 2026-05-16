import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analyticsStartSchema } from '@/lib/validators/analytics'
import { canWatchVideo } from '@/lib/video/access'

function detectDevice(userAgent: string | null) {
  const ua = userAgent || ''
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobile|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}

function detectBrowser(userAgent: string | null) {
  const ua = userAgent || ''
  if (/edg/i.test(ua)) return 'edge'
  if (/chrome|crios/i.test(ua)) return 'chrome'
  if (/firefox|fxios/i.test(ua)) return 'firefox'
  if (/safari/i.test(ua)) return 'safari'
  return 'unknown'
}

function detectOs(userAgent: string | null) {
  const ua = userAgent || ''
  if (/windows/i.test(ua)) return 'windows'
  if (/mac os|macintosh/i.test(ua)) return 'macos'
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ios/i.test(ua)) return 'ios'
  if (/linux/i.test(ua)) return 'linux'
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const parsed = analyticsStartSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const session = await auth()
  const viewerId = req.cookies.get('mindstamp_viewer_id')?.value || randomUUID()
  const userAgent = req.headers.get('user-agent')
  const referrer = parsed.data.referrer || req.headers.get('referer')
  const device = detectDevice(userAgent)
  const browser = detectBrowser(userAgent)
  const os = detectOs(userAgent)

  const video = await prisma.video.findUnique({ where: { id: parsed.data.videoId } })
  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const access = await canWatchVideo(video, session?.user?.id)
  if (!access.allowed) {
    return NextResponse.json({ error: 'Video is not available' }, { status: 403 })
  }

  const existingSession = await prisma.viewerSession.findUnique({
    where: { videoId_viewerId: { videoId: video.id, viewerId } },
    include: { analytics: true },
  })

  const viewerSession = existingSession || await prisma.viewerSession.create({
    data: {
      videoId: video.id,
      viewerId,
      userId: session?.user?.id,
      referrer,
      userAgent,
      device,
      browser,
      os,
    },
  })

  if (existingSession) {
    await prisma.viewerSession.update({
      where: { id: viewerSession.id },
      data: { lastSeenAt: new Date(), userId: session?.user?.id || viewerSession.userId },
    })
  } else {
    await prisma.video.update({
      where: { id: video.id },
      data: { viewCount: { increment: 1 } },
    })
  }

  const analytics = existingSession?.analytics || await prisma.analytics.create({
    data: {
      videoId: video.id,
      viewerId,
      userId: session?.user?.id,
      sessionId: viewerSession.id,
      device,
      browser,
      os,
    },
  })

  const response = NextResponse.json({
    analyticsId: analytics.id,
    sessionId: viewerSession.id,
    viewerId,
  })

  response.cookies.set('mindstamp_viewer_id', viewerId, {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
