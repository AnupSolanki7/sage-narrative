import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, sessionOptions } from '@/lib/auth/session'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Protect /dashboard/* — requires a registered user session
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await getSessionFromRequest(req, res)
    if (!session.isLoggedIn || !session.userId) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
