'use client'

import { cn } from '@/lib/utils'

interface SeekButtonProps {
  time: number
  className?: string
  children: React.ReactNode
}

/**
 * Client-side button that seeks the page's <video> element to a given time.
 * Used by the (server-rendered) watch page sidebar so that onClick handlers
 * are not passed from a Server Component (which would throw).
 */
export function SeekButton({ time, className, children }: SeekButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        const videoEl = document.querySelector('video')
        if (videoEl) {
          videoEl.currentTime = time
          videoEl.play().catch(() => null)
        }
      }}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left',
        className
      )}
    >
      {children}
    </button>
  )
}
