'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VideoEditor, type VideoEditorHandle } from '@/components/editor/editor-layout'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Palette,
  Layout as LayoutIcon,
  GraduationCap,
  Plus,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

export default function VideoEditPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('editor')
  const [hasChanges, setHasChanges] = useState(false)
  const [editorHasChanges, setEditorHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const editorRef = useRef<VideoEditorHandle>(null)

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
    if (activeTab === 'editor') {
      await editorRef.current?.save()
      return
    }

    setSaving(true)
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
    } finally {
      setSaving(false)
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
          <Button variant="outline">
            <Link href={`/watch/${video.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Önizle
            </Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (activeTab === 'editor' ? !editorHasChanges : !hasChanges)}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Kaydediliyor...' : (activeTab === 'editor' ? editorHasChanges : hasChanges) ? 'Kaydet*' : 'Kaydedildi'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value || 'editor')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="learning">
            <GraduationCap className="mr-2 h-4 w-4" />
            Eğitim
          </TabsTrigger>
          <TabsTrigger value="share">
            <Eye className="mr-2 h-4 w-4" />
            Paylaş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <VideoEditor
            ref={editorRef}
            videoId={params.id}
            initialVideo={video}
            onDirtyChange={setEditorHasChanges}
            onSaved={(savedVideo) => {
              if (savedVideo) setVideo(savedVideo)
              setEditorHasChanges(false)
              setHasChanges(false)
            }}
          />
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
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Lead Capture (Veri Toplama)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lead-enabled"
                      checked={video.settings?.leadCapture?.enabled || false}
                      onChange={(e) => {
                        setVideo({
                          ...video,
                          settings: {
                            ...video.settings,
                            leadCapture: { ...video.settings?.leadCapture, enabled: e.target.checked }
                          }
                        })
                        setHasChanges(true)
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="lead-enabled">Müşteri Formunu Aktifleştir</Label>
                  </div>
                  {video.settings?.leadCapture?.enabled && (
                    <div className="pl-6 space-y-4 border-l-2">
                      <div className="space-y-2">
                        <Label>Form Başlığı / Mesajı</Label>
                        <Input
                          value={video.settings?.leadCapture?.title || 'Videoyu izlemek için formu doldurun'}
                          onChange={(e) => {
                            setVideo({
                              ...video,
                              settings: {
                                ...video.settings,
                                leadCapture: { ...video.settings?.leadCapture, title: e.target.value }
                              }
                            })
                            setHasChanges(true)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Görünme Zamanı (Saniye)</Label>
                        <Input
                          type="number"
                          value={video.settings?.leadCapture?.time ?? 0}
                          onChange={(e) => {
                            setVideo({
                              ...video,
                              settings: {
                                ...video.settings,
                                leadCapture: { ...video.settings?.leadCapture, time: parseInt(e.target.value) }
                              }
                            })
                            setHasChanges(true)
                          }}
                        />
                        <p className="text-xs text-muted-foreground">0 = Video başlamadan önce</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={video.settings?.leadCapture?.requireName || false}
                            onChange={(e) => {
                              setVideo({
                                ...video,
                                settings: {
                                  ...video.settings,
                                  leadCapture: { ...video.settings?.leadCapture, requireName: e.target.checked }
                                }
                              })
                              setHasChanges(true)
                            }}
                          />
                          <Label>İsim İste</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={video.settings?.leadCapture?.requirePhone || false}
                            onChange={(e) => {
                              setVideo({
                                ...video,
                                settings: {
                                  ...video.settings,
                                  leadCapture: { ...video.settings?.leadCapture, requirePhone: e.target.checked }
                                }
                              })
                              setHasChanges(true)
                            }}
                          />
                          <Label>Telefon İste</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Magic Menu</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="magic-enabled"
                      checked={video.settings?.magicMenu?.enabled || false}
                      onChange={(e) => {
                        setVideo({
                          ...video,
                          settings: {
                            ...video.settings,
                            magicMenu: { ...video.settings?.magicMenu, enabled: e.target.checked }
                          }
                        })
                        setHasChanges(true)
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <Label htmlFor="magic-enabled">Sihirli Menüyü Aktifleştir (Videoda her zaman görünen bağlantılar)</Label>
                  </div>
                  
                  {video.settings?.magicMenu?.enabled && (
                    <div className="pl-6 space-y-4">
                      <div className="space-y-4">
                        <Label>Menü Linkleri</Label>
                        {(video.settings?.magicMenu?.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder="Buton İsmi (örn: İletişim)"
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...(video.settings.magicMenu.items || [])]
                                newItems[idx].label = e.target.value
                                setVideo({
                                  ...video,
                                  settings: {
                                    ...video.settings,
                                    magicMenu: { ...video.settings.magicMenu, items: newItems }
                                  }
                                })
                                setHasChanges(true)
                              }}
                            />
                            <Input
                              placeholder="URL (örn: https://...)"
                              value={item.url}
                              onChange={(e) => {
                                const newItems = [...(video.settings.magicMenu.items || [])]
                                newItems[idx].url = e.target.value
                                setVideo({
                                  ...video,
                                  settings: {
                                    ...video.settings,
                                    magicMenu: { ...video.settings.magicMenu, items: newItems }
                                  }
                                })
                                setHasChanges(true)
                              }}
                            />
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                const newItems = [...(video.settings.magicMenu.items || [])]
                                newItems.splice(idx, 1)
                                setVideo({
                                  ...video,
                                  settings: {
                                    ...video.settings,
                                    magicMenu: { ...video.settings.magicMenu, items: newItems }
                                  }
                                })
                                setHasChanges(true)
                              }}
                            >Sil</Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newItems = [...(video.settings?.magicMenu?.items || []), { label: '', url: '' }]
                            setVideo({
                              ...video,
                              settings: {
                                ...video.settings,
                                magicMenu: { ...video.settings?.magicMenu, items: newItems }
                              }
                            })
                            setHasChanges(true)
                          }}
                        >
                          + Yeni Link Ekle
                        </Button>
                      </div>
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

        <TabsContent value="learning" className="mt-6">
          <LearningSettings video={video} onRefresh={fetchVideo} />
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
                          value={`<iframe src="${window.location.origin}/embed/${video.id}?controls=1" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`}
                          rows={3}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`<iframe src="${window.location.origin}/embed/${video.id}?controls=1" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`)
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

function LearningSettings({ video, onRefresh }: { video: any; onRefresh: () => Promise<void> }) {
  const [chapters, setChapters] = useState(
    video.chapters?.length
      ? video.chapters
      : [{ title: 'Giriş', startTime: 0, endTime: null, order: 0 }]
  )
  const [transcript, setTranscript] = useState(video.transcripts?.[0]?.content || '')
  const [endScreen, setEndScreen] = useState({
    enabled: video.endScreens?.[0]?.enabled ?? false,
    message: video.endScreens?.[0]?.message || 'Video tamamlandı',
    buttonLabel: video.endScreens?.[0]?.buttonConfig?.label || '',
    buttonUrl: video.endScreens?.[0]?.buttonConfig?.url || '',
  })
  const [saving, setSaving] = useState(false)

  const saveLearningSettings = async () => {
    setSaving(true)
    try {
      await fetch(`/api/videos/${video.id}/chapters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: chapters.map((chapter: any, index: number) => ({
            title: chapter.title,
            startTime: Number(chapter.startTime) || 0,
            endTime: chapter.endTime === '' || chapter.endTime === null ? null : Number(chapter.endTime),
            order: index,
          })),
        }),
      })

      if (transcript.trim()) {
        await fetch(`/api/videos/${video.id}/transcript`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: transcript,
            language: 'tr',
            isAiGenerated: false,
          }),
        })
      }

      await fetch(`/api/videos/${video.id}/end-screen`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: endScreen.enabled,
          message: endScreen.message,
          layout: 'score-summary',
          buttonConfig: endScreen.buttonUrl
            ? { label: endScreen.buttonLabel || 'Devam Et', url: endScreen.buttonUrl }
            : {},
        }),
      })

      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Bölümler</h3>
              <p className="text-sm text-muted-foreground">İzleyici sidebar’ında görünen chapter zamanları.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setChapters([...chapters, { title: '', startTime: 0, endTime: null, order: chapters.length }])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Bölüm Ekle
            </Button>
          </div>

          <div className="space-y-3">
            {chapters.map((chapter: any, index: number) => (
              <div key={index} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_120px_120px_40px]">
                <Input
                  value={chapter.title}
                  placeholder="Bölüm adı"
                  onChange={(event) => {
                    const next = [...chapters]
                    next[index] = { ...chapter, title: event.target.value }
                    setChapters(next)
                  }}
                />
                <Input
                  type="number"
                  value={chapter.startTime}
                  placeholder="Başlangıç"
                  onChange={(event) => {
                    const next = [...chapters]
                    next[index] = { ...chapter, startTime: event.target.value }
                    setChapters(next)
                  }}
                />
                <Input
                  type="number"
                  value={chapter.endTime || ''}
                  placeholder="Bitiş"
                  onChange={(event) => {
                    const next = [...chapters]
                    next[index] = { ...chapter, endTime: event.target.value }
                    setChapters(next)
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChapters(chapters.filter((_: any, chapterIndex: number) => chapterIndex !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 border-t pt-6">
          <h3 className="text-lg font-semibold">Transkript</h3>
          <Textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={8}
            placeholder="Video transkriptini buraya yapıştırın..."
          />
        </section>

        <section className="space-y-4 border-t pt-6">
          <div className="flex items-center gap-2">
            <input
              id="end-screen-enabled"
              type="checkbox"
              checked={endScreen.enabled}
              onChange={(event) => setEndScreen({ ...endScreen, enabled: event.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="end-screen-enabled">Bitiş ekranını aktifleştir</Label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              value={endScreen.message}
              onChange={(event) => setEndScreen({ ...endScreen, message: event.target.value })}
              placeholder="Bitiş mesajı"
            />
            <Input
              value={endScreen.buttonLabel}
              onChange={(event) => setEndScreen({ ...endScreen, buttonLabel: event.target.value })}
              placeholder="Buton etiketi"
            />
            <Input
              value={endScreen.buttonUrl}
              onChange={(event) => setEndScreen({ ...endScreen, buttonUrl: event.target.value })}
              placeholder="Buton URL"
            />
          </div>
        </section>

        <Button onClick={saveLearningSettings} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Eğitim Ayarlarını Kaydet'}
        </Button>
      </CardContent>
    </Card>
  )
}
