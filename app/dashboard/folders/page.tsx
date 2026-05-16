import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Folder, FolderOpen, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type FolderVideo = {
  id: string
  title: string
  folderId: string | null
  thumbnailUrl: string | null
}

const primaryLinkClass =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const outlineLinkClass =
  "inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export default async function FoldersPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/giris?callbackUrl=/dashboard/folders')
  }

  let videos: FolderVideo[] = []
  let dataError = false

  try {
    videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        folderId: true,
        thumbnailUrl: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Folders dashboard data load failed:', error)
    dataError = true
  }

  // Klasörleri belleke üzerinde grupla
  const groupedFolders: Record<string, typeof videos> = {
    'Genel': [] // Klasörü olmayanlar
  }

  videos.forEach((video) => {
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

      {dataError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Klasör verileri yüklenemedi</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Sayfa açıldı fakat video klasörleri alınırken geçici bir hata oluştu.
            </p>
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center border-t">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Klasör yapısı için video yükleyin</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Sistemde hiç video bulunmadığı için klasör özelliği devre dışı. İlk videonuzu yükleyerek başlayabilirsiniz.
            </p>
            <Link href="/dashboard/videos/new" className={`${primaryLinkClass} mt-4`}>
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
                  {folderVideos.slice(0, 3).map((v) => (
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
                  <Link href={`/dashboard/videos?folderId=${encodeURIComponent(folderName)}`} className={outlineLinkClass}>
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
