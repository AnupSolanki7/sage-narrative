import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { getUserById, updateUserProfile, checkUsernameAvailable } from '@/lib/db/users'

export async function GET() {
  try {
    const session = await requireUser()
    const user = await getUserById(session.userId!)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser()
    const body = await req.json()
    const { name, username, bio, avatar, socialLinks } = body as {
      name?: string
      username?: string
      bio?: string
      avatar?: string
      socialLinks?: {
        twitter?: string
        github?: string
        website?: string
        linkedin?: string
      }
    }

    if (username && !/^[a-z0-9_-]{3,30}$/i.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters: letters, numbers, _ or -' },
        { status: 400 }
      )
    }

    // Check if new username is available (if changing)
    if (username) {
      const currentUser = await getUserById(session.userId!)
      if (currentUser && currentUser.username !== username.toLowerCase()) {
        const available = await checkUsernameAvailable(username)
        if (!available) {
          return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
        }
      }
    }

    const updated = await updateUserProfile(session.userId!, {
      name,
      username,
      bio,
      avatar,
      socialLinks,
    })

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
