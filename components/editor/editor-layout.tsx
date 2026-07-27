'use client'

import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react'
import { VideoPlayer } from '@/components/player/video-player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Eye,
  MousePointerClick,
  Type,
  Image as ImageIcon,
  HelpCircle,
  Layers,
  CheckCircle2,
  Film,
  MapPin,
  Music,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interaction {
  id: string
  type: 'BUTTON' | 'HOTSPOT' | 'QUESTION' | 'TEXT' | 'IMAGE' | 'VIDEO_CLIP' | 'AUDIO_CLIP' | 'MAP'
  startTime: number
  endTime?: number
  config: any
  position?: { x: number; y: number; width: number; height: number }
}

interface VideoEditorProps {
  videoId: string
  initialVideo?: {
    id: string
    title: string
    description?: string
    videoUrl?: string
    hlsUrl?: string
    thumbnailUrl?: string
    status: string
    interactions?: Interaction[]
    design?: any
  }
  onSaved?: (video: VideoEditorProps['initialVideo']) => void
  onDirtyChange?: (dirty: boolean) => void
}

const interactionTypes = [
  { type: 'BUTTON', label: 'Buton', icon: MousePointerClick, description: 'Tıklanabilir buton ekleyin' },
  { type: 'HOTSPOT', label: 'Hotspot', icon: Layers, description: 'Tıklanabilir alan ekleyin' },
  { type: 'QUESTION', label: 'Soru', icon: HelpCircle, description: 'Quiz/sınav sorusu ekleyin' },
  { type: 'TEXT', label: 'Metin', icon: Type, description: 'Renkli, stillendirilebilir metin ekleyin' },
  { type: 'IMAGE', label: 'Resim', icon: ImageIcon, description: 'Resim yükleyin veya URL ekleyin' },
  { type: 'VIDEO_CLIP', label: 'Video', icon: Film, description: 'Video klip yükleyin veya URL ekleyin' },
  { type: 'AUDIO_CLIP', label: 'Ses', icon: Music, description: 'Ses klibi ekleyin (araya)' },
  { type: 'MAP', label: 'Harita', icon: MapPin, description: 'Konum haritası ekleyin' },
]

const clickActions = [
  { value: 'CONTINUE', label: 'Devam Et' },
  { value: 'OPEN_LINK', label: 'Link Aç' },
  { value: 'CHANGE_TIME', label: 'Zamana Git' },
  { value: 'SWITCH_VIDEO', label: 'Videoya Geç' },
  { value: 'SHOW_MESSAGE', label: 'Mesaj Göster' },
  { value: 'PAUSE', label: 'Duraklat' },
]

const enterAnimations = [
  { value: 'none', label: 'Yok' },
  { value: 'fade', label: 'Belirme' },
  { value: 'slide-up', label: 'Aşağıdan kay' },
  { value: 'slide-down', label: 'Yukarıdan kay' },
  { value: 'slide-left', label: 'Sağdan kay' },
  { value: 'slide-right', label: 'Soldan kay' },
  { value: 'zoom', label: 'Yakınlaş' },
]

const shadowOptions = [
  { value: 'none', label: 'Yok' },
  { value: 'sm', label: 'Hafif' },
  { value: 'md', label: 'Orta' },
  { value: 'lg', label: 'Güçlü' },
  { value: 'glow', label: 'Parlama' },
]

export function shadowValue(s?: string): string | undefined {
  switch (s) {
    case 'sm':
      return '0 1px 3px rgba(0,0,0,0.3)'
    case 'md':
      return '0 4px 12px rgba(0,0,0,0.3)'
    case 'lg':
      return '0 10px 30px rgba(0,0,0,0.45)'
    case 'glow':
      return '0 0 22px rgba(59,130,246,0.75)'
    case 'none':
      return 'none'
    default:
      return undefined
  }
}

export function decorStyle(style: any = {}): React.CSSProperties {
  return {
    boxShadow: shadowValue(style?.boxShadow),
    border: style?.borderWidth
      ? `${style.borderWidth}px solid ${style.borderColor || '#ffffff'}`
      : undefined,
  }
}

export function enterAnimationClass(anim?: string): string {
  switch (anim) {
    case 'fade':
      return 'animate-in fade-in duration-500'
    case 'slide-up':
      return 'animate-in slide-in-from-bottom-6 fade-in duration-500'
    case 'slide-down':
      return 'animate-in slide-in-from-top-6 fade-in duration-500'
    case 'slide-left':
      return 'animate-in slide-in-from-right-6 fade-in duration-500'
    case 'slide-right':
      return 'animate-in slide-in-from-left-6 fade-in duration-500'
    case 'zoom':
      return 'animate-in zoom-in-95 fade-in duration-500'
    default:
      return ''
  }
}

export function exitAnimationClass(anim?: string): string {
  switch (anim) {
    case 'fade':
      return 'animate-out fade-out duration-500'
    case 'slide-up':
      return 'animate-out slide-out-to-top-6 fade-out duration-500'
    case 'slide-down':
      return 'animate-out slide-out-to-bottom-6 fade-out duration-500'
    case 'slide-left':
      return 'animate-out slide-out-to-left-6 fade-out duration-500'
    case 'slide-right':
      return 'animate-out slide-out-to-right-6 fade-out duration-500'
    case 'zoom':
      return 'animate-out zoom-out-95 fade-out duration-500'
    default:
      return ''
  }
}

const fontFamilies = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
]

export type VideoEditorHandle = {
  save: () => Promise<void>
}

