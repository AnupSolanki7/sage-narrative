import { AIProvider, AIProviderError } from '../provider'
import { callOpenAICompat } from './openaiCompat'

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'
const BASE_URL      = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'

export const openaiProvider: AIProvider = {
  id: 'openai',
  label: 'OpenAI',

  isConfigured() {
    return !!process.env.OPENAI_API_KEY
  },

  async generate(systemPrompt, userPrompt, options = {}) {
    if (!this.isConfigured()) {
      throw new AIProviderError('OpenAI is not configured.', 'openai', 503)
    }
    return callOpenAICompat(
      {
        providerId:   'openai',
        baseUrl:      BASE_URL,
        apiKey:       process.env.OPENAI_API_KEY!,
        defaultModel: DEFAULT_MODEL,
      },
      systemPrompt,
      userPrompt,
      options,
    )
  },
}
