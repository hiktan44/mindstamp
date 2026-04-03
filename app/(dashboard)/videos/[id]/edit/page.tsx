'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VideoEditor } from '@/components/editor/editor-layout'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Palette,
  Layout as LayoutIcon,
} from 'lucide-react'
import Link from 'next/link'

export default function VideoEditPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('editor')
  const [hasChanges, setHasChanges] = useState(false)

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

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video),
      })

      if (!response.ok) throw new Error('Kaydetme başarısız')

      setHasChanges(false)
      // Show success toast
    } catch (error) {
      console.error('Save error:', error)
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
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/videos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{video.title}</h2>
              <Badge
                variant={
                  video.status === 'PUBLISHED' ? 'default' :
                  video.status === 'DRAFT' ? 'secondary' :
                  'outline'
                }
              >
                {video.status === 'PUBLISHED' ? 'Yayında' :
                 video.status === 'DRAFT' ? 'Taslak' :
                 video.status === 'PROCESSING' ? 'İşleniyor' :
                 'Hata'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : '--:--'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/watch/${video.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Önizle
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {hasChanges ? 'Kaydet*' : 'Kaydedildi'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">
            <LayoutIcon className="mr-2 h-4 w-4" />
            Editör
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="mr-2 h-4 w-4" />
            Tasarım
          </TabsTrigger>
          <TabsTrigger value="share">
            <Eye className="mr-2 h-4 w-4" />
            Paylaş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <VideoEditor videoId={params.id} initialVideo={video} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Video Ayarları</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={video.title}
                      onChange={(e) => {
                        setVideo({ ...video, title: e.target.value })
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={video.description || ''}
                      onChange={(e) => {
                        setVideo({ ...video, description: e.target.value })
                        setHasChanges(true)
                      }}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <select
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={video.status}
                      onChange={(e) => {
                        setVideo({ ...video, status: e.target.value })
                        setHasChanges(true)
                      }}
                    >
                      <option value="DRAFT">Taslak</option>
                      <option value="PUBLISHED">Yayında</option>
                      <option value="ARCHIVED">Arşiv</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Gizlilik</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="privacy">Gizlilik Seviyesi</Label>
                    <select
                      id="privacy"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => {
                        setVideo({
                          ...video,
                          settings: { ...video.settings, privacy: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      defaultValue={video.settings?.privacy || 'link'}
                    >
                      <option value="link">Herkes link ile erişebilir</option>
                      <option value="password">Şifre korumalı</option>
                      <option value="private">Sadece ben</option>
                    </select>
                  </div>

                  {video.settings?.privacy === 'password' && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Şifre girin"
                        onChange={(e) => {
                          setVideo({
                            ...video,
                            settings: { ...video.settings, password: e.target.value }
                          })
                          setHasChanges(true)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tasarım Ayarları</h3>
              <p className="text-muted-foreground">
                Global tasarım ayarları yakında eklenecek...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Paylaşım</h3>
                {video.status === 'PUBLISHED' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Video Linki</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/watch/${video.id}`}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/watch/${video.id}`)
                          }}
                        >
                          Kopyala
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Embed Kodu</Label>
                      <div className="space-y-2">
                        <Textarea
                          readOnly
                          value={`<iframe src="${window.location.origin}/embed/${video.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`}
                          rows={3}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`<iframe src="${window.location.origin}/embed/${video.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`)
                          }}
                        >
                          Kopyala
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      Videoyu paylaşmak için önce yayınlamanız gerekiyor
                    </p>
                    <Button
                      onClick={() => {
                        setVideo({ ...video, status: 'PUBLISHED', publishedAt: new Date() })
                        setHasChanges(true)
                      }}
                    >
                      Yayınla
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
