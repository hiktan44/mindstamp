import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Video,
  MousePointerClick,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: Video,
    title: 'Video Yükleme',
    description: 'MP4, MOV, WEBM formatında video yükleyin veya YouTube/Vimeo URL\'i ekleyin',
  },
  {
    icon: MousePointerClick,
    title: 'Etkileşimli Öğeler',
    description: 'Butonlar, sorular, hotspot\'lar, metinler ve daha fazlasını video üzerine ekleyin',
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analitik',
    description: 'Görüntülenme, etkileşim ve izleyici verilerini detaylı analiz edin',
  },
  {
    icon: Sparkles,
    title: 'Genie AI',
    description: 'Video transkript üzerinde eğitilmiş AI sohbet asistanı ile etkileşime girin',
  },
]

const useCases = [
  'Eğitim ve e-öğrenme platformları',
  'Kurumsal eğitimler',
  'E-ticaret ürün tanıtımları',
  'Pazarlama kampanyaları',
  'Online kurslar',
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Videolarınızı{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Etkileşimli
              </span>{' '}
              Hale Getirin
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Mevcut videolarınıza butonlar, sorular ve daha fazla etkileşimli öğe ekleyerek
              dinamik, ölçülebilir ve kişiselleştirilmiş deneyimler oluşturun.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/kayit">
                <Button
                  size="lg"
                  className="min-w-[160px]"
                >
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/giris">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[160px]"
                >
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b bg-background">
        <div className="container px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Güçlü Özellikler
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Video içeriklerinizi bir üst seviyeye taşıyın
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="border-b bg-muted/30">
        <div className="container px-4 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Her Sektör İçin İdeal
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Eğitimden e-ticarete, her sektör için interaktif video çözümleri
              </p>
              <ul className="mt-8 space-y-3">
                {useCases.map((useCase) => (
                  <li key={useCase} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-24 w-24 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b bg-background">
        <div className="container px-4 py-24">
          <Card className="mx-auto max-w-2xl text-center">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Hemen Başlayın
              </h2>
              <p className="mt-4 text-muted-foreground">
                Ücretsiz deneme ile platformu keşfedin. Kredi kartı gerekmez.
              </p>
              <Link href="/kayit">
                <Button
                  size="lg"
                  className="mt-8"
                >
                  Ücretsiz Dene
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Video className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Mindstamp Klonu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Mindstamp Klonu. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
