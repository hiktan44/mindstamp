import { z } from 'zod'

export const chaptersReplaceSchema = z.object({
  chapters: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1).max(180),
    startTime: z.number().min(0),
    endTime: z.number().min(0).optional().nullable(),
    order: z.number().int().min(0).optional(),
  })),
})

export const captionsReplaceSchema = z.object({
  captions: z.array(z.object({
    language: z.string().min(2).max(12),
    content: z.string().min(1).optional().nullable(),
    url: z.string().url().optional().nullable(),
  })).refine(
    (captions) => captions.every((caption) => caption.content || caption.url),
    'Each caption needs either inline content or a URL'
  ),
})

export const transcriptUpsertSchema = z.object({
  content: z.string().min(1),
  language: z.string().min(2).max(12).default('tr'),
  isAiGenerated: z.boolean().default(false),
})

export const endScreenUpsertSchema = z.object({
  enabled: z.boolean().default(true),
  layout: z.string().max(80).optional().nullable(),
  message: z.string().max(500).optional().nullable(),
  buttonConfig: z.record(z.string(), z.any()).optional().nullable(),
})

