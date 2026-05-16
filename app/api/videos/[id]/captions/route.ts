import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedVideo } from '@/lib/video/ownership'
import { captionsReplaceSchema } from '@/lib/validators/lms'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })

  const captions = await prisma.caption.findMany({
    where: { videoId: id },
    orderBy: { language: 'asc' },
  })

  return NextResponse.json({ captions })
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

  const parsed = captionsReplaceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.caption.deleteMany({ where: { videoId: id } }),
    prisma.caption.createMany({
      data: parsed.data.captions.map((caption) => ({
        videoId: id,
        language: caption.language,
        content: caption.content || '',
        url: caption.url ?? null,
      })),
    }),
  ])

  const captions = await prisma.caption.findMany({
    where: { videoId: id },
    orderBy: { language: 'asc' },
  })

  return NextResponse.json({ captions })
}

