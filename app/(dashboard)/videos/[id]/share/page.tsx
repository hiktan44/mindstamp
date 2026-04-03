'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Link2,
  Code2,
  Share2,
  Mail,
  CheckCircle2,
  Copy,
  QrCode,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function VideoSharePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetchVideo()
  }, [params.id])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`)
      if (!response.ok) throw new Error('Video bulunamadı')

      const { video } = await response.json()
      setVideo(video)
    } catch (error) {
      console.error('Fetch error:', error)
      router.push('/dashboard/videos')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success('Kopyalandı!')
    setTimeout(() => setCopied(null), 2000)
  }

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
          publishedAt: new Date(),
        }),
      })

      if (!response.ok) throw new Error('Yayınlanama başarısız')

      const { video } = await response.json()
      setVideo(video)
      toast.success('Video başarıyla yayınlandı!')
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Yayınlanırken bir hata oluştu')
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

  const videoUrl = `${window.location.origin}/watch/${video.id}`
  const embedCode = `<iframe src="${window.location.origin}/embed/${video.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paylaşım</h2>
          <p className="text-muted-foreground">
            &quot;{video.title}&quot; videosunu paylaşın
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/videos/${params.id}/edit`}>
            Düzenlemeye Dön
          </Link>
        </Button>
      </div>

      {/* Status Warning */}
      {video.status !== 'PUBLISHED' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200 dark:bg-yellow-900">
                <Share2 className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Video henüz yayında değil
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Videoyu paylaşmak için önce yayınlamanız gerekiyor
                </p>
              </div>
              <Button onClick={handlePublish}>
                Yayınla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Options */}
      <Tabs defaultValue="link" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="link">
            <Link2 className="mr-2 h-4 w-4" />
            Link
          </TabsTrigger>
          <TabsTrigger value="embed">
            <Code2 className="mr-2 h-4 w-4" />
            Göm
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="mr-2 h-4 w-4" />
            Sosyal
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            E-posta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Linki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Genel Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={videoUrl}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleCopy(videoUrl, 'link')}
                    variant={copied === 'link' ? 'default' : 'outline'}
                  >
                    {copied === 'link' ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Sosyal Medyada Paylaş</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank')}
                    title="Facebook'ta paylaş"
                  >
                    <span className="text-blue-600 font-bold">f</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}`, '_blank')}
                    title="X'te paylaş"
                  >
                    <span className="text-sky-500 font-bold">X</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`, '_blank')}
                    title="LinkedIn'da paylaş"
                  >
                    <span className="text-blue-700 font-bold">in</span>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Kod Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Kodu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Standart Embed</Label>
                <Textarea
                  readOnly
                  value={embedCode}
                  rows={4}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => handleCopy(embedCode, 'embed')}
                  className="w-full"
                >
                  {copied === 'embed' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Kodu Kopyala
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label>Önizleme</Label>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Embed önizleme</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Gelişmiş Seçenekler</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay">Otomatik Oynat</Label>
                    <input
                      type="checkbox"
                      id="autoplay"
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="controls">Kontrolleri Göster</Label>
                    <input
                      type="checkbox"
                      id="controls"
                      className="h-4 w-4"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop">Döngü</Label>
                    <input
                      type="checkbox"
                      id="loop"
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya Paylaşımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}&quote=${encodeURIComponent(video.title)}`, '_blank')}
                >
                  <span className="mr-3 h-5 w-5 flex items-center justify-center text-blue-600 font-bold">f</span>
                  <div className="text-left">
                    <div className="font-medium">Facebook</div>
                    <div className="text-sm text-muted-foreground">
                      Zaman tünelinde veya grupta paylaş
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(video.title)}`, '_blank')}
                >
                  <span className="mr-3 h-5 w-5 flex items-center justify-center text-sky-500 font-bold">X</span>
                  <div className="text-left">
                    <div className="font-medium">X (Twitter)</div>
                    <div className="text-sm text-muted-foreground">
                      Tweet olarak paylaş
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`, '_blank')}
                >
                  <span className="mr-3 h-5 w-5 flex items-center justify-center text-blue-700 font-bold">in</span>
                  <div className="text-left">
                    <div className="font-medium">LinkedIn</div>
                    <div className="text-sm text-muted-foreground">
                      Ağınızda paylaş
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-posta ile Paylaş</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Alıcı E-posta Adresleri</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com, another@email.com"
                  multiple
                />
                <p className="text-xs text-muted-foreground">
                  Birden fazla e-posta için virgül kullanın
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  defaultValue={`${video.title} - İzleyin`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mesaj</Label>
                <Textarea
                  id="message"
                  rows={4}
                  defaultValue={`Merhaba,\n\nBu ilginç videoyu izlemenizi istedim:\n\n${videoUrl}\n\nSaygılar,`}
                />
              </div>

              <Button className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                E-posta Gönder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Paylaşım İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Görüntülenme</p>
              <p className="text-2xl font-bold">{video.viewCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Etkileşim Sayısı</p>
              <p className="text-2xl font-bold">{video.interactionCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paylaşım Tarihi</p>
              <p className="text-2xl font-bold">
                {video.publishedAt
                  ? new Date(video.publishedAt).toLocaleDateString('tr-TR')
                  : 'Yayınlanmadı'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
