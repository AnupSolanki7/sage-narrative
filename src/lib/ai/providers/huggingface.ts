import { AIProvider, AIProviderError } from '../provider'
import { callOpenAICompat } from './openaiCompat'

/**
 * HuggingFace Inference Router — OpenAI-compatible chat-completions endpoint.
 *
 * Caveat: HF model behavior varies wildly. Small models won't reliably produce
 * a 1500-word coherent Markdown article with valid YAML frontmatter. Use a
 * 70B+ instruction-tuned model and override via HUGGINGFACE_MODEL.
 */
const DEFAULT_MODEL = process.env.HUGGINGFACE_MODEL ?? 'meta-llama/Llama-3.3-70B-Instruct'
const BASE_URL      = process.env.HUGGINGFACE_BASE_URL ?? 'https://router.huggingface.co/v1'

export const huggingfaceProvider: AIProvider = {
  id: 'huggingface',
  label: 'HuggingFace',

  isConfigured() {
    return !!process.env.HUGGINGFACE_API_KEY
  },

  async generate(systemPrompt, userPrompt, options = {}) {
    if (!this.isConfigured()) {
      throw new AIProviderError('HuggingFace is not configured.', 'huggingface', 503)
    }
    return callOpenAICompat(
      {
        providerId:   'huggingface',
        baseUrl:      BASE_URL,
        apiKey:       process.env.HUGGINGFACE_API_KEY!,
        defaultModel: DEFAULT_MODEL,
      },
      systemPrompt,
      userPrompt,
      options,
    )
  },
}
