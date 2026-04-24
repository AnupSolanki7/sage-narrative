import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { getUserPostById, toggleUserPostPublish } from '@/lib/db/posts'
import { notifyNewPostIfNeeded } from '@/lib/email/notifyNewPost'

interface Params { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireUser()

    // Capture the pre-toggle state so we only notify on draft → published.
    const existing = await getUserPostById(params.id, session.userId!)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const wasPublished = existing.status === 'published'

    const post = await toggleUserPostPublish(params.id, session.userId!)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only fire on a true draft → published transition.
    // notifyNewPostIfNeeded additionally guards against notificationSent re-sends.
    if (!wasPublished && post.status === 'published') {
      await notifyNewPostIfNeeded(post)
    }

    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
