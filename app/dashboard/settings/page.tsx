import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">
          Hesap bilgilerinizi ve proje tercihlerinizi yapılandırın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Profil ve Hesap Özelleştirmeleri
          </CardTitle>
          <CardDescription>
            Sistem ayarları menüsü yapım aşamasındadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
          <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Konfigürasyon Paneli</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Fatura, API entegrasyonları, kullanıcı rolleri ve profil kişiselleştirme ayarları en kısa sürede aktif hale getirilecektir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
