import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { leadCreateSchema } from '@/lib/validators/video'
import { canWatchVideo } from '@/lib/video/access'

function hasLeadCaptureEnabled(settings: unknown) {
  if (!settings || typeof settings !== 'object') return false
  const leadCapture = (settings as { leadCapture?: { enabled?: unknown } }).leadCapture
  return leadCapture?.enabled === true
}

export async function POST(req: NextRequest) {
  try {
    const parsed = leadCreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      }, { status: 400 })
    }

    const { videoId, name, email, phone, customId, customData } = parsed.data
    const session = await auth()

    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const access = await canWatchVideo(video, session?.user?.id)
    if (!access.allowed) {
      return NextResponse.json({ error: 'Video is not available' }, { status: 403 })
    }

    if (!hasLeadCaptureEnabled(video.settings)) {
      return NextResponse.json({ error: 'Lead capture is not enabled' }, { status: 403 })
    }

    const lead = await prisma.lead.create({
      data: {
        videoId,
        name,
        email,
        phone,
        customId,
        customData: customData ?? undefined,
      }
    })

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
