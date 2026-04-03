import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const execAsync = promisify(exec)

// Ensure temp directory exists
const TEMP_DIR = join(process.cwd(), 'tmp', 'videos')

export async function ensureTempDir() {
  try {
    await mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

export interface TranscodeOptions {
  inputPath: string
  outputDir: string
  quality?: 'low' | 'medium' | 'high'
}

export interface TranscodeResult {
  hlsPath: string
  thumbnailPath?: string
  duration?: number
  success: boolean
  error?: string
}

// Check if FFmpeg is installed
export async function checkFFmpeg(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version')
    return true
  } catch {
    return false
  }
}

// Get video duration using ffprobe
export async function getVideoDuration(inputPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    )
    return parseFloat(stdout.trim())
  } catch (error) {
    console.error('FFprobe error:', error)
    return 0
  }
}

// Generate thumbnail from video
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  time: number = 1
): Promise<void> {
  try {
    await execAsync(
      `ffmpeg -ss ${time} -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`
    )
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    throw new Error('Failed to generate thumbnail')
  }
}

// Transcode video to HLS
export async function transcodeToHLS(
  inputPath: string,
  outputDir: string
): Promise<TranscodeResult> {
  await ensureTempDir()

  const segmentFilename = 'segment_%03d.ts'
  const playlistPath = join(outputDir, 'index.m3u8')
  const thumbnailPath = join(outputDir, 'thumbnail.jpg')

  try {
    // Create output directory
    await mkdir(outputDir, { recursive: true })

    // Get duration first
    const duration = await getVideoDuration(inputPath)

    // Transcode to HLS using FFmpeg
    const ffmpegCommand = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_list_size', '0',
      '-hls_segment_filename', `"${join(outputDir, segmentFilename)}"`,
      `"${playlistPath}"`
    ].join(' ')

    await execAsync(ffmpegCommand)

    // Generate thumbnail at 1 second
    await generateThumbnail(inputPath, thumbnailPath, 1)

    return {
      hlsPath: playlistPath,
      thumbnailPath,
      duration,
      success: true,
    }
  } catch (error) {
    console.error('FFmpeg transcode error:', error)
    return {
      hlsPath: '',
      success: false,
      error: error instanceof Error ? error.message : 'Transcoding failed',
    }
  }
}

// Process uploaded video file
export async function processUploadedVideo(
  file: File,
  videoId: string
): Promise<{
  success: boolean
  hlsUrl?: string
  thumbnailUrl?: string
  duration?: number
  error?: string
}> {
  await ensureTempDir()

  // Save uploaded file to temp location
  const tempFilePath = join(TEMP_DIR, `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`)

  try {
    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(tempFilePath, buffer)

    // Set absolute path for public/uploads
    const absoluteOutputDir = join(process.cwd(), 'public', 'uploads', videoId)

    // Transcode to HLS
    const result = await transcodeToHLS(tempFilePath, absoluteOutputDir)

    if (!result.success) {
      // Clean up temp file on failure
      await unlink(tempFilePath).catch(() => {})
      return {
        success: false,
        error: result.error,
      }
    }

    // Clean up temp file
    await unlink(tempFilePath).catch(() => {})

    return {
      success: true,
      hlsUrl: `/api/uploads/${videoId}/index.m3u8`,
      thumbnailUrl: `/api/uploads/${videoId}/thumbnail.jpg`,
      duration: result.duration,
    }
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempFilePath).catch(() => {})

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    }
  }
}

// Clean up old temporary files
export async function cleanupTempFiles(maxAge: number = 24 * 60 * 60 * 1000) {
  try {
    const { readdir, stat } = await import('fs/promises')
    const files = await readdir(TEMP_DIR)
    const now = Date.now()

    for (const file of files) {
      const filePath = join(TEMP_DIR, file)
      const stats = await stat(filePath)

      if (now - stats.mtimeMs > maxAge) {
        await unlink(filePath).catch(() => {})
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Get video info without transcoding
export async function getVideoInfo(inputPath: string) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`
    )
    const info = JSON.parse(stdout)

    return {
      duration: parseFloat(info.format.duration) || 0,
      width: info.streams[0]?.width || 0,
      height: info.streams[0]?.height || 0,
      codec: info.streams[0]?.codec_name || '',
      bitrate: parseInt(info.format.bit_rate) || 0,
      size: parseInt(info.format.size) || 0,
    }
  } catch (error) {
    console.error('FFprobe error:', error)
    return null
  }
}
