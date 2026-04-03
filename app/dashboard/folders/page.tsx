import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Folder, FolderOpen, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function FoldersPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return <div>Oturum bulunamadı.</div>
  }

  // Kullanıcının videolarını al ve klasör ismine göre grupla
  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      folderId: true,
      thumbnailUrl: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Klasörleri belleke üzerinde grupla
  const groupedFolders: Record<string, typeof videos> = {
    'Genel': [] // Klasörü olmayanlar
  }

  videos.forEach((video: any) => {
    const folderName = video.folderId && video.folderId.trim() !== '' ? video.folderId : 'Genel'
    if (!groupedFolders[folderName]) {
      groupedFolders[folderName] = []
    }
    groupedFolders[folderName].push(video)
  })

  const folderNames = Object.keys(groupedFolders)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Klasörler</h2>
        <p className="text-muted-foreground">
          Videolarınızı alt kategorilere göre gruplandırarak projelerinizi organize edin.
        </p>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Klasör yapısı için video yükleyin</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Sistemde hiç video bulunmadığı için klasör özelliği devre dışı. İlk videonuzu yükleyerek başlayabilirsiniz.
            </p>
            <Link href="/dashboard/videos/new" className={cn(buttonVariants(), "mt-4")}>
              Video Yükle
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {folderNames.map((folderName) => {
            const folderVideos = groupedFolders[folderName]
            return (
              <Card key={folderName} className="flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {folderName}
                  </CardTitle>
                  <CardDescription>
                    Bu klasörde toplam {folderVideos.length} video bulunuyor.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {folderVideos.slice(0, 3).map((v: any) => (
                    <Link key={v.id} href={`/dashboard/videos/${v.id}/edit`} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors">
                      <div className="bg-muted w-10 h-10 rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
                        {v.thumbnailUrl ? (
                          <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <VideoIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{v.title}</p>
                      </div>
                    </Link>
                  ))}
                  {folderVideos.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center mt-2 border-t pt-2">
                      + {folderVideos.length - 3} video daha
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href={`/dashboard/videos?folderId=${encodeURIComponent(folderName)}`} className={cn(buttonVariants({ variant: 'outline' }), "w-full")}>
                      Tümünü Gör
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