export const VideoEditor = forwardRef<VideoEditorHandle, VideoEditorProps>(function VideoEditor(
  { videoId, initialVideo, onSaved, onDirtyChange },
  ref
) {
  const [video, setVideo] = useState(initialVideo)
  const [interactions, setInteractions] = useState<Interaction[]>(initialVideo?.interactions || [])
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [interactionFilter, setInteractionFilter] = useState<'ALL' | Interaction['type']>('ALL')
  const [addOpen, setAddOpen] = useState(false)
  const [listTab, setListTab] = useState<'all' | 'inserts'>('all')

  // Drag logic
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, startPosX: number, startPosY: number } | null>(null)
  const [resizeInfo, setResizeInfo] = useState<{ id: string, corner: 'nw' | 'ne' | 'sw' | 'se', startX: number, startY: number, startW: number, startH: number } | null>(null)
  const [snapGuides, setSnapGuides] = useState<{ v: boolean; h: boolean }>({ v: false, h: false })

  useEffect(() => {
    if (!dragInfo) return;
    
    const onPointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragInfo.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragInfo.startY) / rect.height) * 100;

      // Find current interaction state from ref
      setInteractions(prev => prev.map(i => {
        if (i.id === dragInfo.id && i.position) {
          let newX = Math.max(0, Math.min(100, dragInfo.startPosX + deltaX));
          let newY = Math.max(0, Math.min(100, dragInfo.startPosY + deltaY));

          // Snap to canvas center with alignment guides
          const showV = Math.abs(newX - 50) < 2.5;
          const showH = Math.abs(newY - 50) < 2.5;
          if (showV) newX = 50;
          if (showH) newY = 50;
          setSnapGuides({ v: showV, h: showH });

          if (selectedInteraction?.id === i.id) {
            setSelectedInteraction({ ...i, position: { ...i.position, x: newX, y: newY } });
          }
          return { ...i, position: { ...i.position, x: newX, y: newY } };
        }
        return i;
      }));
      setHasChanges(true);
    };

    const onPointerUp = () => {
      setDragInfo(null);
      setSnapGuides({ v: false, h: false });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
  }, [dragInfo, selectedInteraction]);

  // Resize (drag a corner handle). Element is centered on (x,y) so each corner
  // moves the size by 2x the pointer delta to track the cursor.
  useEffect(() => {
    if (!resizeInfo) return;

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - resizeInfo.startX;
      const dy = e.clientY - resizeInfo.startY;
      const signX = resizeInfo.corner === 'ne' || resizeInfo.corner === 'se' ? 1 : -1;
      const signY = resizeInfo.corner === 'sw' || resizeInfo.corner === 'se' ? 1 : -1;
      const newW = Math.max(24, Math.round(resizeInfo.startW + signX * 2 * dx));
      const newH = Math.max(24, Math.round(resizeInfo.startH + signY * 2 * dy));

      setInteractions(prev => prev.map(i => {
        if (i.id === resizeInfo.id && i.position) {
          const next = { ...i, position: { ...i.position, width: newW, height: newH } };
          if (selectedInteraction?.id === i.id) setSelectedInteraction(next);
          return next;
        }
        return i;
      }));
      setHasChanges(true);
    };

    const onPointerUp = () => setResizeInfo(null);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
  }, [resizeInfo, selectedInteraction]);

  useEffect(() => {
    onDirtyChange?.(hasChanges)
  }, [hasChanges, onDirtyChange])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      // Sanitize numeric fields so a cleared input (NaN) never triggers a silent 400.
      const num = (v: any, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback)
      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
      const sanitized = interactions.map((i) => ({
        ...i,
        startTime: num(i.startTime, 0),
        endTime: i.endTime == null ? null : num(i.endTime, undefined as any),
        position: i.position
          ? {
              x: clamp(num(i.position.x, 50), 0, 100),
              y: clamp(num(i.position.y, 50), 0, 100),
              width: Math.max(1, num(i.position.width, 200)),
              height: Math.max(1, num(i.position.height, 50)),
            }
          : null,
      }))

      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions: sanitized,
          design: video?.design,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || 'Kaydetme başarısız')
      }

      if (payload?.video) {
        setVideo(payload.video)
        setInteractions(payload.video.interactions || interactions)
        onSaved?.(payload.video)
      }
      setHasChanges(false)
      setSaveMessage('Kaydedildi')
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage(error instanceof Error ? error.message : 'Kaydetme başarısız')
    } finally {
      setSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }))

  const getDefaultSize = (type: Interaction['type']) => {
    switch (type) {
      case 'TEXT':
        return { width: 340, height: 90 }
      case 'IMAGE':
        return { width: 280, height: 200 }
      case 'VIDEO_CLIP':
        return { width: 360, height: 203 }
      case 'AUDIO_CLIP':
        return { width: 260, height: 64 }
      case 'MAP':
        return { width: 360, height: 260 }
      case 'HOTSPOT':
        return { width: 90, height: 90 }
      case 'QUESTION':
        return { width: 320, height: 80 }
      default:
        return { width: 220, height: 52 }
    }
  }

  const handleAddInteraction = (type: Interaction['type']) => {
    const newInteraction: Interaction = {
      id: `inter-${Date.now()}`,
      type,
      startTime: Number(currentTime.toFixed(1)),
      config: getDefaultConfig(type),
      position: { x: 50, y: 50, ...getDefaultSize(type) },
    }
    setInteractions([...interactions, newInteraction])
    setSelectedInteraction(newInteraction)
    setHasChanges(true)
  }

  const handleDeleteInteraction = (id: string) => {
    setInteractions(interactions.filter((i) => i.id !== id))
    if (selectedInteraction?.id === id) {
      setSelectedInteraction(null)
    }
    setHasChanges(true)
  }

  const handleDuplicateInteraction = (interaction: Interaction) => {
    const newInteraction = {
      ...interaction,
      id: `inter-${Date.now()}`,
      position: {
        ...interaction.position!,
        x: interaction.position!.x + 20,
        y: interaction.position!.y + 20,
      },
    }
    setInteractions([...interactions, newInteraction])
    setSelectedInteraction(newInteraction)
    setHasChanges(true)
  }

  const handleSeekToInteraction = (interaction: Interaction) => {
    const video = document.querySelector('video')
    if (video) {
      video.currentTime = interaction.startTime
    }
    setCurrentTime(interaction.startTime)
    setSelectedInteraction(interaction)
  }

  const handleUpdateInteraction = (id: string, updates: Partial<Interaction>) => {
    setInteractions(
      interactions.map((i) => (i.id === id ? { ...i, ...updates } : i))
    )
    if (selectedInteraction?.id === id) {
      setSelectedInteraction({ ...selectedInteraction, ...updates })
    }
    setHasChanges(true)
  }

  const getDefaultConfig = (type: Interaction['type']) => {
    switch (type) {
      case 'BUTTON':
        return {
          text: 'Buton Metni',
          action: 'CONTINUE',
          style: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: 8,
            fontSize: 16,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textAlign: 'center',
          },
        }
      case 'HOTSPOT':
        return {
          action: 'CONTINUE',
          style: {
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: '#3b82f6',
          },
        }
      case 'QUESTION':
        return {
          question: 'Sorunuzu buraya yazın...',
          options: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'],
          correctAnswer: 0,
          style: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
        }
      case 'TEXT':
        return {
          text: 'Metniniz',
          style: {
            backgroundColor: '#7c3aed',
            backgroundOpacity: 100,
            color: '#ffffff',
            fontSize: 28,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            borderRadius: 12,
            padding: 12,
          },
        }
      case 'IMAGE':
        return {
          url: '',
          alt: 'Resim',
          opacity: 100,
          pauseMainVideo: false,
        }
      case 'VIDEO_CLIP':
        return {
          url: '',
          pauseMainVideo: true, // araya ekle: ana video durur, klip biter, ana video devam eder
          autoplay: true,
          muted: false,
          loop: false,
          controls: true,
        }
      case 'AUDIO_CLIP':
        return {
          url: '',
          title: 'Ses klibi',
          pauseMainVideo: true, // araya ekle: ana video durur, ses biter, devam eder
        }
      case 'MAP':
        return {
          address: 'İstanbul, Türkiye',
          zoom: 14,
          pauseMainVideo: false,
        }
      default:
        return {}
    }
  }

  const getVisibleInteractions = () => {
    return interactions.filter((interaction) => {
      if (interaction.endTime) {
        return currentTime >= interaction.startTime && currentTime <= interaction.endTime
      }
      return currentTime >= interaction.startTime
    })
  }

  const insertCount = interactions.filter((i) => i.config?.pauseMainVideo).length

  const filteredInteractions = interactions.filter((interaction) => {
    if (listTab === 'inserts' && !interaction.config?.pauseMainVideo) return false
    return interactionFilter === 'ALL' || interaction.type === interactionFilter
  })

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
      {/* Left Panel - Interactions List */}
      <div className="min-h-0">
        <Card className="h-full">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center justify-between">
              Etkileşimler
              <Badge variant="secondary">{interactions.length}</Badge>
            </CardTitle>
            <CardDescription>
              Video üzerine etkileşimli öğeler ekleyin
            </CardDescription>
            <div className="grid grid-cols-4 gap-1">
              {interactionTypes.map((item) => (
                <Button
                  key={item.type}
                  type="button"
                  size="icon"
                  variant="outline"
                  title={`${item.label} ekle`}
                  onClick={() => handleAddInteraction(item.type as Interaction['type'])}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Interaction */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger render={<Button className="w-full" />}>
                <Plus className="mr-2 h-4 w-4" />
                Etkileşim Ekle
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Etkileşim Tipi Seçin</DialogTitle>
                  <DialogDescription>
                    Videoya eklemek istediğiniz etkileşim tipini seçin
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  {interactionTypes.map((item) => (
                    <Button
                      key={item.type}
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        handleAddInteraction(item.type as Interaction['type'])
                        setAddOpen(false)
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Separator />

            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setListTab('all')}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  listTab === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setListTab('inserts')}
                className={cn(
                  'flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  listTab === 'inserts' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Film className="h-3 w-3" />
                Araya Eklenenler
                {insertCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{insertCount}</span>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <Label>Filtre</Label>
              <Select
                value={interactionFilter}
                onValueChange={(value) => setInteractionFilter(value as typeof interactionFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tümü</SelectItem>
                  {interactionTypes.map((item) => (
                    <SelectItem key={item.type} value={item.type}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Interactions Timeline */}
            <div className="space-y-2">
              <Label>Timeline ({formatTime(currentTime)})</Label>
              <div className="space-y-2">
                {filteredInteractions.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Bu filtrede etkileşim yok.
                  </div>
                )}
                {filteredInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className={cn(
                      'rounded-lg border p-2 cursor-pointer transition-colors',
                      selectedInteraction?.id === interaction.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    onClick={() => setSelectedInteraction(interaction)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {React.createElement(
                          interactionTypes.find((t) => t.type === interaction.type)?.icon || Layers,
                          { className: 'h-4 w-4 shrink-0 text-muted-foreground' }
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {interaction.config.text ||
                             interaction.config.question ||
                             interactionTypes.find((t) => t.type === interaction.type)?.label}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {interactionTypes.find((t) => t.type === interaction.type)?.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatTime(interaction.startTime)}
                            {interaction.endTime && ` - ${formatTime(interaction.endTime)}`}
                          </span>
                          <span>{Math.round(interaction.position?.width || 0)}x{Math.round(interaction.position?.height || 0)}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Bu zamana git"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSeekToInteraction(interaction)
                          }}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Kopyala"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateInteraction(interaction)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Sil"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteInteraction(interaction.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center - Video Preview */}
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3">
          <div>
            <div className="text-sm font-medium">Canvas</div>
            <div className="text-xs text-muted-foreground">
              {selectedInteraction ? 'Seçili öğeyi sürükleyerek konumlandırın.' : 'Etkileşim seçin veya hızlı ekleme butonlarını kullanın.'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasChanges ? 'default' : 'secondary'}>
              {hasChanges ? 'Kaydedilmemiş değişiklik' : 'Kaydedildi'}
            </Badge>
            <Badge variant="outline">{formatTime(currentTime)}</Badge>
          </div>
        </div>

        <div ref={containerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            src={video?.hlsUrl || video?.videoUrl || ''}
            poster={video?.thumbnailUrl}
            onTimeUpdate={setCurrentTime}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Interaction Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {getVisibleInteractions().map((interaction) => {
              if (!interaction.position) return null

              return (
                <div
                  key={interaction.id}
                  className={cn(
                    'absolute border-2 border-dashed transition-none',
                    selectedInteraction?.id === interaction.id
                      ? 'border-primary bg-primary/10 z-20'
                      : 'border-white/50 hover:border-white z-10',
                    isPlaying ? 'pointer-events-none' : 'pointer-events-auto cursor-move'
                  )}
                  style={{
                    left: `${interaction.position.x}%`,
                    top: `${interaction.position.y}%`,
                    width: `${interaction.position.width}px`,
                    height: `${interaction.position.height}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isPlaying) return;
                    setSelectedInteraction(interaction);
                    setDragInfo({
                      id: interaction.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      startPosX: interaction.position!.x,
                      startPosY: interaction.position!.y,
                    });
                  }}
                >
                  {/* Preview content based on type */}
                  <InteractionVisual interaction={interaction} />

                  {/* Resize handles (only for the selected item, when not playing) */}
                  {selectedInteraction?.id === interaction.id && !isPlaying &&
                    (['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                      <div
                        key={corner}
                        className={cn(
                          'absolute h-3 w-3 rounded-full border-2 border-primary bg-white shadow',
                          corner === 'nw' && '-left-1.5 -top-1.5 cursor-nwse-resize',
                          corner === 'ne' && '-right-1.5 -top-1.5 cursor-nesw-resize',
                          corner === 'sw' && '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                          corner === 'se' && '-bottom-1.5 -right-1.5 cursor-nwse-resize'
                        )}
                        onPointerDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          if (isPlaying || !interaction.position) return
                          setSelectedInteraction(interaction)
                          setResizeInfo({
                            id: interaction.id,
                            corner,
                            startX: e.clientX,
                            startY: e.clientY,
                            startW: interaction.position.width,
                            startH: interaction.position.height,
                          })
                        }}
                      />
                    ))}
                </div>
              )
            })}
          </div>

          {/* Alignment guides */}
          {snapGuides.v && (
            <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-full w-px -translate-x-1/2 bg-fuchsia-500/80" />
          )}
          {snapGuides.h && (
            <div className="pointer-events-none absolute left-0 top-1/2 z-30 h-px w-full -translate-y-1/2 bg-fuchsia-500/80" />
          )}
        </div>

        {/* Video Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const video = document.querySelector('video')
              if (video) video.currentTime = Math.max(0, currentTime - 10)
            }}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const video = document.querySelector('video')
              if (video) {
                if (isPlaying) video.pause()
                else video.play()
              }
            }}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const video = document.querySelector('video')
              if (video) video.currentTime = currentTime + 10
            }}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1 px-4">
            <div className="text-sm font-mono">
              {formatTime(currentTime)}
            </div>
          </div>

          <Button
            variant={hasChanges ? 'default' : 'outline'}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Kaydediliyor...' : hasChanges ? 'Kaydet*' : 'Kaydedildi'}
          </Button>
          {saveMessage && (
            <span className={cn(
              'text-xs',
              saveMessage === 'Kaydedildi' ? 'text-green-600' : 'text-destructive'
            )}>
              {saveMessage}
            </span>
          )}

          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <Eye className="mr-2 h-4 w-4" />
              Önizle
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Video Önizleme</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <EditorPreview
                  video={video}
                  interactions={interactions}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Right Panel - Settings */}
      <div className="min-h-0">
        <Card className="h-full">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between">
              Ayarlar
              {selectedInteraction && (
                <Badge variant="outline">
                  {interactionTypes.find((t) => t.type === selectedInteraction.type)?.label}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedInteraction
                ? 'Etkileşim ayarlarını düzenleyin'
                : 'Düzenlemek için bir etkileşim seçin'}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-14rem)] overflow-y-auto">
            {selectedInteraction ? (
              <InteractionSettings
                interaction={selectedInteraction}
                onChange={(updates) => handleUpdateInteraction(selectedInteraction.id, updates)}
                currentTime={currentTime}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MousePointerClick className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Düzenlemek için sol taraftan bir etkileşim seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

function InteractionSettings({
  interaction,
  onChange,
  currentTime,
}: {
  interaction: Interaction
  onChange: (updates: Partial<Interaction>) => void
  currentTime: number
}) {
  const updateConfig = (key: string, value: any) => {
    onChange({
      config: { ...interaction.config, [key]: value },
    })
  }

  const updateStyle = (key: string, value: any) => {
    onChange({
      config: {
        ...interaction.config,
        style: { ...interaction.config.style, [key]: value },
      },
    })
  }

  const updatePosition = (key: string, value: number) => {
    onChange({
      position: { ...interaction.position!, [key]: value },
    })
  }

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content">İçerik</TabsTrigger>
        <TabsTrigger value="style">Stil</TabsTrigger>
        <TabsTrigger value="timing">Zaman</TabsTrigger>
        <TabsTrigger value="position">Konum</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        {interaction.type === 'BUTTON' && (
          <>
            <div className="space-y-2">
              <Label>Buton Metni</Label>
              <Input
                value={interaction.config.text}
                onChange={(e) => updateConfig('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tıklama Eylemi</Label>
              <Select
                value={interaction.config.action}
                onValueChange={(value) => updateConfig('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clickActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ActionFields interaction={interaction} updateConfig={updateConfig} />
          </>
        )}

        {interaction.type === 'HOTSPOT' && (
          <>
            <div className="space-y-2">
              <Label>Tıklama Eylemi</Label>
              <Select
                value={interaction.config.action || 'CONTINUE'}
                onValueChange={(value) => updateConfig('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clickActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ActionFields interaction={interaction} updateConfig={updateConfig} />
          </>
        )}

        {interaction.type === 'QUESTION' && (
          <>
            <div className="space-y-2">
              <Label>Soru</Label>
              <Textarea
                value={interaction.config.question}
                onChange={(e) => updateConfig('question', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seçenekler</Label>
                <span className="text-[11px] text-muted-foreground">✓ doğru · → dallanma (sn)</span>
              </div>
              {interaction.config.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant={index === interaction.config.correctAnswer ? 'default' : 'outline'}
                    className="h-9 w-9 shrink-0"
                    title="Doğru cevap yap"
                    onClick={() => updateConfig('correctAnswer', index)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...interaction.config.options]
                      newOptions[index] = e.target.value
                      updateConfig('options', newOptions)
                    }}
                  />
                  <Input
                    type="number"
                    className="w-20 shrink-0"
                    placeholder="→ sn"
                    title="Bu seçenek seçilince gidilecek saniye (dallanma)"
                    value={interaction.config.branches?.[index] ?? ''}
                    onChange={(e) => {
                      const branches = [...(interaction.config.branches || [])]
                      branches[index] = e.target.value === '' ? null : Number(e.target.value)
                      updateConfig('branches', branches)
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0 text-destructive"
                    title="Seçeneği sil"
                    onClick={() => {
                      const options = interaction.config.options.filter((_: string, i: number) => i !== index)
                      const branches = (interaction.config.branches || []).filter((_: any, i: number) => i !== index)
                      let correctAnswer = interaction.config.correctAnswer ?? 0
                      if (correctAnswer === index) correctAnswer = 0
                      else if (correctAnswer > index) correctAnswer -= 1
                      onChange({ config: { ...interaction.config, options, branches, correctAnswer } })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  updateConfig('options', [
                    ...(interaction.config.options || []),
                    `Seçenek ${(interaction.config.options?.length || 0) + 1}`,
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Seçenek Ekle
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Bir seçeneğe saniye yazarsanız, izleyici o seçeneği işaretleyip devam ettiğinde video o saniyeye atlar (dallanma).
            </p>
          </>
        )}

        {interaction.type === 'TEXT' && (
          <div className="space-y-3">
            <Label>Metin</Label>
            <TextToolbar style={interaction.config.style || {}} updateStyle={updateStyle} />
            <Textarea
              rows={4}
              value={interaction.config.text}
              onChange={(e) => updateConfig('text', e.target.value)}
              placeholder="Metninizi yazın..."
              style={{
                color: interaction.config.style?.color,
                fontWeight: interaction.config.style?.fontWeight,
                fontStyle: interaction.config.style?.fontStyle,
                textDecoration: interaction.config.style?.textDecoration,
                textAlign: interaction.config.style?.textAlign,
              }}
            />
            <p className="text-xs text-muted-foreground">
              Font, boyut ve kenar yuvarlaklığı için “Stil” sekmesini kullanın.
            </p>
          </div>
        )}

        {interaction.type === 'IMAGE' && (
          <div className="space-y-3">
            <Label>Resim</Label>
            <AssetUpload accept="image/*" label="Resim Yükle" onUploaded={(url) => updateConfig('url', url)} />
            <Input
              value={interaction.config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="veya https://... URL yapıştırın"
            />
            <div className="space-y-2">
              <Label>Saydamlık (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={interaction.config.opacity ?? 100}
                onChange={(e) => updateConfig('opacity', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
              <ToggleField
                label="Araya ekle — ana video dursun, resim tam ekran görünsün (Devam Et ile sürer)"
                checked={!!interaction.config.pauseMainVideo}
                onChange={(v) => updateConfig('pauseMainVideo', v)}
              />
              {interaction.config.pauseMainVideo && (
                <div className="space-y-1">
                  <Label className="text-xs">Zorunlu bekleme (sn) — 0 = hemen geçilebilir</Label>
                  <Input
                    type="number"
                    min={0}
                    value={interaction.config.minDuration ?? 0}
                    onChange={(e) => updateConfig('minDuration', Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {interaction.type === 'VIDEO_CLIP' && (
          <div className="space-y-3">
            <Label>Video</Label>
            <AssetUpload accept="video/*" label="Video Yükle" onUploaded={(url) => updateConfig('url', url)} />
            <Input
              value={interaction.config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="veya https://... video/mp4 URL"
            />
            <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
              <ToggleField
                label="Araya ekle — ana video dursun, klip oynasın, bitince devam etsin"
                checked={interaction.config.pauseMainVideo !== false}
                onChange={(v) => updateConfig('pauseMainVideo', v)}
              />
              {interaction.config.pauseMainVideo !== false && (
                <ToggleField
                  label="Atlanamaz — sonuna kadar izlensin (zorunlu)"
                  checked={!!interaction.config.required}
                  onChange={(v) => updateConfig('required', v)}
                />
              )}
            </div>
            {interaction.config.pauseMainVideo === false && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <ToggleField label="Otomatik oynat" checked={!!interaction.config.autoplay} onChange={(v) => updateConfig('autoplay', v)} />
                <ToggleField label="Sessiz" checked={!!interaction.config.muted} onChange={(v) => updateConfig('muted', v)} />
                <ToggleField label="Döngü" checked={!!interaction.config.loop} onChange={(v) => updateConfig('loop', v)} />
                <ToggleField label="Kontroller" checked={!!interaction.config.controls} onChange={(v) => updateConfig('controls', v)} />
              </div>
            )}
          </div>
        )}

        {interaction.type === 'AUDIO_CLIP' && (
          <div className="space-y-3">
            <Label>Ses klibi</Label>
            <AssetUpload accept="audio/*" label="Ses Yükle" onUploaded={(url) => updateConfig('url', url)} />
            <Input
              value={interaction.config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="veya https://... ses (mp3) URL"
            />
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input
                value={interaction.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="örn: Seslendirme"
              />
            </div>
            <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
              <ToggleField
                label="Araya ekle — ana video dursun, ses çalsın, bitince devam etsin"
                checked={interaction.config.pauseMainVideo !== false}
                onChange={(v) => updateConfig('pauseMainVideo', v)}
              />
              {interaction.config.pauseMainVideo !== false && (
                <ToggleField
                  label="Atlanamaz — sonuna kadar dinlensin (zorunlu)"
                  checked={!!interaction.config.required}
                  onChange={(v) => updateConfig('required', v)}
                />
              )}
            </div>
          </div>
        )}

        {interaction.type === 'MAP' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Adres / Konum</Label>
              <Input
                value={interaction.config.address || ''}
                onChange={(e) => updateConfig('address', e.target.value)}
                placeholder="örn: Taksim Meydanı, İstanbul"
              />
            </div>
            <div className="space-y-2">
              <Label>Yakınlaştırma (1-20)</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={interaction.config.zoom ?? 14}
                onChange={(e) => updateConfig('zoom', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gömme URL (opsiyonel)</Label>
              <Input
                value={interaction.config.embedUrl || ''}
                onChange={(e) => updateConfig('embedUrl', e.target.value)}
                placeholder="Google Haritalar 'Yerleştir' bağlantısı"
              />
              <p className="text-xs text-muted-foreground">Boş bırakılırsa adres kullanılır.</p>
            </div>
            <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
              <ToggleField
                label="Araya ekle — ana video dursun, harita tam ekran görünsün (Devam Et ile sürer)"
                checked={!!interaction.config.pauseMainVideo}
                onChange={(v) => updateConfig('pauseMainVideo', v)}
              />
              {interaction.config.pauseMainVideo && (
                <div className="space-y-1">
                  <Label className="text-xs">Zorunlu bekleme (sn) — 0 = hemen geçilebilir</Label>
                  <Input
                    type="number"
                    min={0}
                    value={interaction.config.minDuration ?? 0}
                    onChange={(e) => updateConfig('minDuration', Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Giriş Animasyonu</Label>
            <Select
              value={interaction.config.animation || 'none'}
              onValueChange={(value) => updateConfig('animation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enterAnimations.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Çıkış Animasyonu</Label>
            <Select
              value={interaction.config.exitAnimation || 'none'}
              onValueChange={(value) => updateConfig('exitAnimation', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enterAnimations.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {interaction.type !== 'MAP' && interaction.type !== 'VIDEO_CLIP' && interaction.type !== 'AUDIO_CLIP' && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="space-y-2">
              <Label>Gölge</Label>
              <Select
                value={interaction.config.style?.boxShadow || 'none'}
                onValueChange={(value) => updateStyle('boxShadow', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shadowOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Kenarlık (px)</Label>
                <Input
                  type="number"
                  min={0}
                  value={interaction.config.style?.borderWidth || 0}
                  onChange={(e) => updateStyle('borderWidth', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kenar Rengi</Label>
                <Input
                  type="color"
                  value={interaction.config.style?.borderColor || '#ffffff'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="h-10 w-full"
                />
              </div>
            </div>
          </div>
        )}

        {(interaction.type === 'BUTTON' || interaction.type === 'TEXT' || interaction.type === 'QUESTION') && (
          <>
            <div className="space-y-2">
              <Label>Arkaplan Rengi</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={interaction.config.style?.backgroundColor || '#000000'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={interaction.config.style?.backgroundColor || '#000000'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Metin Rengi</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={interaction.config.style?.color || '#ffffff'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={interaction.config.style?.color || '#ffffff'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {interaction.type === 'BUTTON' && (
          <>
            <div className="space-y-2">
              <Label>Kenar Yarıçapı (px)</Label>
              <Input
                type="number"
                value={interaction.config.style?.borderRadius || 0}
                onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Font Boyutu (px)</Label>
              <Input
                type="number"
                value={interaction.config.style?.fontSize || 16}
                onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
              />
            </div>
          </>
        )}

        {interaction.type === 'TEXT' && (
          <>
            <div className="space-y-2">
              <Label>Font</Label>
              <Select
                value={interaction.config.style?.fontFamily || 'Inter, sans-serif'}
                onValueChange={(value) => updateStyle('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Font Boyutu (px)</Label>
                <Input
                  type="number"
                  value={interaction.config.style?.fontSize || 18}
                  onChange={(e) => updateStyle('fontSize', parseInt(e.target.value) || 18)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kalınlık</Label>
                <Select
                  value={String(interaction.config.style?.fontWeight || 400)}
                  onValueChange={(value) => updateStyle('fontWeight', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">İnce</SelectItem>
                    <SelectItem value="400">Normal</SelectItem>
                    <SelectItem value="600">Kalın</SelectItem>
                    <SelectItem value="700">Ekstra Kalın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hizalama</Label>
              <Select
                value={interaction.config.style?.textAlign || 'left'}
                onValueChange={(value) => updateStyle('textAlign', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Sol</SelectItem>
                  <SelectItem value="center">Orta</SelectItem>
                  <SelectItem value="right">Sağ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kenar Yarıçapı (px)</Label>
              <Input
                type="number"
                value={interaction.config.style?.borderRadius || 8}
                onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value) || 0)}
              />
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="timing" className="space-y-4">
        <div className="space-y-2">
          <Label>Başlangıç Zamanı (saniye)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={interaction.startTime}
              onChange={(e) => onChange({ startTime: parseFloat(e.target.value) })}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange({ startTime: Number(currentTime.toFixed(1)) })}
            >
              Şimdi
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bitiş Zamanı (saniye)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={interaction.endTime || ''}
              onChange={(e) =>
                onChange({ endTime: e.target.value ? parseFloat(e.target.value) : undefined })
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange({ endTime: Number(currentTime.toFixed(1)) })}
            >
              Şimdi
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Boş bırakırsanız etkileşim sonsuza kadar görünür
          </p>
        </div>
      </TabsContent>

      <TabsContent value="position" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>X (%)</Label>
            <Input
              type="number"
              value={interaction.position?.x || 0}
              onChange={(e) => updatePosition('x', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Y (%)</Label>
            <Input
              type="number"
              value={interaction.position?.y || 0}
              onChange={(e) => updatePosition('y', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Genişlik (px)</Label>
            <Input
              type="number"
              value={interaction.position?.width || 200}
              onChange={(e) => updatePosition('width', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Yükseklik (px)</Label>
            <Input
              type="number"
              value={interaction.position?.height || 50}
              onChange={(e) => updatePosition('height', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ position: { ...(interaction.position || { width: 200, height: 50 }), x: 50, y: 50 } })}
          >
            Ortala
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ position: { x: 50, y: 50, width: 320, height: interaction.type === 'TEXT' ? 120 : 64 } })}
          >
            Geniş Kart
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function ActionFields({
  interaction,
  updateConfig,
}: {
  interaction: Interaction
  updateConfig: (key: string, value: any) => void
}) {
  const action = interaction.config.action || 'CONTINUE'

  if (action === 'OPEN_LINK' || action === 'REDIRECT_LINK') {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label>Link URL</Label>
        <Input
          value={interaction.config.url || interaction.config.linkUrl || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">
          İzleyici tıkladığında bu bağlantı açılır.
        </p>
      </div>
    )
  }

  if (action === 'CHANGE_TIME') {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label>Gidilecek Zaman (saniye)</Label>
        <Input
          type="number"
          step="0.1"
          value={interaction.config.targetTime ?? ''}
          onChange={(e) => updateConfig('targetTime', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="45"
        />
      </div>
    )
  }

  if (action === 'SWITCH_VIDEO') {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label>Geçilecek Video ID</Label>
        <Input
          value={interaction.config.switchVideoId || ''}
          onChange={(e) => updateConfig('switchVideoId', e.target.value)}
          placeholder="video-id"
        />
      </div>
    )
  }

  if (action === 'SHOW_MESSAGE') {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label>Mesaj</Label>
        <Textarea
          value={interaction.config.message || ''}
          onChange={(e) => updateConfig('message', e.target.value)}
          placeholder="İzleyiciye gösterilecek mesaj"
        />
      </div>
    )
  }

  return null
}

function EditorPreview({
  video,
  interactions,
}: {
  video: VideoEditorProps['initialVideo']
  interactions: Interaction[]
}) {
  const [previewTime, setPreviewTime] = useState(0)
  const visibleInteractions = interactions.filter((interaction) => {
    if (interaction.endTime) {
      return previewTime >= interaction.startTime && previewTime <= interaction.endTime
    }
    return previewTime >= interaction.startTime
  })

  return (
    <div className="relative h-full w-full">
      <VideoPlayer
        src={video?.hlsUrl || video?.videoUrl || ''}
        poster={video?.thumbnailUrl}
        onTimeUpdate={setPreviewTime}
      />
      <div className="pointer-events-none absolute inset-0">
        {visibleInteractions.map((interaction) => {
          if (!interaction.position) return null

          return (
            <div
              key={interaction.id}
              className={cn('absolute', enterAnimationClass(interaction.config?.animation))}
              style={{
                left: `${interaction.position.x}%`,
                top: `${interaction.position.y}%`,
                width: `${interaction.position.width}px`,
                height: `${interaction.position.height}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <InteractionVisual interaction={interaction} interactive />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function withOpacity(color: string | undefined, opacity: number | undefined) {
  if (!color) return undefined
  if (opacity == null || opacity >= 100) return color
  const hex = color.replace('#', '')
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
  }
  return color
}

export function mapEmbedSrc(config: any): string {
  if (config?.embedUrl) return config.embedUrl
  const query = encodeURIComponent(config?.address || 'Türkiye')
  const zoom = config?.zoom || 14
  return `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed`
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  )
}

function AssetUpload({
  accept,
  label,
  onUploaded,
}: {
  accept: string
  label: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads', { method: 'POST', body: formData })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Yükleme başarısız')
      onUploaded(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? 'Yükleniyor...' : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function TextToolbar({
  style,
  updateStyle,
}: {
  style: any
  updateStyle: (key: string, value: any) => void
}) {
  const isBold = Number(style.fontWeight || 400) >= 600
  const isItalic = style.fontStyle === 'italic'
  const isUnderline = style.textDecoration === 'underline'
  const align = style.textAlign || 'left'

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/30 p-1.5">
      <Button type="button" size="icon" variant={isBold ? 'default' : 'ghost'} className="h-8 w-8"
        title="Kalın" onClick={() => updateStyle('fontWeight', isBold ? 400 : 700)}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant={isItalic ? 'default' : 'ghost'} className="h-8 w-8"
        title="İtalik" onClick={() => updateStyle('fontStyle', isItalic ? 'normal' : 'italic')}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant={isUnderline ? 'default' : 'ghost'} className="h-8 w-8"
        title="Altı çizili" onClick={() => updateStyle('textDecoration', isUnderline ? 'none' : 'underline')}>
        <Underline className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button type="button" size="icon" variant={align === 'left' ? 'default' : 'ghost'} className="h-8 w-8"
        title="Sola hizala" onClick={() => updateStyle('textAlign', 'left')}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant={align === 'center' ? 'default' : 'ghost'} className="h-8 w-8"
        title="Ortala" onClick={() => updateStyle('textAlign', 'center')}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant={align === 'right' ? 'default' : 'ghost'} className="h-8 w-8"
        title="Sağa hizala" onClick={() => updateStyle('textAlign', 'right')}>
        <AlignRight className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <label className="flex items-center gap-1 text-xs" title="Yazı rengi">
        <span className="text-muted-foreground">A</span>
        <input type="color" value={style.color || '#ffffff'}
          onChange={(e) => updateStyle('color', e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border bg-transparent p-0.5" />
      </label>
      <label className="flex items-center gap-1 text-xs" title="Arkaplan rengi">
        <span className="text-muted-foreground">▟</span>
        <input type="color" value={style.backgroundColor || '#7c3aed'}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border bg-transparent p-0.5" />
      </label>
    </div>
  )
}

// Shared visual for an interaction, used by both the editor canvas and the preview.
// `interactive=false` (editor) disables pointer events on media so overlays stay draggable.
function InteractionVisual({
  interaction,
  interactive = false,
}: {
  interaction: Interaction
  interactive?: boolean
}) {
  const c = interaction.config || {}
  const s = c.style || {}

  switch (interaction.type) {
    case 'BUTTON':
      return (
        <div
          className="flex h-full w-full items-center justify-center shadow-md"
          style={{
            backgroundColor: s.backgroundColor || '#3b82f6',
            color: s.color || '#ffffff',
            borderRadius: `${s.borderRadius ?? 8}px`,
            fontSize: `${s.fontSize || 16}px`,
            fontFamily: s.fontFamily,
            fontWeight: s.fontWeight,
            textAlign: s.textAlign || 'center',
            ...decorStyle(s),
          }}
        >
          {c.text}
        </div>
      )
    case 'TEXT':
      return (
        <div
          className="flex h-full w-full items-center"
          style={{
            backgroundColor: withOpacity(s.backgroundColor, s.backgroundOpacity) || 'rgba(0,0,0,0.7)',
            color: s.color || '#ffffff',
            fontSize: `${s.fontSize || 18}px`,
            fontFamily: s.fontFamily,
            fontWeight: s.fontWeight,
            fontStyle: s.fontStyle || 'normal',
            textDecoration: s.textDecoration || 'none',
            textAlign: s.textAlign || 'left',
            borderRadius: `${s.borderRadius ?? 8}px`,
            padding: `${s.padding ?? 12}px`,
            justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            ...decorStyle(s),
          }}
        >
          <span className="w-full">{c.text}</span>
        </div>
      )
    case 'HOTSPOT':
      return (
        <div
          className="h-full w-full animate-pulse rounded-full border-2"
          style={{
            borderColor: s.borderColor || '#3b82f6',
            backgroundColor: s.backgroundColor || 'rgba(59, 130, 246, 0.3)',
          }}
        />
      )
    case 'IMAGE':
      return c.url ? (
        <img
          src={c.url}
          alt={c.alt || ''}
          className="h-full w-full object-contain"
          style={{ opacity: (c.opacity ?? 100) / 100, ...decorStyle(s) }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-white/40 bg-black/40 text-xs text-white/70">
          Resim seçin
        </div>
      )
    case 'VIDEO_CLIP':
      return c.url ? (
        <video
          src={c.url}
          className={cn('h-full w-full rounded-lg object-cover', !interactive && 'pointer-events-none')}
          muted={interactive ? c.muted : true}
          loop={c.loop}
          controls={interactive ? c.controls : false}
          playsInline
          autoPlay={interactive ? c.autoplay : false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-white/40 bg-black/40 text-xs text-white/70">
          Video seçin
        </div>
      )
    case 'AUDIO_CLIP':
      return (
        <div className="flex h-full w-full items-center gap-2 rounded-lg bg-black/70 px-3 text-white">
          <Music className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">{c.title || 'Ses klibi'}</span>
        </div>
      )
    case 'MAP':
      return (
        <iframe
          title="map"
          src={mapEmbedSrc(c)}
          className={cn('h-full w-full rounded-lg border-0', !interactive && 'pointer-events-none')}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )
    case 'QUESTION':
      return (
        <div
          className="flex h-full w-full items-center justify-center rounded-lg border bg-white px-3 text-center font-medium text-black shadow-md"
          style={decorStyle(s)}
        >
          {c.question || 'Soru'}
        </div>
      )
    default:
      return null
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
