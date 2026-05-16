import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { startTime: 'asc' } },
    },
  })

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  if (video.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [analyticsRows, events, sessions] = await Promise.all([
    prisma.analytics.findMany({ where: { videoId: id } }),
    prisma.interactionEvent.groupBy({
      by: ['interactionId', 'eventType'],
      where: { videoId: id },
      _count: { _all: true },
    }),
    prisma.viewerSession.findMany({
      where: { videoId: id },
      orderBy: { startedAt: 'desc' },
      take: 100,
    }),
  ])

  const totalViews = analyticsRows.length
  const uniqueViewers = new Set(analyticsRows.map((row) => row.viewerId).filter(Boolean)).size
  const avgWatchTime = totalViews
    ? analyticsRows.reduce((sum, row) => sum + row.watchTime, 0) / totalViews
    : 0
  const completionRate = totalViews
    ? Math.round((analyticsRows.filter((row) => row.completed).length / totalViews) * 100)
    : 0

  const devices = analyticsRows.reduce((acc: Record<string, number>, row) => {
    const key = row.device || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, { desktop: 0, mobile: 0, tablet: 0 })

  const eventCounts = events.reduce((acc: Record<string, Record<string, number>>, event) => {
    const key = event.interactionId || 'unknown'
    acc[key] = acc[key] || {}
    acc[key][event.eventType] = event._count._all
    return acc
  }, {})

  return NextResponse.json({
    summary: {
      totalViews,
      uniqueViewers,
      avgWatchTime,
      completionRate,
    },
    devices,
    topInteractions: video.interactions.map((interaction) => ({
      id: interaction.id,
      type: interaction.type,
      label: (interaction.config as any)?.text || (interaction.config as any)?.question || interaction.type,
      startTime: interaction.startTime,
      views: eventCounts[interaction.id]?.view || 0,
      clicks: eventCounts[interaction.id]?.click || 0,
      submits: eventCounts[interaction.id]?.submit || 0,
    })),
    viewers: sessions.map((viewerSession) => ({
      id: viewerSession.id,
      viewerId: viewerSession.viewerId,
      device: viewerSession.device,
      browser: viewerSession.browser,
      os: viewerSession.os,
      startedAt: viewerSession.startedAt,
      lastSeenAt: viewerSession.lastSeenAt,
      completedAt: viewerSession.completedAt,
    })),
  })
}

