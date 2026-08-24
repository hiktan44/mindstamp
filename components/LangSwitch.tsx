'use client'

import { useLang } from '@/lib/use-lang'
import { useState, useEffect } from 'react'

export function LangSwitch() {
  const { lang, setLang, isHydrated } = useLang()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isHydrated) {
    return (
      <div className="flex items-center gap-1 rounded-lg border-2 border-[#1a1a1a] bg-white p-1 text-sm font-bold">
        <div className="h-5 w-8 animate-pulse bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border-2 border-[#1a1a1a] bg-white p-1 text-sm font-bold">
      <button
        onClick={() => setLang('tr')}
        className={`rounded px-2 py-1 transition ${
          lang === 'tr' 
            ? 'bg-[#1a1a1a] text-white' 
            : 'text-[#1a1a1a] hover:bg-gray-100'
        }`}
        aria-label="Switch to Turkish"
      >
        TR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`rounded px-2 py-1 transition ${
          lang === 'en' 
            ? 'bg-[#1a1a1a] text-white' 
            : 'text-[#1a1a1a] hover:bg-gray-100'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
