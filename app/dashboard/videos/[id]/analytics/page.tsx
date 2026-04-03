'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Clock,
  Download,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

export default function VideoAnalyticsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [video, setVideo] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    fetchVideo()
    fetchAnalytics()
  }, [params.id, dateRange])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`)
      if (!response.ok) throw new Error('Video bulunamadı')
      const { video } = await response.json()
      setVideo(video)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      // Mock analytics data - gerçek API'den gelecek
      setAnalytics({
        summary: {
          totalViews: 0,
          uniqueViewers: 0,
          avgWatchTime: 0,
          completionRate: 0,
        },
        viewsOverTime: [],
        topInteractions: [],
        devices: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
        },
        locations: [],
      })
    } catch (error) {
      console.error('Analytics fetch error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Video bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Link href={`/dashboard/videos/${params.id}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{video.title}</h2>
            <p className="text-sm text-muted-foreground">Analitik</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value || '30d')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 90 Gün</SelectItem>
              <SelectItem value="all">Tüm Zamanlar</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Görüntülenme
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.summary.totalViews || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === '7d' && 'Son 7 gün'}
              {dateRange === '30d' && 'Son 30 gün'}
              {dateRange === '90d' && 'Son 90 gün'}
              {dateRange === 'all' && 'Tüm zamanlar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Benzersiz İzleyici
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.summary.uniqueViewers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam izleyici
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama İzleme Süresi
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.summary.avgWatchTime
                ? `${Math.floor(analytics.summary.avgWatchTime / 60)}:${Math.floor(analytics.summary.avgWatchTime % 60).toString().padStart(2, '0')}`
                : '0:00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Dakika:saniye
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tamamlanma Oranı
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{analytics?.summary.completionRate || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Videoyu bitirenler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="views" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="views">
            <Eye className="mr-2 h-4 w-4" />
            Görüntülenme
          </TabsTrigger>
          <TabsTrigger value="interactions">
            <MousePointerClick className="mr-2 h-4 w-4" />
            Etkileşimler
          </TabsTrigger>
          <TabsTrigger value="viewers">
            <Users className="mr-2 h-4 w-4" />
            İzleyiciler
          </TabsTrigger>
          <TabsTrigger value="demographics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Demografik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Görüntülenme Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Grafik yakında eklenecek</p>
                  <p className="text-sm">Veri toplandığında görüntülenecek</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retention (Tutma) Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  İzleyicilerin video boyunca ne kadar kaldığını gösterir
                </p>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Retention grafiği yakında</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etkileşim Performansı</CardTitle>
            </CardHeader>
            <CardContent>
              {(video.interactions?.length || 0) > 0 ? (
                <div className="space-y-4">
                  {video.interactions.map((interaction: any) => (
                    <div
                      key={interaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {interaction.config.text ||
                           interaction.config.question ||
                           interaction.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {interaction.type} • {Math.floor(interaction.startTime)}s
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Tıklama</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MousePointerClick className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Henüz etkileşim eklenmemiş
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                   
                  >
                    <Link href={`/dashboard/videos/${params.id}/edit`}>
                      İlk Etkileşimi Ekle
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Heat Map</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Video boyunca en çok etkileşim alan bölgeler
              </p>
              <div className="h-[100px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Heat map yakında</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İzleyici Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Henüz izleyici verisi yok
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Video paylaşıldığında izleyici verileri burada görüntülenecek
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cihazlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Masaüstü</span>
                      <span className="text-sm font-medium">
                        {analytics?.devices.desktop || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(analytics?.devices.desktop || 0) / Math.max((analytics?.devices.desktop || 0) + (analytics?.devices.mobile || 0) + (analytics?.devices.tablet || 0), 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Mobil</span>
                      <span className="text-sm font-medium">
                        {analytics?.devices.mobile || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(analytics?.devices.mobile || 0) / Math.max((analytics?.devices.desktop || 0) + (analytics?.devices.mobile || 0) + (analytics?.devices.tablet || 0), 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Tablet</span>
                      <span className="text-sm font-medium">
                        {analytics?.devices.tablet || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(analytics?.devices.tablet || 0) / Math.max((analytics?.devices.desktop || 0) + (analytics?.devices.mobile || 0) + (analytics?.devices.tablet || 0), 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Konum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Konum verisi yakında
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
