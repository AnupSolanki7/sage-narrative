import { NextResponse } from 'next/server'
import { getSession, isUserSession } from '@/lib/auth/session'
import { getUserById } from '@/lib/db/users'

/** Returns the currently logged-in user (for client-side auth state). */
export async function GET() {
  try {
    const session = await getSession()
    if (!isUserSession(session) || !session.userId) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserById(session.userId)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
