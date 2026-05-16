import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyticsCompleteSchema } from '@/lib/validators/analytics'

export async function POST(req: NextRequest) {
  const parsed = analyticsCompleteSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { analyticsId, sessionId, watchTime, progress } = parsed.data
  const completedAt = new Date()

  await prisma.analytics.update({
    where: { id: analyticsId },
    data: {
      watchTime,
      progress,
      completed: true,
      completedAt,
    },
  })

  if (sessionId) {
    await prisma.viewerSession.update({
      where: { id: sessionId },
      data: { completedAt, lastSeenAt: completedAt },
    }).catch(() => null)
  }

  return NextResponse.json({ success: true })
}

