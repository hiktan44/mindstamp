'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  startTime?: number
  captions?: Array<{
    language: string
    url?: string | null
    content?: string | null
  }>
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

// Stable reference so an omitted `captions` prop doesn't create a new array each
// render (which would re-run the caption effect and loop setState).
const EMPTY_CAPTIONS: NonNullable<VideoPlayerProps['captions']> = []

export function VideoPlayer({
  src,
  poster,
  className,
  autoplay = false,
  muted = false,
  controls = true,
  startTime = 0,
  captions = EMPTY_CAPTIONS,
  onTimeUpdate,
  onDurationChange,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [captionTracks, setCaptionTracks] = useState<Array<{ language: string; url: string }>>([])

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Initialize HLS if needed
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let hls: Hls | null = null

    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ready to play if needed
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for native Safari HLS
        video.src = src
      }
    } else {
        // Standard video formats like .mp4
        video.src = src
    }

    video.muted = muted
    video.volume = muted ? 0 : volume
    if (startTime > 0) {
      video.currentTime = startTime
    }
    if (autoplay) {
      video.play().catch(() => null)
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, autoplay, muted, startTime, volume])

  useEffect(() => {
    const objectUrls: string[] = []
    const tracks = captions
      .map((caption) => {
        if (caption.url) return { language: caption.language, url: caption.url }
        if (!caption.content) return null

        const objectUrl = URL.createObjectURL(new Blob([caption.content], { type: 'text/vtt' }))
        objectUrls.push(objectUrl)
        return { language: caption.language, url: objectUrl }
      })
      .filter((caption): caption is { language: string; url: string } => Boolean(caption))

    setCaptionTracks(tracks)

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [captions])

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      onPause?.()
    } else {
      video.play().catch(() => null)
      onPlay?.()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, onPlay, onPause])

  // Volume control
  const handleVolumeChange = useCallback((value: number | readonly number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Array.isArray(value) ? value[0] : value
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume || 1
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  // Seek
  const handleSeek = useCallback((value: number | readonly number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Array.isArray(value) ? value[0] : value
    video.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  // Rewind
  const handleRewind = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, video.currentTime - 10)
  }, [])

  // Playback rate
  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]

    const video = videoRef.current
    if (video) {
      video.playbackRate = newRate
    }
    setPlaybackRate(newRate)
  }, [playbackRate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleRewind()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              duration,
              videoRef.current.currentTime + 10
            )
          }
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, handleRewind, toggleMute, toggleFullscreen, duration])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const container = containerRef.current
    container?.addEventListener('mousemove', resetTimeout)
    container?.addEventListener('click', resetTimeout)

    resetTimeout()

    return () => {
      clearTimeout(timeout)
      container?.removeEventListener('mousemove', resetTimeout)
      container?.removeEventListener('click', resetTimeout)
    }
  }, [isPlaying])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-video bg-black overflow-hidden group',
        className
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime
          setCurrentTime(time)
          onTimeUpdate?.(time)
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration)
          onDurationChange?.(e.currentTarget.duration)
        }}
        onEnded={() => {
          setIsPlaying(false)
          onEnded?.()
        }}
        onClick={togglePlay}
        playsInline
      >
        {captionTracks
          .map((caption) => (
            <track
              key={caption.language}
              src={caption.url}
              kind="subtitles"
              srcLang={caption.language}
              label={caption.language.toUpperCase()}
            />
          ))}
      </video>

      {/* Controls Overlay */}
      {controls && <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent',
          'transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 fill-white text-white" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="h-4 w-4 fill-white" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleRewind}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="flex-1" />

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-white hover:bg-white/20 text-xs"
              onClick={cyclePlaybackRate}
            >
              {playbackRate}x
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>}
    </div>
  )
}
