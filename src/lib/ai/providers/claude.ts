import Anthropic from '@anthropic-ai/sdk'
import { AIProvider, AIProviderError, GenerateOptions } from '../provider'

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7'

function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY
}

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: getApiKey() })
  return client
}

/**
 * Anthropic Claude provider.
 *
 * Uses the official SDK so we get prompt caching: the system prompt is marked
 * with `cache_control: ephemeral`, which makes the system tokens cost ~10% of
 * normal input price after the first call. This is a Claude-specific win — no
 * other provider in this app has equivalent caching, which is why we kept the
 * SDK dependency rather than going pure-fetch like the other providers.
 */
export const claudeProvider: AIProvider = {
  id: 'claude',
  label: 'Anthropic Claude',

  isConfigured(): boolean {
    return !!getApiKey()
  },

  async generate(systemPrompt, userPrompt, options = {}): Promise<string> {
    if (!this.isConfigured()) {
      throw new AIProviderError('Claude is not configured.', 'claude', 503)
    }

    try {
      const response = await getClient().messages.create({
        model:      options.model ?? DEFAULT_MODEL,
        max_tokens: options.maxOutputTokens ?? 8000,
        system: [
          { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      })

      console.info(
        `[ai/claude] model=${options.model ?? DEFAULT_MODEL} ` +
        `input=${response.usage.input_tokens} ` +
        `output=${response.usage.output_tokens} ` +
        `cache_write=${response.usage.cache_creation_input_tokens ?? 0} ` +
        `cache_read=${response.usage.cache_read_input_tokens ?? 0}`,
      )

      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim()
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        throw new AIProviderError('Claude is rate-limited. Try again in a moment.', 'claude', 429, true)
      }
      if (err instanceof Anthropic.AuthenticationError) {
        throw new AIProviderError('Claude API key is invalid.', 'claude', 503)
      }
      if (err instanceof Anthropic.APIError) {
        throw new AIProviderError(`Claude API error (${err.status}).`, 'claude', err.status ?? 502)
      }
      throw new AIProviderError('Claude request failed.', 'claude', 500)
    }
  },
}
