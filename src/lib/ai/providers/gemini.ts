import { AIProvider, AIProviderError } from '../provider'
import { GenerateOptions } from '../provider'

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
const BASE_URL      = process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta'

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
  error?: { message?: string; code?: number }
}

export const geminiProvider: AIProvider = {
  id: 'gemini',
  label: 'Google Gemini',

  isConfigured() {
    return !!process.env.GEMINI_API_KEY
  },

  async generate(systemPrompt: string, userPrompt: string, options: GenerateOptions = {}) {
    if (!this.isConfigured()) {
      throw new AIProviderError('Gemini is not configured.', 'gemini', 503)
    }

    const model = options.model ?? DEFAULT_MODEL
    const url = `${BASE_URL.replace(/\/+$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${process.env.GEMINI_API_KEY}`

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents:           [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig:   { maxOutputTokens: options.maxOutputTokens ?? 8000 },
    }

    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      throw new AIProviderError('Network error contacting Gemini.', 'gemini', 502, true)
    }

    let data: GeminiResponse
    try {
      data = (await res.json()) as GeminiResponse
    } catch {
      data = {}
    }

    if (!res.ok) {
      const message = data.error?.message ?? `Gemini returned ${res.status}.`
      const retryable = res.status === 429 || res.status >= 500
      throw new AIProviderError(message, 'gemini', res.status, retryable)
    }

    const content = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim() ?? ''

    if (!content) {
      throw new AIProviderError('Gemini returned an empty response.', 'gemini', 502, true)
    }

    console.info(`[ai/gemini] model=${model} status=${res.status} ok`)
    return content
  },
}
