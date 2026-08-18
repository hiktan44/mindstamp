import { notFound } from 'next/navigation'
import { InteractivePlayer } from '@/components/player/interactive-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Share2, Eye, Clock, Lock } from 'lucide-react'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canWatchVideo } from '@/lib/video/access'
import { PasswordGate } from '@/components/player/password-gate'
import { SeekButton } from '@/components/player/seek-button'

interface WatchPageProps {
  params: {
    id: string
  }
}

async function getVideo(id: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { startTime: 'asc' },
        },
        chapters: {
          orderBy: { startTime: 'asc' },
        },
        captions: true,
        transcripts: true,
        endScreens: true,
      },
    })
    return video
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const video = await getVideo(params.id)

  if (!video) {
    return {
      title: 'Video Bulunamadı',
    }
  }

  return {
    title: video.title,
    description: video.description || 'interaktiff - İnteraktif Video',
    openGraph: {
      title: video.title,
      description: video.description || 'interaktiff - İnteraktif Video',
      images: [video.thumbnailUrl || ''],
    },
  }
}

export default async function WatchPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const video = await getVideo(params.id)

  if (!video) {
    notFound()
  }

  const session = await auth()
  const access = await canWatchVideo(video, session?.user?.id)

  if (!access.allowed && access.reason === 'password_required') {
    return <PasswordGate videoId={video.id} />
  }

  if (!access.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Video Henüz Yayında Değil</h2>
            <p className="text-muted-foreground mb-6">
              Bu videoyu görüntülemek için yetkiniz yok veya video henüz yayınlanmamış.
            </p>
            <Button>
              <a href="/">Ana Sayfaya Dön</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md shadow-fuchsia-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">interaktiff</span>
          </div>

          <Button variant="outline" size="sm">
            <a href="/giris">Giriş Yap</a>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player */}
            <div className="overflow-hidden rounded-xl bg-black shadow-lg">
              <InteractivePlayer video={video} />
            </div>

            {/* Video Info */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              {video.description && (
                <p className="text-muted-foreground">{video.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-sky-500" />
                <span>{video.viewCount || 0} görüntülenme</span>
              </div>
              {video.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-violet-500" />
                  <span>{Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Paylaş
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Interactions List */}
            {(video.interactions?.length || 0) > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-fuchsia-500" />
                    Etkileşimler
                  </h3>
                  <div className="space-y-2">
                    {video.interactions.map((interaction: any, index: number) => {
                      const time = Math.floor(interaction.startTime)
                      const minutes = Math.floor(time / 60)
                      const seconds = time % 60

                      return (
                        <SeekButton key={interaction.id} time={interaction.startTime}>
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white text-xs font-mono shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {interaction.config.text ||
                               interaction.config.question ||
                               interaction.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {minutes}:{seconds.toString().padStart(2, '0')}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {interaction.type}
                          </Badge>
                        </SeekButton>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapters */}
            {video.chapters && video.chapters.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <span className="h-4 w-1 rounded-full bg-gradient-to-b from-sky-500 to-emerald-500" />
                    Bölümler
                  </h3>
                  <div className="space-y-2">
                    {video.chapters.map((chapter: any) => {
                      const time = Math.floor(chapter.startTime)
                      const minutes = Math.floor(time / 60)
                      const seconds = time % 60

                      return (
                        <SeekButton key={chapter.id} time={chapter.startTime}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{chapter.title}</p>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                          </span>
                        </SeekButton>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Kendi Videonu Oluştur</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Videolarınıza etkileşimli öğeler ekleyin
                </p>
                <Button className="w-full">
                  <a href="/kayit">Ücretsiz Dene</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">interaktiff</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
