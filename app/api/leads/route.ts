import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { leadCreateSchema } from '@/lib/validators/video'

export async function POST(req: Request) {
  try {
    const parsed = leadCreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      }, { status: 400 })
    }

    const { videoId, name, email, phone, customId, customData } = parsed.data

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const lead = await prisma.lead.create({
      data: {
        videoId,
        name,
        email,
        phone,
        customId,
        customData: customData ?? undefined,
      }
    })

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
