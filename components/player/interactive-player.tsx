'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoPlayer } from './video-player'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Menu, X } from 'lucide-react'

interface Interaction {
  id: string
  type: string
  startTime: number
  endTime?: number | null
  config: any
  position?: { x: number; y: number; width: number; height: number } | any
  style?: any
  variables?: any
  logic?: any
}

interface InteractivePlayerProps {
  video: {
    id: string
    hlsUrl?: string | null
    videoUrl?: string | null
    thumbnailUrl?: string | null
    interactions?: Interaction[] | null
    settings?: any
  }
}

export function InteractivePlayer({ video }: InteractivePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false)
  const [showMagicMenu, setShowMagicMenu] = useState(false)
  
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' })
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)

  const playerRef = useRef<any>(null)

  // Track lead capture timing
  useEffect(() => {
    if (!video.settings?.leadCapture?.enabled || hasSubmittedLead) return

    const targetTime = video.settings.leadCapture.time || 0
    if (currentTime >= targetTime && !showLeadForm) {
      setShowLeadForm(true)
      // Pause video
      const videoEl = document.querySelector('video')
      if (videoEl) videoEl.pause()
    }
  }, [currentTime, video.settings, hasSubmittedLead, showLeadForm])

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingLead(true)

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          ...leadForm
        })
      })
      
      setHasSubmittedLead(true)
      setShowLeadForm(false)
      
      // Resume video
      const videoEl = document.querySelector('video')
      if (videoEl) videoEl.play()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmittingLead(false)
    }
  }

  const interactions = video.interactions || []

  const visibleInteractions = interactions.filter((interaction) => {
    if (interaction.endTime) {
      return currentTime >= interaction.startTime && currentTime <= interaction.endTime
    }
    return currentTime >= interaction.startTime
  })

  const handleInteractionClick = (e: React.MouseEvent | React.PointerEvent, interaction: Interaction) => {
    e.stopPropagation()
    e.preventDefault()

    if (!interaction.config?.action) return

    switch (interaction.config.action) {
      case 'OPEN_LINK':
        if (interaction.config.url) {
          // If URL doesn't have http/https, prepend it
          let targetUrl = interaction.config.url;
          if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
          }
          window.open(targetUrl, '_blank')
        }
        break
      case 'PAUSE':
        // The VideoPlayer component doesn't currently expose a way to pause programmatically
        // without a ref to the internal video element. A quick hack is to click the video:
        const videoElPause = document.querySelector('video')
        if (videoElPause && !videoElPause.paused) {
           videoElPause.pause()
        }
        break
      case 'CHANGE_TIME':
        if (interaction.config.targetTime !== undefined) {
          const videoElTime = document.querySelector('video')
          if (videoElTime) {
             videoElTime.currentTime = interaction.config.targetTime;
             videoElTime.play().catch(e => console.error("Could not resume playback", e));
          }
        }
        break
      // CONTINUOS actions need no code
      default:
        break
    }
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
      <VideoPlayer
        src={video.hlsUrl || video.videoUrl || ''}
        poster={video.thumbnailUrl || undefined}
        onTimeUpdate={setCurrentTime}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={cn("w-full h-full", showLeadForm && "blur-sm brightness-50")}
      />

      {/* Lead Capture Overlay */}
      {showLeadForm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-center">
              {video.settings?.leadCapture?.title || 'Videoyu İzlemek İçin Devam Edin'}
            </h3>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              {video.settings?.leadCapture?.requireName && (
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input 
                    required 
                    value={leadForm.name} 
                    onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>E-posta</Label>
                <Input 
                  required 
                  type="email" 
                  value={leadForm.email} 
                  onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                />
              </div>

              {video.settings?.leadCapture?.requirePhone && (
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input 
                    required 
                    type="tel" 
                    value={leadForm.phone} 
                    onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmittingLead}>
                {isSubmittingLead ? 'Gönderiliyor...' : 'Devam Et'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Magic Menu Overlay */}
      {video.settings?.magicMenu?.enabled && !showLeadForm && (
        <div className="absolute top-4 right-4 z-40">
          {!showMagicMenu ? (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setShowMagicMenu(true)
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl w-48 border border-white/10 animate-in slide-in-from-top-2 fade-in">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <span className="font-semibold text-white">Menü</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMagicMenu(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 flex flex-col">
                {(video.settings?.magicMenu?.items || []).map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactions Overlay */}
      {!showLeadForm && (
        <div className="absolute inset-0 pointer-events-none z-10 p-2">
        {visibleInteractions.map((interaction) => {
          if (!interaction.position) return null
          return (
            <div
              key={interaction.id}
              className="absolute pointer-events-auto cursor-pointer transition-opacity"
              style={{
                left: `${interaction.position.x}%`,
                top: `${interaction.position.y}%`,
                width: `${interaction.position.width}px`,
                height: `${interaction.position.height}px`,
                transform: 'translate(-50%, -50%)', // Centered around x,y
              }}
              onClick={(e) => handleInteractionClick(e, interaction)}
              onPointerDown={(e) => handleInteractionClick(e, interaction)}
            >
              {interaction.type === 'BUTTON' && (
                <div
                  className="w-full h-full flex items-center justify-center text-center font-medium shadow-md transition-transform hover:scale-105"
                  style={{
                    backgroundColor: interaction.config.style?.backgroundColor || '#3b82f6',
                    color: interaction.config.style?.color || '#ffffff',
                    borderRadius: `${interaction.config.style?.borderRadius || 8}px`,
                    fontSize: `${interaction.config.style?.fontSize || 16}px`,
                  }}
                >
                  {interaction.config.text}
                </div>
              )}

              {interaction.type === 'TEXT' && (
                <div
                  className="w-full h-full p-3 flex"
                  style={{
                    backgroundColor: interaction.config.style?.backgroundColor || 'rgba(0,0,0,0.7)',
                    color: interaction.config.style?.color || '#ffffff',
                    fontSize: `${interaction.config.style?.fontSize || 18}px`,
                    borderRadius: '8px',
                  }}
                >
                  {interaction.config.text}
                </div>
              )}

              {interaction.type === 'IMAGE' && interaction.config.url && (
                <img
                  src={interaction.config.url}
                  alt={interaction.config.alt || 'Interaction Image'}
                  className="w-full h-full object-contain"
                  style={{
                    opacity: (interaction.config.opacity || 100) / 100
                  }}
                />
              )}

              {interaction.type === 'HOTSPOT' && (
                <div
                  className="w-full h-full rounded-full border-2 animate-pulse"
                  style={{
                    borderColor: interaction.config.style?.borderColor || '#3b82f6',
                    backgroundColor: interaction.config.style?.backgroundColor || 'rgba(59, 130, 246, 0.3)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
