'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function GenieError({ reset }: { reset: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div>
          <h2 className="text-lg font-semibold">Genie AI sayfası yüklenemedi</h2>
          <p className="text-sm text-muted-foreground">Geçici bir hata oluştu. Tekrar deneyebilirsiniz.</p>
        </div>
        <Button onClick={() => reset()}>Tekrar dene</Button>
      </CardContent>
    </Card>
  )
}
