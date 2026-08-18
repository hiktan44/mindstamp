'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import type { PlayerHandle } from './player-handle'
import type { VideoSource } from '@/lib/video/providers'

interface EmbedPlayerProps {
  source: VideoSource // type: 'youtube' | 'vimeo'
  className?: string
  autoplay?: boolean
  muted?: boolean
  startTime?: number
  onTimeUpdate?: (currentTime: number) => void
  onDurationChange?: (duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

// --- Harici SDK script yükleyiciler (tek sefer, paylaşımlı promise) ---

let ytApiPromise: Promise<any> | null = null
function loadYouTubeApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  const w = window as any
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT)
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(w.YT)
    }
    if (!document.querySelector('script[data-yt-iframe-api]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.setAttribute('data-yt-iframe-api', 'true')
      document.head.appendChild(tag)
    }
  })
  return ytApiPromise
}

let vimeoApiPromise: Promise<any> | null = null
function loadVimeoApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  const w = window as any
  if (w.Vimeo && w.Vimeo.Player) return Promise.resolve(w.Vimeo)
  if (vimeoApiPromise) return vimeoApiPromise

  vimeoApiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-vimeo-api]'
    )
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).Vimeo))
      existing.addEventListener('error', reject)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://player.vimeo.com/api/player.js'
    tag.async = true
    tag.setAttribute('data-vimeo-api', 'true')
    tag.onload = () => resolve((window as any).Vimeo)
    tag.onerror = reject
    document.head.appendChild(tag)
  })
  return vimeoApiPromise
}

export const EmbedPlayer = forwardRef<PlayerHandle, EmbedPlayerProps>(
  function EmbedPlayer(
    {
      source,
      className,
      autoplay = false,
      muted = false,
      startTime = 0,
      onTimeUpdate,
      onDurationChange,
      onPlay,
      onPause,
      onEnded,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const pollRef = useRef<number | null>(null)
    const [failed, setFailed] = useState(false)

    // Callback'leri ref'te tut ki oynatıcı efekti gereksiz yeniden kurulmasın.
    const cbRef = useRef({ onTimeUpdate, onDurationChange, onPlay, onPause, onEnded })
    useEffect(() => {
      cbRef.current = { onTimeUpdate, onDurationChange, onPlay, onPause, onEnded }
    })

    useImperativeHandle(
      ref,
      (): PlayerHandle => ({
        play: () => {
          const p = playerRef.current
          if (!p) return
          if (source.type === 'youtube') p.playVideo?.()
          else p.play?.()
        },
        pause: () => {
          const p = playerRef.current
          if (!p) return
          if (source.type === 'youtube') p.pauseVideo?.()
          else p.pause?.()
        },
        seek: (time: number) => {
          const p = playerRef.current
          if (!p) return
          if (source.type === 'youtube') p.seekTo?.(time, true)
          else p.setCurrentTime?.(time)
        },
        getCurrentTime: () => {
          const p = playerRef.current
          if (!p) return 0
          if (source.type === 'youtube') return p.getCurrentTime?.() ?? 0
          return lastTimeRef.current // vimeo async; son bilinen değer
        },
        getDuration: () => {
          const p = playerRef.current
          if (!p) return 0
          if (source.type === 'youtube') return p.getDuration?.() ?? 0
          return lastDurationRef.current
        },
      }),
      [source.type]
    )

    const lastTimeRef = useRef(0)
    const lastDurationRef = useRef(0)

    useEffect(() => {
      let cancelled = false
      const startPolling = (getTime: () => number) => {
        const tick = () => {
          const t = getTime()
          if (Number.isFinite(t)) {
            lastTimeRef.current = t
            cbRef.current.onTimeUpdate?.(t)
          }
          pollRef.current = window.setTimeout(tick, 250)
        }
        tick()
      }

      if (source.type === 'youtube') {
        loadYouTubeApi()
          .then((YT) => {
            if (cancelled || !containerRef.current) return
            playerRef.current = new YT.Player(containerRef.current, {
              videoId: source.id,
              playerVars: {
                autoplay: autoplay ? 1 : 0,
                mute: muted ? 1 : 0,
                start: Math.floor(startTime) || 0,
                playsinline: 1,
                rel: 0,
                modestbranding: 1,
              },
              events: {
                onReady: (e: any) => {
                  const d = e.target.getDuration?.() ?? 0
                  lastDurationRef.current = d
                  cbRef.current.onDurationChange?.(d)
                  if (muted) e.target.mute?.()
                  if (autoplay) e.target.playVideo?.()
                  startPolling(() => playerRef.current?.getCurrentTime?.() ?? 0)
                },
                onStateChange: (e: any) => {
                  // YT.PlayerState: 1 playing, 2 paused, 0 ended
                  if (e.data === 1) cbRef.current.onPlay?.()
                  else if (e.data === 2) cbRef.current.onPause?.()
                  else if (e.data === 0) cbRef.current.onEnded?.()
                  const d = playerRef.current?.getDuration?.() ?? 0
                  if (d && d !== lastDurationRef.current) {
                    lastDurationRef.current = d
                    cbRef.current.onDurationChange?.(d)
                  }
                },
              },
            })
          })
          .catch(() => !cancelled && setFailed(true))
      } else if (source.type === 'vimeo') {
        loadVimeoApi()
          .then((Vimeo) => {
            if (cancelled || !containerRef.current) return
            const player = new Vimeo.Player(containerRef.current, {
              id: source.id,
              autoplay,
              muted,
              playsinline: true,
            })
            playerRef.current = player

            player.ready().then(() => {
              if (startTime > 0) player.setCurrentTime(startTime).catch(() => null)
              player.getDuration().then((d: number) => {
                lastDurationRef.current = d
                cbRef.current.onDurationChange?.(d)
              })
            })
            player.on('play', () => cbRef.current.onPlay?.())
            player.on('pause', () => cbRef.current.onPause?.())
            player.on('ended', () => cbRef.current.onEnded?.())
            player.on('timeupdate', (data: any) => {
              if (typeof data?.seconds === 'number') {
                lastTimeRef.current = data.seconds
                cbRef.current.onTimeUpdate?.(data.seconds)
              }
              if (typeof data?.duration === 'number') {
                lastDurationRef.current = data.duration
              }
            })
          })
          .catch(() => !cancelled && setFailed(true))
      }

      return () => {
        cancelled = true
        if (pollRef.current) window.clearTimeout(pollRef.current)
        const p = playerRef.current
        try {
          if (source.type === 'youtube') p?.destroy?.()
          else p?.destroy?.()
        } catch {
          // yoksay
        }
        playerRef.current = null
      }
      // Kaynak değişince yeniden kur.
    }, [source.type, source.id, autoplay, muted, startTime])

    if (failed) {
      return (
        <div
          className={cn(
            'relative aspect-video bg-black flex items-center justify-center text-white/80 text-sm p-4 text-center',
            className
          )}
        >
          Video oynatıcı yüklenemedi. Lütfen bağlantıyı kontrol edin.
        </div>
      )
    }

    return (
      <div
        className={cn('relative aspect-video bg-black overflow-hidden', className)}
      >
        {/* YouTube API bu div'i iframe ile değiştirir; Vimeo bunun içine iframe ekler. */}
        <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
      </div>
    )
  }
)
