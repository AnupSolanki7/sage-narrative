/**
 * Shared AI provider interface — every provider must conform.
 *
 * Design note: providers are *transport*, prompts are *policy*. We keep the
 * interface minimal (one `generate` call) and let `prompts.ts` own which
 * system/user pair is sent for each user-facing action. This avoids the
 * brief's `generateBlog/improveWriting/generateSEO/suggestImages` API,
 * which would force every provider implementation to know about every
 * action — adding a fifth action means touching all five providers.
 */

export type ProviderId = 'claude' | 'openai' | 'gemini' | 'grok' | 'huggingface'

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  claude:      'Anthropic Claude',
  openai:      'OpenAI',
  gemini:      'Google Gemini',
  grok:        'xAI Grok',
  huggingface: 'HuggingFace',
}

/** Order used as the default-provider fallback chain. */
export const PROVIDER_PREFERENCE: ProviderId[] = [
  'claude',
  'openai',
  'gemini',
  'grok',
  'huggingface',
]

export interface GenerateOptions {
  /** Hard cap on output tokens. Providers translate this to their native param. */
  maxOutputTokens?: number
  /** Optional model override — falls back to provider's env-configured default. */
  model?: string
}

export interface AIProvider {
  /** Stable identifier — must match a `ProviderId`. */
  readonly id: ProviderId
  /** Human-readable label for logs. */
  readonly label: string
  /** True if all required env vars are present for this provider. */
  isConfigured(): boolean
  /**
   * Run a single completion and return the assistant's text response.
   * Errors should be thrown — callers wrap with try/catch and surface a
   * friendly message to the UI.
   */
  generate(
    systemPrompt: string,
    userPrompt: string,
    options?: GenerateOptions,
  ): Promise<string>
}

/**
 * Common error shape thrown by providers. Lets the route normalize HTTP status
 * codes without inspecting raw fetch responses.
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly providerId: ProviderId,
    public readonly status?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export function isProviderId(value: unknown): value is ProviderId {
  return value === 'claude' || value === 'openai' || value === 'gemini'
    || value === 'grok' || value === 'huggingface'
}
