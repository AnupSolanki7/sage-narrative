import { AIProviderError, GenerateOptions, ProviderId } from '../provider'

/**
 * Shared chat-completions caller for any provider that speaks the OpenAI wire
 * format. OpenAI, xAI Grok, and the HuggingFace router all use this shape, so
 * the only difference between them is `baseUrl` and the default model.
 */
export interface OpenAICompatConfig {
  providerId:  ProviderId
  baseUrl:     string         // e.g. "https://api.openai.com/v1"
  apiKey:      string
  defaultModel: string
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>
  error?:   { message?: string }
}

export async function callOpenAICompat(
  cfg: OpenAICompatConfig,
  systemPrompt: string,
  userPrompt: string,
  options: GenerateOptions = {},
): Promise<string> {
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`
  const body = {
    model:      options.model ?? cfg.defaultModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    max_tokens: options.maxOutputTokens ?? 8000,
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AIProviderError('Network error contacting provider.', cfg.providerId, 502, true)
  }

  let data: ChatCompletionResponse
  try {
    data = (await res.json()) as ChatCompletionResponse
  } catch {
    data = {}
  }

  if (!res.ok) {
    const message = data.error?.message ?? `Provider returned ${res.status}.`
    const retryable = res.status === 429 || res.status >= 500
    throw new AIProviderError(message, cfg.providerId, res.status, retryable)
  }

  const content = data.choices?.[0]?.message?.content?.trim() ?? ''
  if (!content) {
    throw new AIProviderError('Provider returned an empty response.', cfg.providerId, 502, true)
  }

  console.info(`[ai/${cfg.providerId}] model=${body.model} status=${res.status} ok`)
  return content
}
