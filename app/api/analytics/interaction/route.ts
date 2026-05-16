import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { interactionEventSchema } from '@/lib/validators/analytics'

function getQuestionScore(data: Record<string, any> | null | undefined) {
  if (!data || typeof data.isCorrect !== 'boolean') return null
  return data.isCorrect ? 1 : 0
}

export async function POST(req: NextRequest) {
  const parsed = interactionEventSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { analyticsId, sessionId, videoId, interactionId, eventType, data } = parsed.data
  const analytics = analyticsId
    ? await prisma.analytics.findUnique({ where: { id: analyticsId }, select: { viewerId: true } })
    : null

  await prisma.interactionEvent.create({
    data: {
      analyticsId,
      sessionId,
      videoId,
      interactionId,
      eventType,
      data: data ?? undefined,
      viewerId: analytics?.viewerId,
    },
  })

  if (eventType === 'click' || eventType === 'submit') {
    await prisma.video.update({
      where: { id: videoId },
      data: { interactionCount: { increment: 1 } },
    }).catch(() => null)
  }

  if (eventType === 'submit') {
    await prisma.questionResponse.create({
      data: {
        videoId,
        sessionId,
        interactionId,
        viewerId: analytics?.viewerId,
        answer: data?.answer ?? data ?? {},
        isCorrect: typeof data?.isCorrect === 'boolean' ? data.isCorrect : null,
        score: getQuestionScore(data),
      },
    }).catch(() => null)

    if (sessionId) {
      await prisma.viewerState.upsert({
        where: { sessionId_key: { sessionId, key: `question:${interactionId}` } },
        create: {
          sessionId,
          interactionId,
          key: `question:${interactionId}`,
          value: data || {},
        },
        update: {
          interactionId,
          value: data || {},
        },
      }).catch(() => null)
    }
  }

  return NextResponse.json({ success: true })
}
