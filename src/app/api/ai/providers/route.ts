import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getProviderAvailability, getDefaultProvider } from '@/lib/ai/factory'
import { PROVIDER_LABELS, PROVIDER_PREFERENCE } from '@/lib/ai/provider'

/**
 * Returns which AI providers are configured server-side. The UI uses this to
 * populate the provider selector and disable unconfigured options.
 *
 * We only return ids/labels/configured flags — never the API keys themselves.
 */
export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const availability = getProviderAvailability()

  const providers = PROVIDER_PREFERENCE.map((id) => ({
    id,
    label:      PROVIDER_LABELS[id],
    configured: availability[id],
  }))

  return NextResponse.json({
    providers,
    defaultProvider: getDefaultProvider(),
  })
}
