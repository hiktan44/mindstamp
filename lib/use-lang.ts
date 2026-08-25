'use client'

import { useEffect, useState } from 'react'

type Lang = 'tr' | 'en'

const COOKIE_NAME = 'ui_lang'
const COOKIE_MAX_AGE = 365 * 24 * 60 *60 // 1 year
const IP_CACHE_KEY = 'ip_country_cache'
const IP_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const IP_CHECK_TIMEOUT = 2500 // 2.5s timeout

// Event name for language changes
const LANG_CHANGE_EVENT = 'ui_lang_change'

/**
 * IP-based country detection with fallback services
 * Priority: ipapi.co → ipwho.is
 * Cached in sessionStorage for 24 hours
 */
async function detectCountry(): Promise<string | null> {
  // Check cache first
  const cached = sessionStorage.getItem(IP_CACHE_KEY)
  if (cached) {
    const { country, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < IP_CACHE_DURATION) {
      return country
    }
  }

  // Try ipapi.co first (more accurate for Turkey)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), IP_CHECK_TIMEOUT)
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const country = data.country_code || data.country
      if (country) {
        sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify({
          country,
          timestamp: Date.now()
        }))
        return country
      }
    }
  } catch (error) {
    console.log('ipapi.co failed, trying fallback')
  }

  // Fallback to ipwho.is
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), IP_CHECK_TIMEOUT)
    
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const country = data.country_code
      if (country) {
        sessionStorage.setItem(IP_CACHE_KEY, JSON.stringify({
          country,
          timestamp: Date.now()
        }))
        return country
      }
    }
  } catch (error) {
    console.log('ipwho.is failed')
  }

  return null
}

/**
 * Set cookie with language preference
 */
function setLangCookie(lang: Lang) {
  if (typeof document === 'undefined') return
  
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

/**
 * Get language from cookie
 */
function getLangCookie(): Lang | null {
  if (typeof document === 'undefined') return null
  
  const matches = document.cookie.match(
    new RegExp(`(^| )${COOKIE_NAME}=([^]+)`)
  )
  return (matches?.[2] as Lang) || null
}

/**
 * Main language hook
 * Priority: localStorage preference → IP detection → navigator.language → 'tr'
 */
export function useLang() {
  const [lang, setLangState] = useState<Lang>('tr')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Check localStorage preference first (highest priority)
    const stored = localStorage.getItem(COOKIE_NAME) as Lang | null
    if (stored && (stored === 'tr' || stored === 'en')) {
      setLangState(stored)
      setIsHydrated(true)
      return
    }

    // Check cookie
    const cookieLang = getLangCookie()
    if (cookieLang) {
      setLangState(cookieLang)
      localStorage.setItem(COOKIE_NAME, cookieLang)
      setIsHydrated(true)
      return
    }

    // No preference saved, detect from IP
    detectCountry().then((country) => {
      const storedNow = localStorage.getItem(COOKIE_NAME) as Lang | null
      if (storedNow === 'tr' || storedNow === 'en') {
        setLangState(storedNow)
        setIsHydrated(true)
        return
      }
      const detectedLang: Lang = country === 'TR' ? 'tr' : country ? 'en' : 'tr'
      setLangState(detectedLang)
      setIsHydrated(true)
    }).catch(() => {
      const browserLang = navigator.language.toLowerCase()
      const fallbackLang: Lang = browserLang.startsWith('tr') ? 'tr' : 'tr'
      setLangState(fallbackLang)
      setIsHydrated(true)
    })
  }, [])

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem(COOKIE_NAME) as Lang | null
      if (saved === 'tr' || saved === 'en') setLangState(saved)
    }
    window.addEventListener(LANG_CHANGE_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(LANG_CHANGE_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem(COOKIE_NAME, newLang)
    setLangCookie(newLang)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(LANG_CHANGE_EVENT))
    }
  }

  return {
    lang,
    setLang,
    isHydrated,
  }
}

/**
 * Helper to pick value based on language
 */
export function pickByLang<T>(lang: Lang, tr: T, en: T): T {
  return lang === 'tr' ? tr : en
}
