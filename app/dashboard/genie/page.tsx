import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function GenieAIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Genie AI</h2>
        <p className="text-muted-foreground">
          Yapay zeka asistanı ile videolarınıza otomatik etkileşimler ekleyin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Yapay Zeka Destekli Video Tasarımı
          </CardTitle>
          <CardDescription>
            Genie AI sihirbazı yakında aktif olacak.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Büyü Hazırlanıyor</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Videolarınızı yapay zeka ile otomatik analiz edip içerisine quiz, anket veya dokunmatik butonları kendi yerleştiren Genie AI modülü çok yakında sizinle!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
