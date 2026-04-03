import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Plus, BarChart3, Users, TrendingUp } from 'lucide-react'

const quickStats = [
  {
    title: 'Toplam Video',
    value: '0',
    description: 'Video kütüphaneniz',
    icon: Video,
  },
  {
    title: 'Toplam Görüntülenme',
    value: '0',
    description: 'Son 30 gün',
    icon: BarChart3,
  },
  {
    title: 'Benzzersiz İzleyici',
    value: '0',
    description: 'Son 30 gün',
    icon: Users,
  },
  {
    title: 'Etkileşim Oranı',
    value: '%0',
    description: 'Ortalama',
    icon: TrendingUp,
  },
]

const quickActions = [
  {
    title: 'Yeni Video Oluştur',
    description: 'Video yükleyin veya URL ekleyin',
    icon: Plus,
    href: '/dashboard/videos/new',
    variant: 'default' as const,
  },
  {
    title: 'Videoları Görüntüle',
    description: 'Tüm videolarınızı yönetin',
    icon: Video,
    href: '/dashboard/videos',
    variant: 'outline' as const,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Hoş geldiniz! İşte video platformunuzun özeti.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant={action.variant}
                className="w-full"
                onClick={() => window.location.href = action.href}
              >
                {action.title === 'Yeni Video Oluştur' ? 'Başla' : 'Görüntüle'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Başlangıç Rehberi</CardTitle>
          <CardDescription>
            Platformu kullanmaya başlamak için bu adımları takip edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <span>
                <strong className="text-foreground">Video Yükleyin:</strong>{' '}
                MP4, MOV veya WEBM formatında video yükleyin veya YouTube/Vimeo URL'i ekleyin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                2
              </span>
              <span>
                <strong className="text-foreground">Etkileşim Ekleyin:</strong>{' '}
                Butonlar, sorular, metinler ve daha fazlasını video üzerine ekleyin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                3
              </span>
              <span>
                <strong className="text-foreground">Tasarlayın:</strong>{' '}
                Renkleri, fontları ve stilleri markanıza göre özelleştirin
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                4
              </span>
              <span>
                <strong className="text-foreground">Yayınlayın:</strong>{' '}
                Videoyu paylaşın, gömün ve analizleri izleyin
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
