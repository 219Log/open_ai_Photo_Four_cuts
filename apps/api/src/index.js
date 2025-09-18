import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { z } from 'zod'
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// * Load local .env and also fallback to repo root .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// local (apps/api/.env)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
// root (../../.. from src/index.js)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const app = express()
const port = process.env.PORT || 8080

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '25mb' }))

// Schema
const ImageSchema = z.object({ slot: z.number().int().min(1).max(4), dataUrl: z.string().min(1) })
const GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  images: z.array(ImageSchema).max(4),
  modelId: z.string().default('gemini-2.5-flash-image-preview').optional(),
  options: z.object({
    strength: z.number().min(0).max(1).optional(),
    seed: z.number().optional(),
    stylePreset: z.string().optional(),
    concurrency: z.number().int().min(1).max(4).optional()
  }).optional(),
})

// Helpers
function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

function toPartFromDataUrl(dataUrl) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) throw new Error('INVALID_DATA_URL')
  return { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function runPool(items, limit, worker) {
  const results = new Array(items.length)
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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY })

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, images, modelId, options } = GenerateSchema.parse(req.body)

    const demoMode = (process.env.DEMO_MODE || '').toLowerCase() === 'true'
    console.log('GENERATE', { images: images.length, promptLen: prompt.length, modelId: modelId || process.env.GEMINI_MODEL_ID, demoMode })

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      if (demoMode) {
        const sorted = [...images].sort((a,b) => a.slot - b.slot)
        return res.json({ results: sorted.map(({ slot, dataUrl }) => ({ slot, image: dataUrl })), provider: 'demo', debug: { demoMode: true } })
      }
      return res.status(500).json({ error: 'GEMINI_API_KEY missing' })
    }

    const geminiModel = modelId || process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash-image-preview'
    const sortedInputs = [...images].sort((a,b)=>a.slot-b.slot)
    const concurrency = Math.max(1, Math.min(4, options?.concurrency ?? 2))

    const processed = await runPool(sortedInputs, concurrency, async ({ slot, dataUrl }) => {
      let outData = null
      const parts = [toPartFromDataUrl(dataUrl), { text: prompt }]
      const MAX_TRIES = 3
      for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
        try {
          const response = await ai.models.generateContent({ model: geminiModel, contents: parts })
          if (response?.candidates?.[0]?.content?.parts) {
            const partsOut = response.candidates[0].content.parts
            const firstImage = partsOut.find((p) => p.inlineData)
            outData = firstImage?.inlineData?.data ?? null
          }
        } catch (e) {
          console.warn(`Gemini attempt ${attempt} failed for slot ${slot}`, e?.message || e)
        }
        if (outData) break
        await sleep(700)
      }
      return { slot, image: outData ? `data:image/png;base64,${outData}` : null }
    })

    return res.json({ results: processed, provider: 'google-gemini', debug: { demoMode: false, concurrency } })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues })
    }
    console.error('GENERATION_ERROR', err)
    return res.status(500).json({ error: 'INTERNAL_ERROR' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
