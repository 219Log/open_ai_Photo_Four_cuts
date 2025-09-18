import { NextRequest } from 'next/server'
import { z } from 'zod'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SlotId = 1 | 2 | 3 | 4

const ImageSchema = z.object({ slot: z.number().int().min(1).max(4), dataUrl: z.string().min(1) })
const GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  images: z.array(ImageSchema).max(4),
  modelId: z.string().optional(),
  options: z.object({
    strength: z.number().min(0).max(1).optional(),
    seed: z.number().optional(),
    stylePreset: z.string().optional(),
    concurrency: z.number().int().min(1).max(4).optional()
  }).optional(),
})

function parseDataUrl(dataUrl: string) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

function toPartFromDataUrl(dataUrl: string) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) throw new Error('INVALID_DATA_URL')
  return { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function runPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let index = 0
  const runners = Array.from({ length: limit }, async () => {
    while (true) {
      const current = index++
      if (current >= items.length) break
      results[current] = await worker(items[current], current)
    }
  })
  await Promise.all(runners)
  return results
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, images, modelId, options } = GenerateSchema.parse(body)

    const demoMode = (process.env.DEMO_MODE || '').toLowerCase() === 'true'

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      if (demoMode) {
        const sorted = [...images].sort((a,b)=>a.slot-b.slot)
        return Response.json({ results: sorted.map(({ slot, dataUrl }) => ({ slot, image: dataUrl })), provider: 'demo', debug: { demoMode: true } })
      }
      return Response.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })
    const geminiModel = modelId || process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash-image-preview'
    const sortedInputs = [...images].sort((a,b)=>a.slot-b.slot)
    const concurrency = Math.max(1, Math.min(4, options?.concurrency ?? 2))

    const processed = await runPool(sortedInputs, concurrency, async ({ slot, dataUrl }) => {
      let outData: string | null = null
      const parts = [toPartFromDataUrl(dataUrl), { text: prompt }]
      const MAX_TRIES = 3
      for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
        try {
          const response = await ai.models.generateContent({ model: geminiModel, contents: parts })
          const partsOut = response?.candidates?.[0]?.content?.parts
          const firstImage: any = partsOut?.find((p: any) => p.inlineData)
          outData = firstImage?.inlineData?.data ?? null
        } catch (e: any) {
          console.warn(`Gemini attempt ${attempt} failed for slot ${slot}`, e?.message || e)
        }
        if (outData) break
        await sleep(700)
      }
      return { slot, image: outData ? `data:image/png;base64,${outData}` : null }
    })

    return Response.json({ results: processed, provider: 'google-gemini', debug: { demoMode: false, concurrency } })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'VALIDATION_ERROR', details: err.issues }, { status: 400 })
    }
    console.error('GENERATION_ERROR', err)
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
