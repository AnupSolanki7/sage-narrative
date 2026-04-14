import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createUser, getUserByEmail, checkUsernameAvailable } from '@/lib/db/users'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, username, email, password } = body as {
      name: string
      username: string
      email: string
      password: string
    }

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (!/^[a-z0-9_-]{3,30}$/i.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters: letters, numbers, _ or -' },
        { status: 400 }
      )
    }

    const [emailTaken, usernameFree] = await Promise.all([
      getUserByEmail(email),
      checkUsernameAvailable(username),
    ])

    if (emailTaken) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    if (!usernameFree) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    const user = await createUser({ name: name.trim(), username, email, password })

    const session = await getSession()
    session.isLoggedIn = true
    session.userId    = user._id
    session.userEmail = user.email
    session.username  = user.username
    session.userName  = user.name
    await session.save()

    return NextResponse.json({ user }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
