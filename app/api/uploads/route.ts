import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { auth } from '@/lib/auth'

// Accepts an image or short video/audio file used as an interaction asset
// (overlay image, video clip, etc.) and stores it under public/uploads/assets.
// The file is served back via the /api/uploads/[...path] route.

const MAX_BYTES = 50 * 1024 * 1024 // 50MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const type = file.type || ''
    if (!type.startsWith('image/') && !type.startsWith('video/') && !type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Sadece resim, video veya ses dosyası yükleyebilirsiniz' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Dosya 50MB sınırını aşıyor' },
        { status: 400 }
      )
    }

    const ext = EXT_BY_MIME[type] || (file.name.split('.').pop() || 'bin').toLowerCase()
    const filename = `${randomUUID()}.${ext}`

    const dir = resolve(process.cwd(), 'public', 'uploads', 'assets')
    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(resolve(dir, filename), buffer)

    const url = `/api/uploads/assets/${filename}`
    return NextResponse.json({ url, type })
  } catch (error) {
    console.error('Asset upload error:', error)
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 })
  }
}
