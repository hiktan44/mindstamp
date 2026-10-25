// Dogrulanmis giris olay gunlugu (login_events).
// Auth.js `events.signIn` yalnizca kimlik dogrulama (parola/OAuth) BASARILI olup
// oturum cerezi uretildikten sonra cagrilir; basarisiz deneme buraya gelmez.
// JWT yenileme/oturum guncellemesi signIn olayi uretmez.
// Kisisel veri tutulmaz (yalniz user_id + yontem + zaman). Hata girisi ASLA engellemez.
import { randomUUID } from 'crypto'
import { prisma } from './db'

const METHOD_BY_PROVIDER: Record<string, string> = {
  credentials: 'password',
  google: 'google',
  github: 'github',
}

export function loginMethod(provider: string | null | undefined): string {
  const p = String(provider || '').toLowerCase()
  return METHOD_BY_PROVIDER[p] ?? (p.replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'unknown')
}

export async function recordLoginEvent(
  userId: string | null | undefined,
  provider: string | null | undefined
): Promise<void> {
  try {
    if (!userId) return
    await prisma.loginEvent.create({
      data: { id: randomUUID(), userId, method: loginMethod(provider) },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message.trim().split('\n').pop() : String(e)
    console.error('[login-events] write failed:', (e as { code?: string })?.code ?? '', msg)
  }
}

/** Auth.js `events.signIn` handler. Never throws. */
export async function onSignInEvent(message: {
  user?: { id?: string | null } | null
  account?: { provider?: string | null } | null
}): Promise<void> {
  await recordLoginEvent(message?.user?.id, message?.account?.provider)
}
