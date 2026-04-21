import { Resend } from 'resend'

// Guard: do not crash at import time if key is missing — log instead
const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  console.warn(
    '[email] RESEND_API_KEY is not set. Email sending will be disabled.'
  )
}

/** Shared Resend client — instantiated once per cold start. */
export const resend = new Resend(apiKey ?? 'missing_key')

/** The From address used for all outgoing mail. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Sage Narrative <noreply@sagenarrative.com>'

/** Public base URL — used to build links inside emails. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * Returns true when email sending should actually happen.
 * Requires RESEND_API_KEY to be set. Opt-out via EMAIL_ENABLED=false.
 */
export function isEmailEnabled(): boolean {
  if (!apiKey) return false
  if (process.env.EMAIL_ENABLED === 'false') return false
  return true
}
