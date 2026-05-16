import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedVideo } from '@/lib/video/ownership'
import { endScreenUpsertSchema } from '@/lib/validators/lms'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })

  const endScreen = await prisma.endScreen.findUnique({ where: { videoId: id } })
  return NextResponse.json({ endScreen })
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

  const parsed = endScreenUpsertSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const endScreen = await prisma.endScreen.upsert({
    where: { videoId: id },
    create: { videoId: id, ...parsed.data, buttonConfig: parsed.data.buttonConfig ?? undefined },
    update: { ...parsed.data, buttonConfig: parsed.data.buttonConfig ?? undefined },
  })

  return NextResponse.json({ endScreen })
}

