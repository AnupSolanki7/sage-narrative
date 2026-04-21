import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import Subscriber, { SubscriberSource } from '@/models/Subscriber'
import { sendWelcomeEmail } from '@/lib/email/sender'

// Basic email regex — RFC 5322–inspired, practical for production use
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const VALID_SOURCES: SubscriberSource[] = [
  'homepage',
  'article-sidebar',
  'article-bottom',
  'footer',
  'unknown',
]

function json(body: { success: boolean; message: string }, status = 200) {
  return NextResponse.json(body, { status })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // --- Validate & normalise email ---
    const rawEmail: unknown = body?.email
    if (!rawEmail || typeof rawEmail !== 'string') {
      return json({ success: false, message: 'Email is required.' }, 400)
    }

    const email = rawEmail.trim().toLowerCase()

    if (!EMAIL_REGEX.test(email)) {
      return json({ success: false, message: 'Please enter a valid email address.' }, 400)
    }

    // --- Validate source (optional) ---
    const rawSource: unknown = body?.source
    const source: SubscriberSource =
      typeof rawSource === 'string' && VALID_SOURCES.includes(rawSource as SubscriberSource)
        ? (rawSource as SubscriberSource)
        : 'unknown'

    // --- Persist ---
    await connectDB()

    try {
      await Subscriber.create({ email, source })
    } catch (err: unknown) {
      // Mongoose duplicate key error code
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        return json({ success: false, message: "You're already subscribed." }, 409)
      }
      throw err // Re-throw unexpected errors
    }

    // --- Send welcome email (non-blocking on failure) ---
    // DB record is already saved; if email fails we still respond success.
    const emailResult = await sendWelcomeEmail(email)
    if (!emailResult.ok) {
      // Log the failure but keep the response success — user is subscribed.
      console.error('[subscribe] welcome email failed:', emailResult.error)
    }

    return json({ success: true, message: 'Subscribed successfully.' }, 201)
  } catch (err) {
    console.error('[subscribe] unexpected error:', err)
    return json({ success: false, message: 'Something went wrong. Please try again.' }, 500)
  }
}
