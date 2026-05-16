import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedVideo } from '@/lib/video/ownership'

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) {
    return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })
  }

  const [analyticsRows, questionResponses] = await Promise.all([
    prisma.analytics.findMany({
      where: { videoId: id },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.questionResponse.findMany({
      where: { videoId: id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const rows = [
    [
      'row_type',
      'viewer_id',
      'session_id',
      'started_at',
      'completed_at',
      'watch_time',
      'progress',
      'completed',
      'device',
      'browser',
      'os',
      'interaction_id',
      'answer',
      'is_correct',
      'score',
    ],
    ...analyticsRows.map((row) => [
      'view_session',
      row.viewerId,
      row.sessionId,
      row.startedAt.toISOString(),
      row.completedAt?.toISOString(),
      row.watchTime,
      row.progress,
      row.completed,
      row.device,
      row.browser,
      row.os,
      '',
      '',
      '',
      '',
    ]),
    ...questionResponses.map((row) => [
      'question_response',
      row.viewerId,
      row.sessionId,
      row.createdAt.toISOString(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      row.interactionId,
      JSON.stringify(row.answer),
      row.isCorrect,
      row.score,
    ]),
  ]

  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="video-${id}-analytics.csv"`,
    },
  })
}

