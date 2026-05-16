import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyticsHeartbeatSchema } from '@/lib/validators/analytics'

export async function POST(req: NextRequest) {
  const parsed = analyticsHeartbeatSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { analyticsId, sessionId, watchTime, progress, currentTime } = parsed.data

  await prisma.analytics.update({
    where: { id: analyticsId },
    data: {
      watchTime,
      progress,
      interactions: {
        currentTime,
        updatedAt: new Date().toISOString(),
      },
    },
  })

  if (sessionId) {
    await prisma.viewerSession.update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() },
    }).catch(() => null)
  }

  return NextResponse.json({ success: true })
}

