import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canWatchVideo } from '@/lib/video/access'
import { PasswordGate } from '@/components/player/password-gate'
import { InteractivePlayer } from '@/components/player/interactive-player'

export default async function EmbedPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      interactions: { orderBy: { startTime: 'asc' } },
      chapters: { orderBy: { startTime: 'asc' } },
      captions: true,
      transcripts: true,
      endScreens: true,
    },
  })

  if (!video) notFound()

  const session = await auth()
  const access = await canWatchVideo(video, session?.user?.id)

  if (!access.allowed && access.reason === 'password_required') {
    return <PasswordGate videoId={video.id} />
  }

  if (!access.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">
        <div>
          <h1 className="text-lg font-semibold">Video kullanılamıyor</h1>
          <p className="text-sm text-white/70 mt-2">Bu videoya erişim izniniz yok.</p>
        </div>
      </div>
    )
  }

  const autoplay = searchParams.autoplay === '1' || searchParams.autoplay === 'true'
  const muted = searchParams.muted === '1' || searchParams.muted === 'true'
  const controls = searchParams.controls !== '0' && searchParams.controls !== 'false'
  const startTime = Number(searchParams.t || searchParams.start || 0) || 0

  return (
    <main className="min-h-screen bg-black">
      <InteractivePlayer
        video={video}
        embed
        playerOptions={{ autoplay, muted, controls, startTime }}
      />
    </main>
  )
}

