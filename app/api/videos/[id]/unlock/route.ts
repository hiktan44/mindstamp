import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUnlockCookieName, verifyVideoPassword } from '@/lib/video/access'

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

function getClientKey(req: NextRequest, videoId: string) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || req.headers.get('x-real-ip') || 'unknown'
  return `${videoId}:${ip}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS })
    return false
  }
  return current.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(key: string) {
  const now = Date.now()
  const current = attempts.get(key) || { count: 0, resetAt: now + WINDOW_MS }
  attempts.set(key, { count: current.count + 1, resetAt: current.resetAt })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { password } = await req.json().catch(() => ({ password: '' }))

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const clientKey = getClientKey(req, id)
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
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
    recordFailedAttempt(clientKey)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  attempts.delete(clientKey)

  const response = NextResponse.json({ success: true })
  response.cookies.set(getUnlockCookieName(video.id), '1', {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}
