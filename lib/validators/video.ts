import { z } from 'zod'

const interactionPositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().positive(),
  height: z.number().positive(),
})

const interactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'BUTTON',
    'HOTSPOT',
    'QUESTION',
    'TEXT',
    'IMAGE',
    'VIDEO_CLIP',
    'AUDIO_CLIP',
    'DRAWING',
    'CHANGE_TIME',
    'PAUSE',
    'SWITCH_VIDEO',
    'SET_VARIABLE',
    'OPEN_MAGIC_MENU',
    'ASK_CHATGPT',
    'REDIRECT_LINK',
    'RESET_INTERACTIONS',
    'RESET_VIEWER_STATE',
  ]),
  startTime: z.number().min(0),
  endTime: z.number().min(0).optional().nullable(),
  config: z.record(z.string(), z.any()).default({}),
  position: interactionPositionSchema.optional().nullable(),
  style: z.record(z.string(), z.any()).optional().nullable(),
  variables: z.record(z.string(), z.any()).optional().nullable(),
  logic: z.record(z.string(), z.any()).optional().nullable(),
})

export const videoPatchSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PROCESSING', 'FAILED']).optional(),
  tags: z.array(z.string().max(60)).optional(),
  settings: z.record(z.string(), z.any()).nullable().optional(),
  design: z.record(z.string(), z.any()).nullable().optional(),
  interactions: z.array(interactionSchema).optional(),
})

export const uploadVideoSchema = z.object({
  title: z.string().max(180).optional().nullable(),
  url: z.string().url().optional().nullable(),
  processing: z.enum(['mux', 'ffmpeg', 'none']).default('ffmpeg'),
})

export const leadCreateSchema = z.object({
  videoId: z.string().min(1),
  name: z.string().max(160).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(80).optional().nullable(),
  customId: z.string().max(160).optional().nullable(),
  customData: z.record(z.string(), z.any()).optional().nullable(),
})

