'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, CheckCircle2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Interaction {
  id: string
  type: 'BUTTON' | 'HOTSPOT' | 'QUESTION' | 'TEXT' | 'IMAGE'
  startTime: number
  endTime?: number
  config: any
  position?: { x: number; y: number; width: number; height: number }
}

interface InteractionOverlayProps {
  interactions: Interaction[]
  currentTime: number
  onInteractionClick?: (interaction: Interaction) => void
  onInteractionSubmit?: (interaction: Interaction, data: any) => void
  readOnly?: boolean
}

export function InteractionOverlay({
  interactions,
  currentTime,
  onInteractionClick,
  onInteractionSubmit,
  readOnly = false,
}: InteractionOverlayProps) {
  const [visibleInteractions, setVisibleInteractions] = useState<Interaction[]>([])
  const [activeInteraction, setActiveInteraction] = useState<Interaction | null>(null)
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null)
  const [questionSubmitted, setQuestionSubmitted] = useState(false)

  useEffect(() => {
    const visible = interactions.filter((interaction) => {
      if (interaction.endTime) {
        return currentTime >= interaction.startTime && currentTime <= interaction.endTime
      }
      return currentTime >= interaction.startTime
    })
    setVisibleInteractions(visible)
  }, [currentTime, interactions])

  // Reset question state when interaction changes
  useEffect(() => {
    if (activeInteraction && activeInteraction.type !== 'QUESTION') {
      setQuestionAnswer(null)
      setQuestionSubmitted(false)
    }
  }, [activeInteraction])

  const handleClick = (interaction: Interaction) => {
    if (readOnly) return

    if (interaction.type === 'QUESTION') {
      setActiveInteraction(interaction)
    } else if (onInteractionClick) {
      onInteractionClick(interaction)
    }

    // Handle button click action
    if (interaction.type === 'BUTTON' && interaction.config.action) {
      handleButtonAction(interaction)
    }
  }

  const handleButtonAction = async (interaction: Interaction) => {
    const { action, linkUrl, targetTime, switchVideoId, message } = interaction.config

    switch (action) {
      case 'CONTINUE':
        // Continue playing (do nothing, video continues)
        break

      case 'OPEN_LINK':
        if (linkUrl) {
          window.open(linkUrl, '_blank')
        }
        break

      case 'CHANGE_TIME':
        if (targetTime !== undefined) {
          const video = document.querySelector('video')
          if (video) {
            video.currentTime = targetTime
          }
        }
        break

      case 'SWITCH_VIDEO':
        if (switchVideoId) {
          window.location.href = `/watch/${switchVideoId}`
        }
        break

      case 'SHOW_MESSAGE':
        if (message) {
          alert(message) // TODO: Replace with proper toast/modal
        }
        break

      case 'PAUSE':
        const video = document.querySelector('video')
        if (video) {
          video.pause()
        }
        break
    }
  }

  const handleQuestionSubmit = () => {
    if (!activeInteraction || !questionAnswer) return

    const isCorrect = questionAnswer === activeInteraction.config.options?.[activeInteraction.config.correctAnswer]

    setQuestionSubmitted(true)

    if (onInteractionSubmit) {
      onInteractionSubmit(activeInteraction, {
        answer: questionAnswer,
        isCorrect,
      })
    }

    // Track analytics
    // TODO: Send to analytics API
  }

  const getInteractionStyle = (interaction: Interaction) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      cursor: readOnly ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
    }

    if (interaction.position) {
      baseStyle.left = `${interaction.position.x}%`
      baseStyle.top = `${interaction.position.y}%`
      baseStyle.transform = 'translate(-50%, -50%)'
      baseStyle.width = `${interaction.position.width}px`
      baseStyle.height = `${interaction.position.height}px`
    }

    return baseStyle
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visibleInteractions.map((interaction) => {
        const isActive = activeInteraction?.id === interaction.id

        return (
          <div
            key={interaction.id}
            style={getInteractionStyle(interaction)}
            className={cn(
              'pointer-events-auto',
              !readOnly && 'hover:scale-105'
            )}
            onClick={() => handleClick(interaction)}
          >
            {/* BUTTON */}
            {interaction.type === 'BUTTON' && (
              <div
                className="w-full h-full flex items-center justify-center rounded-lg font-medium transition-shadow hover:shadow-lg"
                style={{
                  backgroundColor: interaction.config.style?.backgroundColor,
                  color: interaction.config.style?.color,
                  borderRadius: `${interaction.config.style?.borderRadius}px`,
                  fontSize: `${interaction.config.style?.fontSize}px`,
                }}
              >
                {interaction.config.text}
              </div>
            )}

            {/* HOTSPOT */}
            {interaction.type === 'HOTSPOT' && (
              <div
                className="w-full h-full rounded-full border-2 animate-pulse flex items-center justify-center"
                style={{
                  borderColor: interaction.config.style?.borderColor,
                  backgroundColor: interaction.config.style?.backgroundColor,
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            )}

            {/* TEXT */}
            {interaction.type === 'TEXT' && (
              <div
                className="w-full h-full p-4 rounded-lg"
                style={{
                  backgroundColor: interaction.config.style?.backgroundColor,
                  color: interaction.config.style?.color,
                  fontSize: `${interaction.config.style?.fontSize}px`,
                }}
              >
                {interaction.config.text}
              </div>
            )}

            {/* IMAGE */}
            {interaction.type === 'IMAGE' && (
              <div className="w-full h-full">
                {interaction.config.url ? (
                  <img
                    src={interaction.config.url}
                    alt={interaction.config.alt || ''}
                    className="w-full h-full object-contain"
                    style={{ opacity: (interaction.config.opacity || 100) / 100 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                    <span className="text-xs text-muted-foreground">Resim Yok</span>
                  </div>
                )}
              </div>
            )}

            {/* QUESTION Modal */}
            {interaction.type === 'QUESTION' && isActive && !questionSubmitted && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 pointer-events-auto z-50">
                <div
                  className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
                  style={{
                    backgroundColor: interaction.config.style?.backgroundColor,
                    color: interaction.config.style?.color,
                  }}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {interaction.config.question}
                    </h3>
                    <div className="space-y-2">
                      {interaction.config.options?.map((option: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setQuestionAnswer(option)}
                          className={cn(
                            'w-full p-3 text-left rounded-lg border transition-colors',
                            questionAnswer === option
                              ? 'border-primary bg-primary/20'
                              : 'border-border hover:bg-muted'
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-medium">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveInteraction(null)
                        setQuestionAnswer(null)
                      }}
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleQuestionSubmit}
                      disabled={!questionAnswer}
                    >
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION Result */}
            {interaction.type === 'QUESTION' && isActive && questionSubmitted && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 pointer-events-auto z-50">
                <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4',
                      questionAnswer === interaction.config.options?.[interaction.config.correctAnswer]
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                    )}
                  >
                    {questionAnswer === interaction.config.options?.[interaction.config.correctAnswer] ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : (
                      <X className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {questionAnswer === interaction.config.options?.[interaction.config.correctAnswer]
                      ? 'Doğru!'
                      : 'Yanlış'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {questionAnswer === interaction.config.options?.[interaction.config.correctAnswer]
                      ? 'Tebrikler, doğru cevabı verdiniz!'
                      : `Doğru cevap: ${interaction.config.options?.[interaction.config.correctAnswer]}`}
                  </p>
                  <Button onClick={() => {
                    setActiveInteraction(null)
                    setQuestionSubmitted(false)
                    setQuestionAnswer(null)
                  }}>
                    Devam Et
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
