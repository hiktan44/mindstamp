import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedVideo } from '@/lib/video/ownership'
import { chaptersReplaceSchema } from '@/lib/validators/lms'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await getOwnedVideo(id, session.user.id)
  if (!ownership.video) return NextResponse.json({ error: ownership.status === 404 ? 'Video not found' : 'Forbidden' }, { status: ownership.status })

  const chapters = await prisma.chapter.findMany({
    where: { videoId: id },
    orderBy: [{ order: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json({ chapters })
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

  const parsed = chaptersReplaceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.chapter.deleteMany({ where: { videoId: id } }),
    prisma.chapter.createMany({
      data: parsed.data.chapters.map((chapter, index) => ({
        videoId: id,
        title: chapter.title,
        startTime: chapter.startTime,
        endTime: chapter.endTime ?? null,
        order: chapter.order ?? index,
      })),
    }),
  ])

  const chapters = await prisma.chapter.findMany({
    where: { videoId: id },
    orderBy: [{ order: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json({ chapters })
}

