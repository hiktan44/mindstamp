import { prisma } from '@/lib/db'

export async function getOwnedVideo(videoId: string, userId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, userId: true },
  })

  if (!video) return { video: null, status: 404 as const }
  if (video.userId !== userId) return { video: null, status: 403 as const }

  return { video, status: 200 as const }
}

