import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { videoId, name, email, phone } = data

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

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
      }
    })

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
