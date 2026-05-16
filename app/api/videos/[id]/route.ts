import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { videoPatchSchema } from '@/lib/validators/video'
import { normalizeVideoSettingsForSave } from '@/lib/video/access'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { startTime: 'asc' },
        },
        chapters: {
          orderBy: { startTime: 'asc' },
        },
        captions: true,
        transcripts: true,
        endScreens: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Erişim kontrolü
    if (video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Video fetch error:', error)
    return NextResponse.json(
      { error: 'Video alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = videoPatchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const { id } = await params
    const { interactions, ...otherData } = data

    // Videoyu kontrol et
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Erişim kontrolü
    if (existingVideo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = {
      ...otherData,
      updatedAt: new Date(),
      // Eğer status PUBLISH ediliyorsa publishedAt'i ayarla
      ...(otherData.status === 'PUBLISHED' && !existingVideo.publishedAt
        ? { publishedAt: new Date() }
        : {}),
    }

    if ('settings' in updateData) {
      updateData.settings = await normalizeVideoSettingsForSave(updateData.settings)
    }

    if (interactions) {
      updateData.interactions = {
        deleteMany: {},
        create: interactions.map((i: any) => ({
          type: i.type,
          startTime: i.startTime,
          endTime: i.endTime,
          config: i.config || {},
          position: i.position || null,
          style: i.style || null,
          variables: i.variables || null,
          logic: i.logic || null,
        }))
      }
    }

    // Videoyu güncelle
    const video = await prisma.video.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Video update error:', error)
    return NextResponse.json(
      { error: 'Video güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Videoyu kontrol et
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Erişim kontrolü
    if (existingVideo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Videoyu sil (cascade delete ile ilişkiler de silinir)
    await prisma.video.delete({
      where: { id },
    })

    // TODO: S3/R2'den dosyaları sil

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Video delete error:', error)
    return NextResponse.json(
      { error: 'Video silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
