import { NextRequest, NextResponse } from 'next/server'
import { getSession, checkAdminCredentials } from '@/lib/auth/session'
import { verifyUser } from '@/lib/db/users'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, mode } = body as {
      email: string
      password: string
      mode?: 'admin' | 'user'
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // ── Admin login (env-var credentials) ───────────────────────────────────
    if (mode === 'admin' || checkAdminCredentials(email, password)) {
      if (!checkAdminCredentials(email, password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      const session = await getSession()
      session.isLoggedIn = true
      session.adminEmail = email
      // Clear any user fields
      session.userId    = undefined
      session.userEmail = undefined
      session.username  = undefined
      session.userName  = undefined
      await session.save()
      return NextResponse.json({ ok: true, role: 'admin' })
    }

    // ── User login (MongoDB account) ─────────────────────────────────────────
    const user = await verifyUser(email, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const session = await getSession()
    session.isLoggedIn = true
    session.userId    = user._id
    session.userEmail = user.email
    session.username  = user.username
    session.userName  = user.name
    // Clear any admin fields
    session.adminEmail = undefined
    await session.save()

    return NextResponse.json({ ok: true, role: 'user', user })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
