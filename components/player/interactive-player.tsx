'use client'

import { useState, useRef } from 'react'
import { VideoPlayer } from './video-player'
import { cn } from '@/lib/utils'

interface Interaction {
  id: string
  type: string
  startTime: number
  endTime?: number
  config: any
  position?: { x: number; y: number; width: number; height: number }
}

interface InteractivePlayerProps {
  video: {
    id: string
    hlsUrl?: string
    videoUrl?: string
    thumbnailUrl?: string
    interactions?: Interaction[]
  }
}

export function InteractivePlayer({ video }: InteractivePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<any>(null)

  const interactions = video.interactions || []

  const visibleInteractions = interactions.filter((interaction) => {
    if (interaction.endTime) {
      return currentTime >= interaction.startTime && currentTime <= interaction.endTime
    }
    return currentTime >= interaction.startTime
  })

  const handleInteractionClick = (interaction: Interaction) => {
    if (!interaction.config?.action) return

    switch (interaction.config.action) {
      case 'OPEN_LINK':
        if (interaction.config.url) {
          window.open(interaction.config.url, '_blank')
        }
        break
      case 'PAUSE':
        // The VideoPlayer component doesn't currently expose a way to pause programmatically
        // without a ref to the internal video element. A quick hack is to click the video:
        const videoEl = document.querySelector('video')
        if (videoEl) videoEl.pause()
        break
      case 'CHANGE_TIME':
        if (interaction.config.targetTime !== undefined) {
          const videoEl = document.querySelector('video')
          if (videoEl) videoEl.currentTime = interaction.config.targetTime
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
        className="w-full h-full"
      />

      {/* Interactions Overlay */}
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
              onClick={() => handleInteractionClick(interaction)}
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
    </div>
  )
}
