import { Card, CardContent } from '@/components/ui/card'

export default function FoldersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-36 rounded bg-muted" />
        <div className="mt-2 h-5 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item}>
            <CardContent className="h-48 animate-pulse bg-muted/40" />
          </Card>
        ))}
      </div>
    </div>
  )
}
