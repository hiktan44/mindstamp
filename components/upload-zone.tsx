'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link as LinkIcon, X, Video, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadZoneProps {
  onUploadComplete?: (video: any) => void
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'uploading' | 'processing' | 'ready' | 'error'>('uploading')
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
  })

  // Poll video processing status
  useEffect(() => {
    if (!currentVideoId || processingStatus !== 'processing') return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/videos/${currentVideoId}/status`)
        if (!response.ok) return

        const data = await response.json()

        if (data.status === 'PUBLISHED') {
          setProcessingStatus('ready')
          setProcessing(false)
          setProgress(100)
          toast.success('Video işlendi ve yayında!')

          if (onUploadComplete && data.video) {
            setTimeout(() => onUploadComplete(data.video), 500)
          }
          clearInterval(pollInterval)
        } else if (data.status === 'FAILED') {
          setProcessingStatus('error')
          setProcessing(false)
          toast.error('Video işlenirken hata oluştu')
          clearInterval(pollInterval)
        } else {
          // Still processing
          setProgress(Math.min(progress + 5, 95))
        }
      } catch (error) {
        console.error('Status poll error:', error)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [currentVideoId, processingStatus, progress, onUploadComplete])

  const handleUpload = async () => {
    if (!uploadedFile && !url) {
      toast.error('Lütfen bir video dosyası seçin veya URL girin')
      return
    }

    if (uploadedFile && !title) {
      toast.error('Lütfen bir başlık girin')
      return
    }

    setUploading(true)
    setProcessingStatus('uploading')
    setProgress(0)

    try {
      const formData = new FormData()

      if (uploadedFile) {
        formData.append('file', uploadedFile)
        formData.append('title', title)
        // Default to FFmpeg processing (can be changed to 'mux')
        formData.append('processing', 'ffmpeg')
      } else if (url) {
        formData.append('url', url)
        formData.append('title', title || 'URL Video')
      }

      setProgress(10)

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(50)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Yükleme başarısız')
      }

      const { video, processingStarted } = await response.json()

      setProgress(60)

      if (processingStarted) {
        setCurrentVideoId(video.id)
        setProcessingStatus('processing')
        setProcessing(true)
        // Status will be polled via useEffect
      } else {
        // URL upload - immediate completion
        setProcessingStatus('ready')
        setProgress(100)
        toast.success('Video başarıyla eklendi!')

        setTimeout(() => {
          onUploadComplete?.(video)
        }, 500)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setProcessingStatus('error')
      toast.error(error instanceof Error ? error.message : 'Yükleme başarısız')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setTitle('')
    setCurrentVideoId(null)
    setProcessingStatus('uploading')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Dosya Yükle</TabsTrigger>
          <TabsTrigger value="url">URL ile Ekle</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          {!uploadedFile ? (
            <Card
              {...getRootProps()}
              className={`
                border-2 border-dashed transition-colors cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
            >
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <input {...getInputProps()} />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {isDragActive ? (
                    <Upload className="h-8 w-8 text-primary animate-bounce" />
                  ) : (
                    <Video className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isDragActive ? 'Dosyayı bırakın' : 'Video yükleyin'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sürükleyip bırakın veya dosya seçin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV, WEBM • Maksimum 500MB
                  </p>
                </div>
                <Button type="button" variant="outline" className="mt-4">
                  Dosya Seçin
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={uploading || processing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">URL ile Video Ekle</p>
                  <p className="text-sm text-muted-foreground">
                    YouTube, Vimeo veya doğrudan video URL'i
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={uploading || processing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          placeholder="Video başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading || processing}
        />
      </div>

      {(uploading || processing) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {(uploading || processing) && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {processingStatus === 'uploading' && 'Yükleniyor...'}
                    {processingStatus === 'processing' && 'İşleniyor...'}
                    {processingStatus === 'ready' && 'Tamamlandı!'}
                  </span>
                </div>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />

              {processingStatus === 'processing' && (
                <p className="text-xs text-muted-foreground">
                  Video işleniyor ve HLS formatına çevriliyor. Bu işlem birkaç dakika sürebilir.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleUpload}
        disabled={uploading || processing || (!uploadedFile && !url)}
        className="w-full"
        size="lg"
      >
        {(uploading || processing) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {processingStatus === 'uploading' ? 'Yükleniyor...' : 'İşleniyor...'}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Videoyu Yükle
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <p>Video yükleyerek{' '}
          <a href="#" className="underline hover:text-foreground">
            hizmet şartlarını
          </a> ve{' '}
          <a href="#" className="underline hover:text-foreground">
            gizlilik politikasını
          </a>{' '}
          kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  )
}
