import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionData {
  isLoggedIn: boolean
  // ── Admin session (env-var credentials) ──────────────────────────────────
  adminEmail?: string
  // ── User session (registered accounts) ──────────────────────────────────
  userId?: string
  userEmail?: string
  username?: string
  userName?: string   // display name
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-production-32chars',
  cookieName: 'blog-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

/** For use in Server Components and Route Handlers. */
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), sessionOptions)
}

/** For use in middleware (has access to req/res). */
export async function getSessionFromRequest(
  req: NextRequest,
  res: NextResponse
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions)
}

/** Guard that throws if the caller is not an admin. */
export async function requireAdmin(): Promise<void> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.adminEmail) {
    throw new Error('Unauthorized')
  }
}

/** Guard that throws if the caller is not a logged-in registered user. */
export async function requireUser(): Promise<SessionData> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('Unauthorized')
  }
  return session
}

/** Returns true only for admin sessions. */
export function isAdminSession(session: SessionData): boolean {
  return session.isLoggedIn && !!session.adminEmail
}

/** Returns true only for user sessions. */
export function isUserSession(session: SessionData): boolean {
  return session.isLoggedIn && !!session.userId
}

// ── Admin credentials (env vars) ─────────────────────────────────────────────
export function checkAdminCredentials(email: string, password: string): boolean {
  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@sagenarrative.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme'
  return email === adminEmail && password === adminPassword
}
