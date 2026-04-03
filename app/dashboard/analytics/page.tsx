import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, MousePointerClick, PlayCircle } from 'lucide-react'

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return <div>Oturum bulunamadı.</div>
  }

  // Kullanıcının tüm videolarını çek
  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      viewCount: true,
      interactionCount: true,
      createdAt: true
    },
    orderBy: { viewCount: 'desc' },
    take: 10
  })

  // Analitik verilerini topla
  const totalViews = videos.reduce((sum: number, v: any) => sum + v.viewCount, 0)
  const totalInteractions = videos.reduce((sum: number, v: any) => sum + v.interactionCount, 0)
  const totalVideos = videos.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analitik</h2>
        <p className="text-muted-foreground">
          Platform üzerindeki videolarınızın performans ve etkileşim analizleri.
        </p>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Tüm zamanların görüntelenmesi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Etkileşim</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Tıklanan buton ve bağlantılar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Videolar</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Yayında olan videolarınız
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Etkileşim Oranı</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews > 0 ? Math.round((totalInteractions / totalViews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Görüntülenme başına düşen etkileşim
            </p>
          </CardContent>
        </Card>
      </div>

      {/* En Çok İzlenen Videolar */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok İzlenen Videolar</CardTitle>
          <CardDescription>
            En iyi performans gösteren içeriklerinizin detaylı analizi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Henüz analiz edilecek video verisi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video: any) => (
                <div key={video.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Yüklenme: {video.createdAt.toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{video.viewCount}</p>
                      <p className="text-xs text-muted-foreground">Görüntülenme</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{video.interactionCount}</p>
                      <p className="text-xs text-muted-foreground">Etkileşim</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
