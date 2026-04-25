import { AIProvider, AIProviderError } from '../provider'
import { callOpenAICompat } from './openaiCompat'

// xAI's API is OpenAI-compatible — same wire format, different host.
const DEFAULT_MODEL = process.env.GROK_MODEL ?? 'grok-3'
const BASE_URL      = process.env.GROK_BASE_URL ?? 'https://api.x.ai/v1'

export const grokProvider: AIProvider = {
  id: 'grok',
  label: 'xAI Grok',

  isConfigured() {
    return !!process.env.GROK_API_KEY
  },

  async generate(systemPrompt, userPrompt, options = {}) {
    if (!this.isConfigured()) {
      throw new AIProviderError('Grok is not configured.', 'grok', 503)
    }
    return callOpenAICompat(
      {
        providerId:   'grok',
        baseUrl:      BASE_URL,
        apiKey:       process.env.GROK_API_KEY!,
        defaultModel: DEFAULT_MODEL,
      },
      systemPrompt,
      userPrompt,
      options,
    )
  },
}
