// Video kaynağı (URL) türünü belirleme ve embed bilgisi çıkarma yardımcıları.
// YouTube ve Vimeo linkleri native <video> ile oynatılamaz; provider'ın
// IFrame/SDK oynatıcısı gerekir. Bu modül URL'yi tek noktadan sınıflandırır.

export type VideoProviderType = 'youtube' | 'vimeo' | 'hls' | 'file'

export interface VideoSource {
  type: VideoProviderType
  /** Provider video kimliği (youtube/vimeo için). */
  id?: string
  /** Doğrudan oynatılabilen URL (file/hls) ya da provider embed URL'i. */
  url: string
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

/** YouTube URL'inden 11 karakterlik video kimliğini çıkarır. */
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (u.searchParams.get('v')) {
      return u.searchParams.get('v')
    }

    // /embed/ID, /shorts/ID, /live/ID, /v/ID
    const parts = u.pathname.split('/').filter(Boolean)
    const marker = parts.findIndex((p) =>
      ['embed', 'shorts', 'live', 'v'].includes(p)
    )
    if (marker !== -1 && parts[marker + 1]) {
      return parts[marker + 1]
    }

    return null
  } catch {
    // URL değilse basit regex ile dene
    const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
  }
}

/** Vimeo URL'inden sayısal video kimliğini çıkarır. */
export function extractVimeoId(url: string): string | null {
  try {
    const u = new URL(url)
    // player.vimeo.com/video/ID veya vimeo.com/ID veya vimeo.com/channels/x/ID
    const parts = u.pathname.split('/').filter(Boolean)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(parts[i])) return parts[i]
    }
    return null
  } catch {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return m ? m[1] : null
  }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Bir video URL'ini sınıflandırır. YouTube/Vimeo için embed URL üretir,
 * diğerleri için (mp4/webm/mov/m3u8 ve yerel yollar) doğrudan URL döner.
 */
export function resolveVideoSource(rawUrl: string): VideoSource {
  const url = (rawUrl || '').trim()
  if (!url) return { type: 'file', url }

  const host = hostnameOf(url)

  if (host && YOUTUBE_HOSTS.has(host)) {
    const id = extractYouTubeId(url)
    if (id) {
      return {
        type: 'youtube',
        id,
        url: `https://www.youtube-nocookie.com/embed/${id}`,
      }
    }
  }

  if (host && VIMEO_HOSTS.has(host)) {
    const id = extractVimeoId(url)
    if (id) {
      return {
        type: 'vimeo',
        id,
        url: `https://player.vimeo.com/video/${id}`,
      }
    }
  }

  if (url.includes('.m3u8')) {
    return { type: 'hls', url }
  }

  return { type: 'file', url }
}

/** URL bir provider (YouTube/Vimeo) linki mi? Doğrulama/UI için pratik yardımcı. */
export function isEmbedProvider(url: string): boolean {
  const src = resolveVideoSource(url)
  return src.type === 'youtube' || src.type === 'vimeo'
}
