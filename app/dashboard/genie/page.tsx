import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Sparkles, MessageSquare, ListVideo } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function GenieAIPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return <div>Oturum bulunamadı.</div>
  }

  // AI transkripti olan videoları bul (Genie AI'a hazır)
  const readyVideos = await prisma.video.findMany({
    where: { 
      userId: session.user.id,
      transcripts: {
        some: {
          isAiGenerated: true
        }
      }
    },
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Yüklenmiş ama AI transkripti olmayan videolar
  const pendingVideos = await prisma.video.count({
    where: { 
      userId: session.user.id,
      transcripts: {
        none: {
          isAiGenerated: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Genie AI</h2>
        <p className="text-muted-foreground">
          Yapay zeka asistanı, izleyicilerinizin video içerikleriyle gerçek zamanlı sohbet etmesini sağlar.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Hazır Videolar
            </CardTitle>
            <CardDescription>
              Aşağıdaki videolar Genie AI ile kullanılmaya hazır, çünkü sisteme kaydedilmiş transkriptleri (altyazıları) mevcut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">{readyVideos.length}</div>
            <p className="text-sm">Video, izleyicilerinizden soru almaya hazır.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-muted-foreground" />
              İşlem Bekleyenler
            </CardTitle>
            <CardDescription>
              Genie AI'ın yanıt verebilmesi için, videoların içeriğini bilmesi gerekir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{pendingVideos}</div>
            <p className="text-sm text-muted-foreground">Videonuz için metin dökümü (Transkript) çıkarılması bekleniyor.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/videos" className={cn(buttonVariants({ variant: 'outline' }), "w-full")}>
              Videolarım'a Git
            </Link>
          </CardFooter>
        </Card>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Genie AI Aktif Videolar</h3>
      
      {readyVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Genie AI aktif video bulunamadı</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Videolarınızı düzenleyip "Transkript Ekle" veya "Otomatik Altyazı Oluştur" seçeneğiyle Genie AI'ı aktif hale getirebilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {readyVideos.map((v: any) => (
            <Card key={v.id} className="flex flex-col overflow-hidden">
              <div className="bg-muted aspect-video w-full overflow-hidden border-b relative">
                {v.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ListVideo className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                  <Sparkles className="h-3 w-3" /> Aktif
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{v.title}</CardTitle>
                <CardDescription className="text-xs">
                  {v.createdAt.toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardFooter className="px-4 pb-4 pt-0">
                <Link href={`/dashboard/videos/${v.id}/edit`} className={cn(buttonVariants({ variant: 'secondary' }), "w-full")}>
                  AI Karakterini Özelleştir
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
