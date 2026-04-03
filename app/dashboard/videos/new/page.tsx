'use client'

import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/upload-zone'
import { toast } from 'sonner'

export default function NewVideoPage() {
  const router = useRouter()

  const handleUploadComplete = (video: any) => {
    toast.success('Video başarıyla oluşturuldu!')
    router.push(`/dashboard/videos/${video.id}/edit`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yeni Video</h2>
        <p className="text-muted-foreground">
          Video yükleyin veya URL ile ekleyin
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone onUploadComplete={handleUploadComplete} />
    </div>
  )
}
