import { resend, EMAIL_FROM, SITE_URL, isEmailEnabled } from './resend'
import { buildWelcomeEmail } from './templates/welcome'
import { buildNewPostEmail } from './templates/new-post'

// ---------------------------------------------------------------------------
// Shared helper
// ---------------------------------------------------------------------------

interface SendResult {
  ok: boolean
  error?: string
}

async function send({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}): Promise<SendResult> {
  if (!isEmailEnabled()) {
    const recipients = Array.isArray(to) ? to.join(', ') : to
    console.info(`[email] disabled — would have sent "${subject}" to ${recipients}`)
    return { ok: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] unexpected send error:', message)
    return { ok: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

/**
 * Sends a welcome email to a newly subscribed user.
 * Failures are logged but do not throw — the subscribe flow remains intact.
 */
export async function sendWelcomeEmail(email: string): Promise<SendResult> {
  const { subject, html } = buildWelcomeEmail({ email })
  const result = await send({ to: email, subject, html })

  if (!result.ok) {
    console.error(`[email] welcome email failed for ${email}:`, result.error)
  } else {
    console.info(`[email] welcome email sent to ${email}`)
  }

  return result
}

// ---------------------------------------------------------------------------
// New post notification
// ---------------------------------------------------------------------------

interface NotifyPostOptions {
  postId: string
  title: string
  slug: string
  excerpt?: string
  authorName?: string
  coverImage?: string
  category?: string
  readingTime?: number
  /** List of active subscriber emails to notify */
  recipients: string[]
}

/**
 * Sends a new-post notification to all active subscribers.
 *
 * Uses Resend's batch-send capability (max 100 per call) so large
 * lists are automatically chunked. Failures are logged but never thrown.
 *
 * Returns how many emails were sent successfully.
 */
export async function sendNewPostNotification(
  opts: NotifyPostOptions
): Promise<{ sent: number; failed: number }> {
  const { recipients, ...templateOpts } = opts
  console.log(recipients);

  if (recipients.length === 0) {
    console.info('[email] no active subscribers — skipping notification')
    return { sent: 0, failed: 0 }
  }

  const { subject, html } = buildNewPostEmail(templateOpts)

  // Resend supports up to 100 recipients per call in batch mode.
  // We send individually so each email shows the correct To: header.
  // For large lists this should be moved to a queue / background job.
  const CHUNK_SIZE = 50

  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE)

    // Send to each recipient individually to avoid To: header leakage
    const results = await Promise.allSettled(
      chunk.map((email) => send({ to: email, subject, html }))
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.ok) {
        sent++
      } else {
        failed++
        if (result.status === 'rejected') {
          console.error('[email] chunk send rejected:', result.reason)
        }
      }
    }
  }

  console.info(
    `[email] new-post notification for "${opts.title}": ${sent} sent, ${failed} failed`
  )

  return { sent, failed }
}
