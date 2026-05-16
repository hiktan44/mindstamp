import { Card, CardContent } from '@/components/ui/card'

export default function GenieLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-40 rounded bg-muted" />
        <div className="mt-2 h-5 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="h-40 animate-pulse bg-muted/40" />
        </Card>
        <Card>
          <CardContent className="h-40 animate-pulse bg-muted/40" />
        </Card>
      </div>
    </div>
  )
}
