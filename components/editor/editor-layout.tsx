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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interaction {
  id: string
  type: 'BUTTON' | 'HOTSPOT' | 'QUESTION' | 'TEXT' | 'IMAGE'
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
  { type: 'TEXT', label: 'Metin', icon: Type, description: 'Metin kutusu ekleyin' },
  { type: 'IMAGE', label: 'Resim', icon: ImageIcon, description: 'Resim ekleyin' },
]

const clickActions = [
  { value: 'CONTINUE', label: 'Devam Et' },
  { value: 'OPEN_LINK', label: 'Link Aç' },
  { value: 'CHANGE_TIME', label: 'Zamana Git' },
  { value: 'SWITCH_VIDEO', label: 'Videoya Geç' },
  { value: 'SHOW_MESSAGE', label: 'Mesaj Göster' },
  { value: 'PAUSE', label: 'Duraklat' },
]

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

  // Drag logic
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, startPosX: number, startPosY: number } | null>(null)

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
          const newX = Math.max(0, Math.min(100, dragInfo.startPosX + deltaX));
          const newY = Math.max(0, Math.min(100, dragInfo.startPosY + deltaY));
          
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
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
  }, [dragInfo, selectedInteraction]);

  useEffect(() => {
    onDirtyChange?.(hasChanges)
  }, [hasChanges, onDirtyChange])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions,
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

  const handleAddInteraction = (type: Interaction['type']) => {
    const newInteraction: Interaction = {
      id: `inter-${Date.now()}`,
      type,
      startTime: currentTime,
      config: getDefaultConfig(type),
      position: { x: 50, y: 50, width: 200, height: 50 },
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
          text: 'Metin içeriği',
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            fontSize: 18,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            textAlign: 'left',
            borderRadius: 8,
          },
        }
      case 'IMAGE':
        return {
          url: '',
          alt: 'Resim',
          opacity: 100,
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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Panel - Interactions List */}
      <div className="w-80 overflow-y-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Etkileşimler
              <Badge variant="secondary">{interactions.length}</Badge>
            </CardTitle>
            <CardDescription>
              Video üzerine etkileşimli öğeler ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Interaction */}
            <Dialog>
              <DialogTrigger>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Etkileşim Ekle
                </Button>
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
                        // Close dialog
                        document.querySelector('[data-state="open"]')?.dispatchEvent(
                          new KeyboardEvent('keydown', { key: 'Escape' })
                        )
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

            {/* Interactions Timeline */}
            <div className="space-y-2">
              <Label>Timeline ({formatTime(currentTime)})</Label>
              <div className="space-y-1">
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
                      selectedInteraction?.id === interaction.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    onClick={() => setSelectedInteraction(interaction)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {interactionTypes.find((t) => t.type === interaction.type)?.icon && (
                          React.createElement(
                            interactionTypes.find((t) => t.type === interaction.type)?.icon!,
                            { className: 'h-4 w-4 shrink-0' }
                          )
                        )}
                        <span className="font-medium truncate">
                          {interaction.config.text ||
                           interaction.config.question ||
                           interactionTypes.find((t) => t.type === interaction.type)?.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(interaction.startTime)}
                        {interaction.endTime && ` - ${formatTime(interaction.endTime)}`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
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
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteInteraction(interaction.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center - Video Preview */}
      <div className="flex-1 flex flex-col">
        <div ref={containerRef} className="flex-1 relative bg-black rounded-lg overflow-hidden">
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
                  {interaction.type === 'BUTTON' && (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-medium rounded-lg"
                      style={{
                        backgroundColor: interaction.config.style?.backgroundColor,
                        color: interaction.config.style?.color,
                        borderRadius: `${interaction.config.style?.borderRadius}px`,
                        fontSize: `${interaction.config.style?.fontSize}px`,
                        fontFamily: interaction.config.style?.fontFamily,
                        fontWeight: interaction.config.style?.fontWeight,
                        textAlign: interaction.config.style?.textAlign,
                      }}
                    >
                      {interaction.config.text}
                    </div>
                  )}

                  {interaction.type === 'TEXT' && (
                    <div
                      className="w-full h-full p-3 rounded-lg"
                      style={{
                        backgroundColor: interaction.config.style?.backgroundColor,
                        color: interaction.config.style?.color,
                        fontSize: `${interaction.config.style?.fontSize}px`,
                        fontFamily: interaction.config.style?.fontFamily,
                        fontWeight: interaction.config.style?.fontWeight,
                        textAlign: interaction.config.style?.textAlign,
                        borderRadius: `${interaction.config.style?.borderRadius || 8}px`,
                      }}
                    >
                      {interaction.config.text}
                    </div>
                  )}

                  {interaction.type === 'HOTSPOT' && (
                    <div
                      className="w-full h-full rounded-full border-2 animate-pulse"
                      style={{
                        borderColor: interaction.config.style?.borderColor,
                        backgroundColor: interaction.config.style?.backgroundColor,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Video Controls */}
        <div className="flex items-center gap-2 mt-4">
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
            <DialogTrigger>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Önizle
              </Button>
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
      <div className="w-96 overflow-y-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Ayarlar</CardTitle>
            <CardDescription>
              {selectedInteraction
                ? 'Etkileşim ayarlarını düzenleyin'
                : 'Düzenlemek için bir etkileşim seçin'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedInteraction ? (
              <InteractionSettings
                interaction={selectedInteraction}
                onChange={(updates) => handleUpdateInteraction(selectedInteraction.id, updates)}
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
}: {
  interaction: Interaction
  onChange: (updates: Partial<Interaction>) => void
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
              <Label>Seçenekler</Label>
              {interaction.config.options?.map((option: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...interaction.config.options]
                      newOptions[index] = e.target.value
                      updateConfig('options', newOptions)
                    }}
                  />
                  <Badge variant={index === interaction.config.correctAnswer ? 'default' : 'secondary'}>
                    {index === interaction.config.correctAnswer ? '✓' : ''}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Doğru Cevap</Label>
              <Select
                value={interaction.config.correctAnswer.toString()}
                onValueChange={(value) => updateConfig('correctAnswer', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interaction.config.options?.map((_: string, index: number) => (
                    <SelectItem key={index} value={index.toString()}>
                      Seçenek {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {interaction.type === 'TEXT' && (
          <div className="space-y-2">
            <Label>Metin</Label>
            <Textarea
              value={interaction.config.text}
              onChange={(e) => updateConfig('text', e.target.value)}
            />
          </div>
        )}

        {interaction.type === 'IMAGE' && (
          <div className="space-y-2">
            <Label>Resim URL</Label>
            <Input
              value={interaction.config.url}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        {interaction.type !== 'HOTSPOT' && interaction.type !== 'IMAGE' && (
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
          <Input
            type="number"
            step="0.1"
            value={interaction.startTime}
            onChange={(e) => onChange({ startTime: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Bitiş Zamanı (saniye)</Label>
          <Input
            type="number"
            step="0.1"
            value={interaction.endTime || ''}
            onChange={(e) =>
              onChange({ endTime: e.target.value ? parseFloat(e.target.value) : undefined })
            }
          />
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
              className="absolute"
              style={{
                left: `${interaction.position.x}%`,
                top: `${interaction.position.y}%`,
                width: `${interaction.position.width}px`,
                height: `${interaction.position.height}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {interaction.type === 'BUTTON' && (
                <div
                  className="flex h-full w-full items-center justify-center shadow-md"
                  style={{
                    backgroundColor: interaction.config.style?.backgroundColor || '#3b82f6',
                    color: interaction.config.style?.color || '#ffffff',
                    borderRadius: `${interaction.config.style?.borderRadius || 8}px`,
                    fontSize: `${interaction.config.style?.fontSize || 16}px`,
                    fontFamily: interaction.config.style?.fontFamily,
                    fontWeight: interaction.config.style?.fontWeight,
                    textAlign: interaction.config.style?.textAlign || 'center',
                  }}
                >
                  {interaction.config.text}
                </div>
              )}

              {interaction.type === 'TEXT' && (
                <div
                  className="h-full w-full p-3"
                  style={{
                    backgroundColor: interaction.config.style?.backgroundColor || 'rgba(0, 0, 0, 0.7)',
                    color: interaction.config.style?.color || '#ffffff',
                    borderRadius: `${interaction.config.style?.borderRadius || 8}px`,
                    fontSize: `${interaction.config.style?.fontSize || 18}px`,
                    fontFamily: interaction.config.style?.fontFamily,
                    fontWeight: interaction.config.style?.fontWeight,
                    textAlign: interaction.config.style?.textAlign || 'left',
                  }}
                >
                  {interaction.config.text}
                </div>
              )}

              {interaction.type === 'HOTSPOT' && (
                <div
                  className="h-full w-full animate-pulse rounded-full border-2"
                  style={{
                    borderColor: interaction.config.style?.borderColor || '#3b82f6',
                    backgroundColor: interaction.config.style?.backgroundColor || 'rgba(59, 130, 246, 0.3)',
                  }}
                />
              )}

              {interaction.type === 'IMAGE' && interaction.config.url && (
                <img
                  src={interaction.config.url}
                  alt={interaction.config.alt || ''}
                  className="h-full w-full object-contain"
                  style={{ opacity: (interaction.config.opacity || 100) / 100 }}
                />
              )}

              {interaction.type === 'QUESTION' && (
                <div className="flex h-full w-full items-center justify-center rounded-lg border bg-white px-3 text-center font-medium text-black shadow-md">
                  {interaction.config.question || 'Soru'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
