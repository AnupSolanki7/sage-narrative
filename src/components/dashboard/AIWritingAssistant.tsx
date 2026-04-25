'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle, Copy, Wand2, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AIWritingAssistantProps {
  /** Optional category hint passed to the AI for better category inference. */
  categoryHint?: 'stories' | 'tech' | 'insights'
  /** Optional author display name passed to the AI. */
  authorHint?: string
  /** Whether the editor already has substantive content. Used to gate Apply. */
  hasExistingContent: boolean
  /** Called when the user clicks "Apply to Editor" with the generated Markdown. */
  onApply: (markdown: string) => void
  className?: string
}

interface ProviderInfo {
  id:         string
  label:      string
  configured: boolean
}

interface ProvidersResponse {
  providers:       ProviderInfo[]
  defaultProvider: string | null
}

/**
 * AI Writing Assistant — sits in the create/edit post page.
 * User picks an AI provider, pastes a rough idea, clicks Generate, gets back
 * polished Markdown with frontmatter that can be applied to the editor.
 *
 * The AI never publishes or auto-applies — every step is user-confirmed.
 */
export default function AIWritingAssistant({
  categoryHint,
  authorHint,
  hasExistingContent,
  onApply,
  className,
}: AIWritingAssistantProps) {
  const [idea,       setIdea]       = useState('')
  const [generated,  setGenerated]  = useState('')
  const [usedProvider, setUsedProvider] = useState<string>('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [applied,    setApplied]    = useState(false)
  const [copied,     setCopied]     = useState(false)

  const [providers,  setProviders]  = useState<ProviderInfo[]>([])
  const [provider,   setProvider]   = useState<string>('')
  const [providersLoading, setProvidersLoading] = useState(true)

  // ── Fetch which providers are configured server-side ───────────────────────
  useEffect(() => {
    let cancelled = false
    fetch('/api/ai/providers')
      .then((r) => r.json())
      .then((data: ProvidersResponse) => {
        if (cancelled) return
        setProviders(data.providers ?? [])
        if (data.defaultProvider) setProvider(data.defaultProvider)
      })
      .catch(() => {
        if (!cancelled) setProviders([])
      })
      .finally(() => {
        if (!cancelled) setProvidersLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const selectedProvider  = providers.find((p) => p.id === provider)
  const anyConfigured     = providers.some((p) => p.configured)

  async function handleGenerate() {
    setError('')
    setApplied(false)
    setGenerated('')

    if (!idea.trim()) {
      setError('Please share at least a sentence describing your idea.')
      return
    }
    if (!provider) {
      setError('Pick an AI provider first.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/blog-assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          action:  'generate-blog',
          content: idea,
          metadata: {
            ...(categoryHint ? { category: categoryHint } : {}),
            ...(authorHint   ? { author:   authorHint   } : {}),
          },
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        setError(data?.error ?? data?.message ?? 'Failed to generate the draft. Please try again.')
        return
      }

      setGenerated(data.markdown ?? '')
      setUsedProvider(data.provider ?? provider)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!generated) return
    if (hasExistingContent) {
      const ok = window.confirm('This will replace your current draft content. Continue?')
      if (!ok) return
    }
    onApply(generated)
    setApplied(true)
    setTimeout(() => setApplied(false), 2500)
  }

  async function handleCopy() {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  const usedProviderLabel = providers.find((p) => p.id === usedProvider)?.label ?? usedProvider

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#f1f6e3] to-white dark:from-[#2d3226]/60 dark:to-[#1c2217]',
        'rounded-[1.5rem] border border-[#d3dcc0] dark:border-[#2d3226] p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full bg-[#d3e056]/40 dark:bg-[#d3e056]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#5b6300] dark:text-[#c2cf47]" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-[#181d12] dark:text-[#f7fce9]">
              AI Writing Assistant
            </h2>
            <p className="text-xs text-[#464841] dark:text-[#c6c7be] mt-0.5 leading-relaxed">
              Paste a rough idea, outline, or messy draft. We&rsquo;ll turn it into a polished
              blog you can edit before publishing.
            </p>
          </div>
        </div>

        {/* Provider selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="ai-provider" className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Model
          </label>
          <select
            id="ai-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            disabled={providersLoading || !anyConfigured}
            className="rounded-full border border-[#e0e5d2] dark:border-[#2d3226] bg-white dark:bg-[#1c2217] text-[#181d12] dark:text-[#f7fce9] px-3 py-1.5 text-xs font-medium outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors disabled:opacity-50"
          >
            {providersLoading && <option value="">Loading…</option>}
            {!providersLoading && !anyConfigured && <option value="">No providers configured</option>}
            {!providersLoading && providers.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.configured}>
                {p.label}{p.configured ? '' : ' (not configured)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!providersLoading && !anyConfigured && (
        <div className="mb-4 p-3 rounded-[0.75rem] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            No AI providers are configured. Set at least one of <code className="font-mono">ANTHROPIC_API_KEY</code>,{' '}
            <code className="font-mono">OPENAI_API_KEY</code>, <code className="font-mono">GEMINI_API_KEY</code>,{' '}
            <code className="font-mono">GROK_API_KEY</code>, or <code className="font-mono">HUGGINGFACE_API_KEY</code> in your environment.
          </p>
        </div>
      )}

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={6}
        placeholder={`A few rough sentences, bullet points, or a half-baked outline. Examples:\n\n- "On why deadlines make me write worse — but I keep saying yes to them"\n- A few bullets of what I learned migrating our auth system to passkeys\n- A long voice-note transcript I cleaned up about my grandmother's letters`}
        className="w-full rounded-[0.75rem] border border-[#e0e5d2] dark:border-[#2d3226] bg-white dark:bg-[#1c2217] text-[#181d12] dark:text-[#f7fce9] px-4 py-3 text-sm outline-none focus:border-[#5b6300] dark:focus:border-[#c2cf47] transition-colors placeholder:text-[#767870] dark:placeholder:text-[#464841] resize-y"
      />

      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <span className="text-xs text-[#767870] dark:text-[#464841]">
          {idea.length > 0 ? `${idea.length.toLocaleString()} characters` : 'Describe your idea, then click Generate.'}
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !idea.trim() || !anyConfigured || !provider || !selectedProvider?.configured}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#5b6300] text-white text-sm font-semibold hover:bg-[#4a5100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading
            ? `Generating with ${selectedProvider?.label ?? provider}…`
            : 'Turn idea into draft'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-[0.75rem] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {error}{' '}
            {anyConfigured && providers.length > 1 && (
              <span className="text-[#767870] dark:text-[#464841]">— try switching to another provider above.</span>
            )}
          </p>
        </div>
      )}

      {generated && (
        <div className="mt-5 pt-5 border-t border-[#e0e5d2] dark:border-[#2d3226]">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#767870] dark:text-[#464841] flex items-center gap-2">
              Generated draft
              {usedProvider && (
                <span className="inline-flex items-center gap-1 normal-case font-medium tracking-normal text-[#5b6300] dark:text-[#c2cf47] bg-[#d3e056]/20 dark:bg-[#d3e056]/10 px-2 py-0.5 rounded-full">
                  <Cpu className="w-3 h-3" />
                  {usedProviderLabel}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e0e5d2] dark:border-[#2d3226] text-xs font-medium text-[#464841] dark:text-[#c6c7be] hover:bg-[#f1f6e3] dark:hover:bg-[#2d3226]/50 transition-colors"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#5b6300] text-white text-xs font-semibold hover:bg-[#4a5100] transition-colors"
              >
                {applied ? <CheckCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {applied ? 'Applied' : 'Apply to editor'}
              </button>
            </div>
          </div>

          <pre className="max-h-[420px] overflow-auto bg-white dark:bg-[#1c2217] rounded-[0.75rem] border border-[#e0e5d2] dark:border-[#2d3226] p-4 text-xs font-mono leading-relaxed text-[#181d12] dark:text-[#f7fce9] whitespace-pre-wrap break-words">
            {generated}
          </pre>

          <p className="text-[10px] text-[#767870] dark:text-[#464841] mt-2 italic">
            AI-generated drafts can have inaccuracies. Always review before publishing.
          </p>
        </div>
      )}
    </div>
  )
}
