import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
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
      // Organizasyon üyeliği kontrolü yapılabilir
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Videoyu kontrol et
    const existingVideo = await prisma.video.findUnique({
      where: { id: params.id },
    })

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Erişim kontrolü
    if (existingVideo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Videoyu güncelle
    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
        // Eğer status PUBLISH ediliyorsa publishedAt'i ayarla
        ...(data.status === 'PUBLISHED' && !existingVideo.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Videoyu kontrol et
    const existingVideo = await prisma.video.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
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
