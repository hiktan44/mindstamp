import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUnlockCookieName, verifyVideoPassword } from '@/lib/video/access'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { password } = await req.json().catch(() => ({ password: '' }))

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const video = await prisma.video.findUnique({
    where: { id },
    select: { id: true, settings: true },
  })

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const isValid = await verifyVideoPassword(video.settings, password)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(getUnlockCookieName(video.id), '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}

