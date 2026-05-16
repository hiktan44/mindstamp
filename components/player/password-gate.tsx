'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

export function PasswordGate({ videoId }: { videoId: string }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const response = await fetch(`/api/videos/${videoId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Şifre hatalı veya video açılamadı.')
      return
    }

    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Şifre Gerekli</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Bu videoyu izlemek için paylaşım şifresini girin.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-password">Video Şifresi</Label>
              <Input
                id="video-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Kontrol ediliyor...' : 'Videoyu Aç'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

