import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { resolveProvider, getDefaultProvider, getAIProvider } from '@/lib/ai/factory'
import { AIProviderError, isProviderId, ProviderId } from '@/lib/ai/provider'
import {
  SYSTEM_PROMPT,
  buildPromptForAction,
  VALID_ACTIONS,
  AIAction,
} from '@/lib/ai/prompts'

const MAX_INPUT_CHARS = 8000
const MIN_INPUT_CHARS = 10

interface RequestBody {
  provider?: string
  action?: string
  content?: string
  metadata?: {
    author?: string
    category?: 'stories' | 'tech' | 'insights'
  }
}

export async function POST(req: NextRequest) {
  // ── Auth ──
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ──
  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Action validation ──
  const action = body.action as AIAction
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `Unknown action. Expected one of: ${VALID_ACTIONS.join(', ')}.` },
      { status: 400 },
    )
  }

  // ── Input validation ──
  const input = (body.content ?? '').trim()
  if (input.length < MIN_INPUT_CHARS) {
    return NextResponse.json(
      { error: 'Please share at least a sentence describing your idea.' },
      { status: 400 },
    )
  }
  if (input.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Input is too long. Please trim it under ${MAX_INPUT_CHARS.toLocaleString()} characters.` },
      { status: 400 },
    )
  }

  // ── Provider selection ──
  // 1. Use the requested provider if it's valid AND configured.
  // 2. If the request omits provider, fall back to the system default.
  // 3. If the requested provider is unconfigured, return a clear 503 — do NOT
  //    silently fall back to a different provider (surprise model = surprise UX).
  let providerId: ProviderId | null = null
  if (body.provider != null) {
    if (!isProviderId(body.provider)) {
      return NextResponse.json({ error: 'Unknown provider.' }, { status: 400 })
    }
    if (!resolveProvider(body.provider)) {
      return NextResponse.json(
        { error: `Provider "${body.provider}" is not configured. Add the relevant API key to your environment, or choose another provider.` },
        { status: 503 },
      )
    }
    providerId = body.provider
  } else {
    providerId = getDefaultProvider()
  }

  if (!providerId) {
    return NextResponse.json(
      { error: 'No AI providers are configured. Add at least one provider API key (e.g. ANTHROPIC_API_KEY, OPENAI_API_KEY) to your environment.' },
      { status: 503 },
    )
  }

  const provider = getAIProvider(providerId)

  // ── Build prompts ──
  const userPrompt = buildPromptForAction(action, input, {
    author: body.metadata?.author,
    category: body.metadata?.category,
    today: new Date().toISOString().slice(0, 10),
  })

  // ── Generate ──
  try {
    const markdown = await provider.generate(SYSTEM_PROMPT, userPrompt)
    if (!markdown) {
      return NextResponse.json(
        { success: false, message: 'The provider returned an empty response. Please try again.' },
        { status: 502 },
      )
    }
    return NextResponse.json({
      success: true,
      provider: provider.id,
      action,
      markdown,
    })
  } catch (err) {
    console.log(err);

    if (err instanceof AIProviderError) {
      return NextResponse.json(
        { success: false, error: err.message, provider: err.providerId, retryable: err.retryable },
        { status: err.status ?? 500 },
      )
    }
    console.error('[ai/blog-assistant] unexpected error:', err)
    return NextResponse.json({ error: 'Failed to generate the draft.' }, { status: 500 })
  }
}
