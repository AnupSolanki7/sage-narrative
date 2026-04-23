import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// Env-var guards
// ---------------------------------------------------------------------------

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

if (!GMAIL_USER) {
  console.warn('[email] GMAIL_USER is not set. Email sending will be disabled.')
}
if (!GMAIL_APP_PASSWORD) {
  console.warn(
    '[email] GMAIL_APP_PASSWORD is not set. Email sending will be disabled.'
  )
}

// ---------------------------------------------------------------------------
// Shared transporter — created once per cold start
// ---------------------------------------------------------------------------

/**
 * Lazily-created Nodemailer transporter using Gmail SMTP + App Password auth.
 * Re-use this single instance across the application.
 */
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER ?? '',
    pass: GMAIL_APP_PASSWORD ?? '',
  },
})

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/** The From address used for all outgoing mail. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Sage Narrative <noreply@sagenarrative.com>'

/** Public base URL — used to build links inside emails. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

/**
 * Returns true when email sending should actually happen.
 * Requires both GMAIL_USER and GMAIL_APP_PASSWORD to be set.
 * Opt-out via EMAIL_ENABLED=false.
 */
export function isEmailEnabled(): boolean {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return false
  if (process.env.EMAIL_ENABLED === 'false') return false
  return true
}
