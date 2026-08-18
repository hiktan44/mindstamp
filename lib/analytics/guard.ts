import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

type AnalyticsAccessInput = {
  analyticsId: string
  videoId: string
  sessionId?: string | null
}

export async function validateAnalyticsAccess(
  req: NextRequest,
  { analyticsId, videoId, sessionId }: AnalyticsAccessInput
) {
  const analytics = await prisma.analytics.findUnique({
    where: { id: analyticsId },
    select: {
      id: true,
      videoId: true,
      viewerId: true,
      sessionId: true,
    },
  })

  if (!analytics || analytics.videoId !== videoId) {
    return null
  }

  if (sessionId && analytics.sessionId !== sessionId) {
    return null
  }

  const viewerId = req.cookies.get('interaktiff_viewer_id')?.value
  if (viewerId && analytics.viewerId && viewerId !== analytics.viewerId) {
    return null
  }

  return analytics
}
