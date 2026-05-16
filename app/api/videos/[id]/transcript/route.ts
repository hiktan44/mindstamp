import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedVideo } from '@/lib/video/ownership'
import { transcriptUpsertSchema } from '@/lib/validators/lms'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })

  const transcript = await prisma.transcript.findUnique({ where: { videoId: id } })
  return NextResponse.json({ transcript })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })

  const parsed = transcriptUpsertSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const transcript = await prisma.transcript.upsert({
    where: { videoId: id },
    create: { videoId: id, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json({ transcript })
}

