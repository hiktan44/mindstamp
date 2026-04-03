import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

export default function FoldersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Klasörler</h2>
        <p className="text-muted-foreground">
          Videolarınızı klasörler halinde düzenleyin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Klasör Yönetimi
          </CardTitle>
          <CardDescription>
            Klasör oluşturma özelliği yakında eklenecektir.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Henüz klasör bulunmuyor</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Klasörler oluşturarak videolarınızı projelerinize veya gruplara göre ayırabilirsiniz. 
            Bu özellik geliştirme aşamasındadır.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
