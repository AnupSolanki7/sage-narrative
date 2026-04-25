import { AIProvider, ProviderId, PROVIDER_PREFERENCE, isProviderId } from './provider'
import { claudeProvider }      from './providers/claude'
import { openaiProvider }      from './providers/openai'
import { geminiProvider }      from './providers/gemini'
import { grokProvider }        from './providers/grok'
import { huggingfaceProvider } from './providers/huggingface'

const REGISTRY: Record<ProviderId, AIProvider> = {
  claude:      claudeProvider,
  openai:      openaiProvider,
  gemini:      geminiProvider,
  grok:        grokProvider,
  huggingface: huggingfaceProvider,
}

/** Look up a provider by ID. Throws if the ID is unknown — callers should validate first. */
export function getAIProvider(id: ProviderId): AIProvider {
  const p = REGISTRY[id]
  if (!p) throw new Error(`Unknown AI provider: ${id}`)
  return p
}

/** Map of provider → whether it has the env vars set to actually run. */
export function getProviderAvailability(): Record<ProviderId, boolean> {
  return {
    claude:      claudeProvider.isConfigured(),
    openai:      openaiProvider.isConfigured(),
    gemini:      geminiProvider.isConfigured(),
    grok:        grokProvider.isConfigured(),
    huggingface: huggingfaceProvider.isConfigured(),
  }
}

/**
 * Returns the first preferred provider that's actually configured, or null
 * if none are. Used by the UI to pick a sensible default selection.
 */
export function getDefaultProvider(): ProviderId | null {
  for (const id of PROVIDER_PREFERENCE) {
    if (REGISTRY[id].isConfigured()) return id
  }
  return null
}

export function resolveProvider(input: unknown): AIProvider | null {
  if (!isProviderId(input)) return null
  const p = REGISTRY[input]
  return p.isConfigured() ? p : null
}
