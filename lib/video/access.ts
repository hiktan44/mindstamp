import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

type VideoForAccess = {
  id: string
  userId: string
  status: string
  settings?: any
}

export function getVideoPrivacy(video: VideoForAccess) {
  return video.settings?.privacy || 'link'
}

export function getUnlockCookieName(videoId: string) {
  return `interaktiff_video_unlock_${videoId}`
}

export async function isVideoUnlocked(videoId: string) {
  const cookieStore = await cookies()
  return cookieStore.get(getUnlockCookieName(videoId))?.value === '1'
}

export async function canWatchVideo(video: VideoForAccess, userId?: string | null) {
  const isOwner = !!userId && video.userId === userId
  if (isOwner) return { allowed: true, reason: 'owner' as const }

  if (video.status !== 'PUBLISHED') {
    return { allowed: false, reason: 'not_published' as const }
  }

  const privacy = getVideoPrivacy(video)
  if (privacy === 'private') {
    return { allowed: false, reason: 'private' as const }
  }

  if (privacy === 'password') {
    const unlocked = await isVideoUnlocked(video.id)
    return unlocked
      ? { allowed: true, reason: 'password_unlocked' as const }
      : { allowed: false, reason: 'password_required' as const }
  }

  return { allowed: true, reason: 'public' as const }
}

export async function verifyVideoPassword(settings: any, password: string) {
  const passwordHash = settings?.passwordHash
  const legacyPassword = settings?.password

  if (passwordHash) {
    return bcrypt.compare(password, passwordHash)
  }

  return !!legacyPassword && legacyPassword === password
}

export async function normalizeVideoSettingsForSave(settings: any) {
  if (!settings || typeof settings !== 'object') return settings

  if (settings.privacy === 'password' && settings.password) {
    const passwordHash = await bcrypt.hash(String(settings.password), 12)
    const { password, ...rest } = settings
    return { ...rest, passwordHash }
  }

  return settings
}

