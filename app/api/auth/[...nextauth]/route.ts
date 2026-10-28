import type { NextRequest } from 'next/server'
import { handlers } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { journalLoginResponse } from '@/lib/login-journal-response'

export async function GET(request: NextRequest) {
  return journalLoginResponse(request, await handlers.GET(request), prisma)
}

export async function POST(request: NextRequest) {
  return journalLoginResponse(request, await handlers.POST(request), prisma)
}
