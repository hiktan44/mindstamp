'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoPlayer } from './video-player'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Menu, RotateCcw, X } from 'lucide-react'
import { applyVariableAssignments, evaluateRuntimeConditions, type RuntimeVariables } from '@/lib/video/runtime'

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
    captions?: Array<{ language: string; url?: string | null; content?: string | null }> | null
    chapters?: Array<{ id: string; title: string; startTime: number; endTime?: number | null }> | null
    endScreens?: Array<{
      enabled: boolean
      layout?: string | null
      message?: string | null
      buttonConfig?: any
    }> | null
  }
  embed?: boolean
  playerOptions?: {
    autoplay?: boolean
    muted?: boolean
    controls?: boolean
    startTime?: number
  }
}

export function InteractivePlayer({ video, embed = false, playerOptions }: InteractivePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false)
  const [showMagicMenu, setShowMagicMenu] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<Interaction | null>(null)
  const [questionAnswer, setQuestionAnswer] = useState<string | string[] | null>(null)
  const [questionResult, setQuestionResult] = useState<{ isCorrect: boolean | null } | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, any>>({})
  const [analyticsContext, setAnalyticsContext] = useState<{
    analyticsId: string
    sessionId: string
    viewerId: string
  } | null>(null)
  const [viewedInteractions, setViewedInteractions] = useState<Set<string>>(new Set())
  const [runtimeVariables, setRuntimeVariables] = useState<RuntimeVariables>({})
  const [showEndScreen, setShowEndScreen] = useState(false)
  
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' })
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)

  const playerRef = useRef<any>(null)
  const watchStartedAtRef = useRef<number>(Date.now())

  const postAnalytics = async (path: string, payload: Record<string, any>) => {
    try {
      await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function startAnalytics() {
      try {
        const response = await fetch('/api/analytics/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: video.id,
            referrer: document.referrer || null,
          }),
        })

        if (!response.ok) return
        const data = await response.json()
        if (!cancelled) setAnalyticsContext(data)
      } catch (error) {
        console.error('Analytics start error:', error)
      }
    }

    startAnalytics()
    return () => {
      cancelled = true
    }
  }, [video.id])

  useEffect(() => {
    if (!analyticsContext) return

    const interval = window.setInterval(() => {
      const watchTime = Math.max(0, (Date.now() - watchStartedAtRef.current) / 1000)
      postAnalytics('/api/analytics/heartbeat', {
        analyticsId: analyticsContext.analyticsId,
        sessionId: analyticsContext.sessionId,
        videoId: video.id,
        watchTime,
        progress: duration ? Math.min(100, (currentTime / duration) * 100) : 0,
        currentTime,
      })
    }, 10000)

    return () => window.clearInterval(interval)
  }, [analyticsContext, currentTime, duration, video.id])

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
    if (!evaluateRuntimeConditions(interaction.logic?.conditions, runtimeVariables)) {
      return false
    }

    if (interaction.endTime) {
      return currentTime >= interaction.startTime && currentTime <= interaction.endTime
    }
    return currentTime >= interaction.startTime
  })

  useEffect(() => {
    if (!analyticsContext) return

    const newlyVisible = visibleInteractions.filter((interaction) => !viewedInteractions.has(interaction.id))
    if (newlyVisible.length === 0) return

    setViewedInteractions((previous) => {
      const next = new Set(previous)
      newlyVisible.forEach((interaction) => next.add(interaction.id))
      return next
    })

    newlyVisible.forEach((interaction) => {
      postAnalytics('/api/analytics/interaction', {
        analyticsId: analyticsContext.analyticsId,
        sessionId: analyticsContext.sessionId,
        videoId: video.id,
        interactionId: interaction.id,
        eventType: 'view',
        data: {
          type: interaction.type,
          currentTime,
        },
      })
    })
  }, [analyticsContext, currentTime, video.id, viewedInteractions, visibleInteractions])

  const trackInteraction = (interaction: Interaction, eventType: 'click' | 'submit', data?: Record<string, any>) => {
    if (!analyticsContext) return

    postAnalytics('/api/analytics/interaction', {
      analyticsId: analyticsContext.analyticsId,
      sessionId: analyticsContext.sessionId,
      videoId: video.id,
      interactionId: interaction.id,
      eventType,
      data: {
        type: interaction.type,
        currentTime,
        ...data,
      },
    })
  }

  const handleInteractionClick = (e: React.MouseEvent | React.PointerEvent, interaction: Interaction) => {
    e.stopPropagation()
    e.preventDefault()

    if (!interaction.config?.action) return

    trackInteraction(interaction, 'click')

    if (interaction.variables) {
      setRuntimeVariables((current) => applyVariableAssignments(current, interaction.variables))
    }

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
      case 'REDIRECT_LINK':
        if (interaction.config.url) {
          window.location.href = interaction.config.url
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
      case 'SWITCH_VIDEO':
        if (interaction.config.switchVideoId) {
          window.location.href = `/watch/${interaction.config.switchVideoId}`
        }
        break
      case 'SET_VARIABLE':
        setRuntimeVariables((current) => applyVariableAssignments(current, interaction.config.variables))
        break
      case 'RESET_VIEWER_STATE':
        setRuntimeVariables({})
        setAnsweredQuestions({})
        setViewedInteractions(new Set())
        break
      case 'RESET_INTERACTIONS':
        setAnsweredQuestions({})
        setViewedInteractions(new Set())
        break
      case 'OPEN_MAGIC_MENU':
        setShowMagicMenu(true)
        break
      default:
        break
    }
  }

  const handleInteractionPointer = (e: React.MouseEvent | React.PointerEvent, interaction: Interaction) => {
    if (interaction.type === 'QUESTION') {
      e.stopPropagation()
      e.preventDefault()
      if (answeredQuestions[interaction.id]) {
        setQuestionResult({ isCorrect: answeredQuestions[interaction.id].isCorrect })
      } else {
        setQuestionAnswer(null)
        setQuestionResult(null)
      }
      setActiveQuestion(interaction)
      const videoEl = document.querySelector('video')
      if (videoEl) videoEl.pause()
      return
    }

    handleInteractionClick(e, interaction)
  }

  const handleQuestionSubmit = () => {
    if (!activeQuestion || questionAnswer === null) return

    const config = activeQuestion.config || {}
    const answerText = Array.isArray(questionAnswer) ? questionAnswer : String(questionAnswer)
    const correctAnswer = config.options?.[config.correctAnswer]
    const isCorrect = correctAnswer === undefined ? null : answerText === correctAnswer
    const result = { answer: answerText, isCorrect }

    setAnsweredQuestions((previous) => ({ ...previous, [activeQuestion.id]: result }))
    setRuntimeVariables((current) => ({
      ...current,
      [`question.${activeQuestion.id}.answer`]: Array.isArray(answerText) ? answerText.join(',') : answerText,
      [`question.${activeQuestion.id}.correct`]: isCorrect,
      score: Number(current.score || 0) + (isCorrect ? 1 : 0),
    }))
    setQuestionResult({ isCorrect })
    trackInteraction(activeQuestion, 'submit', result)
  }

  const handleQuestionContinue = () => {
    setActiveQuestion(null)
    setQuestionAnswer(null)
    setQuestionResult(null)
    const videoEl = document.querySelector('video')
    if (videoEl) videoEl.play().catch(() => null)
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    const endScreen = video.endScreens?.[0]
    if (endScreen?.enabled) {
      setShowEndScreen(true)
    }
    if (!analyticsContext) return

    const watchTime = Math.max(0, (Date.now() - watchStartedAtRef.current) / 1000)
    postAnalytics('/api/analytics/complete', {
      analyticsId: analyticsContext.analyticsId,
      sessionId: analyticsContext.sessionId,
      videoId: video.id,
      watchTime,
      progress: 100,
    })
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
      <VideoPlayer
        src={video.hlsUrl || video.videoUrl || ''}
        poster={video.thumbnailUrl || undefined}
        autoplay={playerOptions?.autoplay}
        muted={playerOptions?.muted}
        controls={playerOptions?.controls}
        startTime={playerOptions?.startTime}
        captions={video.captions || []}
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
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
              onPointerDown={(e) => handleInteractionPointer(e, interaction)}
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

              {interaction.type === 'QUESTION' && (
                <div
                  className="w-full h-full flex items-center justify-center text-center font-medium rounded-lg bg-white text-black shadow-md border"
                >
                  {interaction.config.question || 'Soru'}
                </div>
              )}
            </div>
          )
        })}
      </div>
      )}

      {activeQuestion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background text-foreground rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {activeQuestion.config.question || 'Soru'}
              </h3>

              {!questionResult ? (
                <div className="space-y-2">
                  {(activeQuestion.config.options || []).map((option: string, index: number) => (
                    <button
                      key={`${activeQuestion.id}-${index}`}
                      type="button"
                      onClick={() => setQuestionAnswer(option)}
                      className={cn(
                        'w-full text-left rounded-lg border p-3 transition-colors',
                        questionAnswer === option ? 'border-primary bg-primary/15' : 'hover:bg-muted'
                      )}
                    >
                      <span className="mr-2 font-mono text-xs">{String.fromCharCode(65 + index)}</span>
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className={cn(
                    'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
                    questionResult.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  )}>
                    {questionResult.isCorrect ? <CheckCircle2 className="h-8 w-8" /> : <X className="h-8 w-8" />}
                  </div>
                  <p className="font-semibold">
                    {questionResult.isCorrect === null
                      ? 'Cevabınız kaydedildi'
                      : questionResult.isCorrect
                        ? 'Doğru!'
                        : 'Yanlış'}
                  </p>
                  {questionResult.isCorrect === false && activeQuestion.config.options?.[activeQuestion.config.correctAnswer] && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Doğru cevap: {activeQuestion.config.options[activeQuestion.config.correctAnswer]}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between gap-2 border-t bg-muted/40 p-4">
              <Button variant="ghost" onClick={handleQuestionContinue}>
                Kapat
              </Button>
              {!questionResult ? (
                <Button onClick={handleQuestionSubmit} disabled={questionAnswer === null}>
                  Gönder
                </Button>
              ) : (
                <Button onClick={handleQuestionContinue}>
                  Devam Et
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showEndScreen && video.endScreens?.[0]?.enabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 text-white">
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur">
            <h3 className="text-2xl font-semibold mb-3">
              {video.endScreens[0].message || 'Video tamamlandı'}
            </h3>
            <p className="text-sm text-white/75 mb-6">
              Skor: {Number(runtimeVariables.score || 0)} / {interactions.filter((interaction) => interaction.type === 'QUESTION').length || 0}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEndScreen(false)
                  const videoEl = document.querySelector('video')
                  if (videoEl) {
                    videoEl.currentTime = 0
                    videoEl.play().catch(() => null)
                  }
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Tekrar İzle
              </Button>
              {video.endScreens[0].buttonConfig?.url && (
                <Button
                  onClick={() => {
                    window.location.href = video.endScreens?.[0]?.buttonConfig?.url
                  }}
                >
                  {video.endScreens[0].buttonConfig?.label || 'Devam Et'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
