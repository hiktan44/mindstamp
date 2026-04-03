import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analitik</h2>
        <p className="text-muted-foreground">
          Platform üzerindeki tüm videolarınızın istatistikleri ve performans analizleri.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Genel Bakış
          </CardTitle>
          <CardDescription>
            Gelişmiş analitik sistemi yakında eklenecektir.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Grafikler Yükleniyor</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            İzleyici etkileşimleri, tıklama oranları ve demografik veriler bu ekranda görüntülenecektir. 
            Bu özellik geliştirme aşamasındadır.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
