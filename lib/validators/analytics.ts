import { z } from 'zod'

export const analyticsStartSchema = z.object({
  videoId: z.string().min(1),
  referrer: z.string().max(2000).optional().nullable(),
})

export const analyticsHeartbeatSchema = z.object({
  analyticsId: z.string().min(1),
  sessionId: z.string().min(1).optional().nullable(),
  videoId: z.string().min(1),
  watchTime: z.number().min(0).default(0),
  progress: z.number().min(0).max(100).default(0),
  currentTime: z.number().min(0).default(0),
})

export const analyticsCompleteSchema = z.object({
  analyticsId: z.string().min(1),
  sessionId: z.string().min(1).optional().nullable(),
  videoId: z.string().min(1),
  watchTime: z.number().min(0).default(0),
  progress: z.number().min(0).max(100).default(100),
})

export const interactionEventSchema = z.object({
  analyticsId: z.string().min(1).optional().nullable(),
  sessionId: z.string().min(1).optional().nullable(),
  videoId: z.string().min(1),
  interactionId: z.string().min(1),
  eventType: z.enum(['view', 'click', 'submit']),
  data: z.record(z.string(), z.any()).optional().nullable(),
})

